import hashlib
import time

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.ai.provider import provider_for
from campus_pilot.core.config import Settings
from campus_pilot.core.models import (
    AIExecution,
    Document,
    DocumentPage,
    ExtractedField,
    ExtractionJob,
)
from campus_pilot.core.telemetry import (
    ai_latency,
    document_processing_duration,
    extraction_failures,
)
from campus_pilot.documents.pipeline import extract_pdf_pages
from campus_pilot.documents.storage import document_store


async def process_extraction_job(job_id: str, session: AsyncSession, settings: Settings) -> None:
    started = time.perf_counter()
    job = await session.scalar(
        select(ExtractionJob).where(ExtractionJob.id == job_id).with_for_update()
    )
    if job is None or job.status in {"requires_review", "completed"}:
        return
    document = await session.scalar(select(Document).where(Document.id == job.document_id))
    if document is None:
        return
    job.status = "processing"
    job.attempts += 1
    document.status = "processing"
    await session.commit()
    try:
        content = await document_store(settings).read(document.object_key)
        pages = extract_pdf_pages(content)
        await session.execute(delete(DocumentPage).where(DocumentPage.document_id == document.id))
        for number, text in enumerate(pages, start=1):
            session.add(
                DocumentPage(
                    document_id=document.id, page_number=number, extracted_text=text, used_ocr=False
                )
            )
        provider = provider_for(settings)
        ai_started = time.perf_counter()
        fields = await provider.extract_document(pages)
        latency = time.perf_counter() - ai_started
        ai_latency.labels(operation="extract_document", provider=provider.name).observe(latency)
        await session.execute(
            delete(ExtractedField).where(ExtractedField.extraction_job_id == job.id)
        )
        for field in fields:
            session.add(ExtractedField(extraction_job_id=job.id, **field.model_dump()))
        session.add(
            AIExecution(
                user_id=job.user_id,
                operation="extract_document",
                provider=provider.name,
                model="deterministic-mock" if provider.name == "mock" else "provider-managed",
                latency_ms=int(latency * 1000),
                schema_valid=True,
                request_fingerprint=hashlib.sha256(document.sha256.encode()).hexdigest(),
            )
        )
        job.status = "requires_review"
        document.status = "requires_review"
        job.error_code = None
        job.error_detail = None
        await session.commit()
    except Exception as error:
        await session.rollback()
        job = await session.scalar(select(ExtractionJob).where(ExtractionJob.id == job_id))
        document = (
            await session.scalar(select(Document).where(Document.id == job.document_id))
            if job
            else None
        )
        if job:
            job.status = "queued" if job.attempts < 3 else "failed"
            job.error_code = type(error).__name__
            job.error_detail = str(error)[:1000]
        if document:
            document.status = job.status if job else "failed"
        extraction_failures.inc()
        await session.commit()
        raise
    finally:
        document_processing_duration.observe(time.perf_counter() - started)
