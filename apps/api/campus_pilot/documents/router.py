import hashlib
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, Header, HTTPException, Request, UploadFile, status
from pydantic import BaseModel
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.audit import record_audit
from campus_pilot.core.config import Settings, get_settings
from campus_pilot.core.database import get_session
from campus_pilot.core.models import Document, ExtractionJob, Semester, User
from campus_pilot.core.security import current_user, require_csrf
from campus_pilot.documents.pipeline import UnsafeDocumentError, validate_pdf
from campus_pilot.documents.storage import document_store

router = APIRouter(prefix="/documents", tags=["documents"])
logger = logging.getLogger(__name__)


class DocumentUploadView(BaseModel):
    document_id: str
    extraction_job_id: str
    status: str


@router.post(
    "",
    response_model=DocumentUploadView,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_csrf)],
)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    semester_id: str | None = None,
    idempotency_key: str = Header(alias="Idempotency-Key", min_length=8, max_length=120),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> DocumentUploadView:
    existing = await session.scalar(
        select(ExtractionJob).where(
            ExtractionJob.user_id == user.id, ExtractionJob.idempotency_key == idempotency_key
        )
    )
    if existing:
        return DocumentUploadView(
            document_id=existing.document_id, extraction_job_id=existing.id, status=existing.status
        )
    if semester_id is None:
        semester = await session.scalar(
            select(Semester)
            .where(Semester.user_id == user.id, Semester.is_current.is_(True))
            .order_by(Semester.starts_on.desc())
        )
    else:
        semester = await session.scalar(
            select(Semester).where(Semester.id == semester_id, Semester.user_id == user.id)
        )
    if semester is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Create a semester before uploading"
        )
    content = await file.read(settings.upload_max_bytes + 1)
    try:
        validate_pdf(content, file.content_type, settings.upload_max_bytes)
    except UnsafeDocumentError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)
        ) from error
    digest = hashlib.sha256(content).hexdigest()
    safe_name = Path(file.filename or "syllabus.pdf").name[:255]
    object_key = f"{user.id}/{digest}.pdf"
    path = await document_store(settings).put_quarantined(object_key, content)
    document = Document(
        user_id=user.id,
        semester_id=semester.id,
        original_name=safe_name,
        mime_type="application/pdf",
        byte_size=len(content),
        sha256=digest,
        object_key=path,
        status="queued",
    )
    session.add(document)
    await session.flush()
    job = ExtractionJob(
        user_id=user.id, document_id=document.id, status="queued", idempotency_key=idempotency_key
    )
    session.add(job)
    await session.flush()
    await record_audit(
        session,
        request,
        "document.uploaded",
        "document",
        document.id,
        user.id,
        {"sha256_prefix": digest[:12], "bytes": len(content)},
    )
    await session.commit()
    try:
        redis = Redis.from_url(settings.redis_url, decode_responses=True)
        await redis.rpush("campus-pilot:extraction-jobs", job.id)
        await redis.aclose()
    except Exception as error:
        # The committed job remains queued for a worker retry; request success is not rolled back.
        logger.warning(
            "extraction job could not be queued", extra={"job_id": job.id, "error": str(error)}
        )
    return DocumentUploadView(document_id=document.id, extraction_job_id=job.id, status=job.status)


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    document = await session.scalar(
        select(Document).where(Document.id == document_id, Document.user_id == user.id)
    )
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return {
        "id": document.id,
        "name": document.original_name,
        "status": document.status,
        "created_at": document.created_at,
    }
