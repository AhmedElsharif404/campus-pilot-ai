import re
from datetime import UTC, date, datetime

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
    Semester,
    User,
)
from campus_pilot.core.security import current_user, require_csrf

router = APIRouter(prefix="/extractions", tags=["extractions"])

_MONTHS = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}
_DATE_FRAGMENT = re.compile(
    r"\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|"
    r"Dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b",
    re.IGNORECASE,
)
_TIME_FRAGMENT = re.compile(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", re.IGNORECASE)


def academic_datetime(
    text: str, starts_on: date, ends_on: date, *, allow_end_of_day: bool
) -> datetime | None:
    date_match = _DATE_FRAGMENT.search(text)
    if date_match is None:
        return None
    month = _MONTHS[date_match.group(1)[:3].lower()]
    day = int(date_match.group(2))
    explicit_year = int(date_match.group(3)) if date_match.group(3) else None
    candidate: date | None = None
    for year in [explicit_year] if explicit_year else sorted({starts_on.year, ends_on.year}):
        try:
            parsed = date(year, month, day)
        except ValueError:
            continue
        if starts_on <= parsed <= ends_on:
            candidate = parsed
            break
    if candidate is None:
        return None
    time_match = _TIME_FRAGMENT.search(text)
    if time_match:
        hour = int(time_match.group(1)) % 12
        if time_match.group(3).lower() == "pm":
            hour += 12
        minute = int(time_match.group(2) or 0)
    elif allow_end_of_day:
        hour, minute = 23, 59
    else:
        return None
    return datetime(candidate.year, candidate.month, candidate.day, hour, minute, tzinfo=UTC)


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
    semester = await session.scalar(
        select(Semester).where(Semester.id == document.semester_id, Semester.user_id == user.id)
    )
    if semester is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Semester not found")
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
    for field in fields:
        if field.entity_type == "assignment":
            due_at = academic_datetime(
                value(field), semester.starts_on, semester.ends_on, allow_end_of_day=True
            )
            if due_at is None:
                continue
            session.add(
                Assignment(
                    user_id=user.id,
                    course_id=course.id,
                    title=value(field)[:240],
                    due_at=due_at,
                    source_field_id=field.id,
                )
            )
        elif field.entity_type == "exam":
            starts_at = academic_datetime(
                value(field), semester.starts_on, semester.ends_on, allow_end_of_day=False
            )
            if starts_at is None:
                continue
            session.add(
                Exam(
                    user_id=user.id,
                    course_id=course.id,
                    title=value(field)[:240],
                    starts_at=starts_at,
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
