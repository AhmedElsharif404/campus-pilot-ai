from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.audit import record_audit
from campus_pilot.core.database import get_session
from campus_pilot.core.models import (
    Assignment,
    Course,
    Document,
    Exam,
    ExtractedField,
    ExtractionJob,
    Instructor,
    User,
)
from campus_pilot.core.security import current_user, require_csrf

router = APIRouter(prefix="/extractions", tags=["extractions"])


class FieldView(BaseModel):
    id: str
    entity_type: str
    field_name: str
    extracted_value: str
    approved_value: str | None
    confidence: float
    page_number: int
    source_text_reference: str
    status: str


class ExtractionView(BaseModel):
    id: str
    document_id: str
    document_name: str
    status: str
    fields: list[FieldView]
    error_code: str | None


class FieldDecision(BaseModel):
    status: str = Field(pattern="^(accepted|rejected|edited)$")
    approved_value: str | None = Field(default=None, max_length=2000)


async def owned_job(job_id: str, user_id: str, session: AsyncSession) -> ExtractionJob:
    job = await session.scalar(
        select(ExtractionJob).where(ExtractionJob.id == job_id, ExtractionJob.user_id == user_id)
    )
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction not found")
    return job


@router.get("/{job_id}", response_model=ExtractionView)
async def get_extraction(
    job_id: str, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)
) -> ExtractionView:
    job = await owned_job(job_id, user.id, session)
    document = await session.scalar(
        select(Document).where(Document.id == job.document_id, Document.user_id == user.id)
    )
    fields = list(
        (
            await session.scalars(
                select(ExtractedField)
                .where(ExtractedField.extraction_job_id == job.id)
                .order_by(ExtractedField.page_number, ExtractedField.entity_type)
            )
        ).all()
    )
    return ExtractionView(
        id=job.id,
        document_id=job.document_id,
        document_name=document.original_name if document else "Unknown document",
        status=job.status,
        fields=[FieldView.model_validate(field, from_attributes=True) for field in fields],
        error_code=job.error_code,
    )


@router.patch(
    "/{job_id}/fields/{field_id}", response_model=FieldView, dependencies=[Depends(require_csrf)]
)
async def decide_field(
    job_id: str,
    field_id: str,
    payload: FieldDecision,
    request: Request,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> FieldView:
    job = await owned_job(job_id, user.id, session)
    field = await session.scalar(
        select(ExtractedField).where(
            ExtractedField.id == field_id, ExtractedField.extraction_job_id == job.id
        )
    )
    if field is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found")
    if payload.status == "edited" and not payload.approved_value:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Edited fields require approved_value",
        )
    field.status = payload.status
    field.approved_value = (
        payload.approved_value
        if payload.status == "edited"
        else field.extracted_value
        if payload.status == "accepted"
        else None
    )
    await record_audit(
        session,
        request,
        f"extraction.field_{payload.status}",
        "extracted_field",
        field.id,
        user.id,
        {"job_id": job.id},
    )
    await session.commit()
    return FieldView.model_validate(field, from_attributes=True)


@router.post(
    "/{job_id}/confirm", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_csrf)]
)
async def confirm_extraction(
    job_id: str,
    request: Request,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    job = await owned_job(job_id, user.id, session)
    pending = await session.scalar(
        select(ExtractedField.id)
        .where(ExtractedField.extraction_job_id == job.id, ExtractedField.status == "pending")
        .limit(1)
    )
    if pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Every field needs a review decision"
        )
    document = await session.scalar(
        select(Document).where(Document.id == job.document_id, Document.user_id == user.id)
    )
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    fields = list(
        (
            await session.scalars(
                select(ExtractedField).where(
                    ExtractedField.extraction_job_id == job.id,
                    ExtractedField.status.in_(["accepted", "edited"]),
                )
            )
        ).all()
    )

    def value(field: ExtractedField) -> str:
        return field.approved_value or field.extracted_value

    course_name = next(
        (value(field) for field in fields if field.entity_type == "course"),
        document.original_name.removesuffix(".pdf"),
    )
    course = Course(
        user_id=user.id,
        semester_id=document.semester_id,
        code="COURSE",
        name=course_name[:200],
        color="blue",
    )
    session.add(course)
    await session.flush()
    instructor_name = next(
        (value(field) for field in fields if field.entity_type == "instructor"), None
    )
    if instructor_name:
        session.add(Instructor(course_id=course.id, name=instructor_name[:160]))
    fallback_due = datetime.now(UTC) + timedelta(days=7)
    for field in fields:
        if field.entity_type == "assignment":
            session.add(
                Assignment(
                    user_id=user.id,
                    course_id=course.id,
                    title=value(field)[:240],
                    due_at=fallback_due,
                    source_field_id=field.id,
                )
            )
        elif field.entity_type == "exam":
            session.add(
                Exam(
                    user_id=user.id,
                    course_id=course.id,
                    title=value(field)[:240],
                    starts_at=fallback_due,
                    source_field_id=field.id,
                )
            )
    job.status = "completed"
    document.status = "completed"
    await record_audit(
        session,
        request,
        "extraction.confirmed",
        "course",
        course.id,
        user.id,
        {"job_id": job.id, "accepted_fields": len(fields)},
    )
    await session.commit()
    return {"course_id": course.id, "status": "created"}
