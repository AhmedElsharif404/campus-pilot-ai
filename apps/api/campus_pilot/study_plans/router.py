from datetime import date, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.ai.provider import provider_for
from campus_pilot.core.audit import record_audit
from campus_pilot.core.config import Settings, get_settings
from campus_pilot.core.database import get_session
from campus_pilot.core.models import Semester, StudyPlan, StudySession, User
from campus_pilot.core.security import current_user, require_csrf

router = APIRouter(prefix="/study-plans", tags=["study-plans"])


class PlanRequest(BaseModel):
    semester_id: str
    starts_on: date
    ends_on: date
    available_windows: list[dict[str, str]] = Field(default_factory=list, max_length=60)


class SessionUpdate(BaseModel):
    starts_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=20, le=180)
    status: str | None = Field(default=None, pattern="^(planned|completed|skipped)$")


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_csrf)])
async def create_plan(
    payload: PlanRequest,
    request: Request,
    idempotency_key: str = Header(alias="Idempotency-Key", min_length=8, max_length=120),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict[str, object]:
    existing = await session.scalar(
        select(StudyPlan).where(
            StudyPlan.user_id == user.id, StudyPlan.idempotency_key == idempotency_key
        )
    )
    if existing:
        return {"id": existing.id, "status": existing.status}
    semester = await session.scalar(
        select(Semester).where(Semester.id == payload.semester_id, Semester.user_id == user.id)
    )
    if semester is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Semester not found")
    provider = provider_for(settings)
    proposals = await provider.create_study_plan(payload.model_dump(mode="json"))
    plan = StudyPlan(
        user_id=user.id,
        semester_id=semester.id,
        starts_on=payload.starts_on,
        ends_on=payload.ends_on,
        status="draft",
        rationale="Balanced around confirmed events, nearest deadlines, and declared availability.",
        idempotency_key=idempotency_key,
    )
    session.add(plan)
    await session.flush()
    for proposal in proposals:
        session.add(StudySession(user_id=user.id, study_plan_id=plan.id, **proposal.model_dump()))
    await record_audit(
        session,
        request,
        "study_plan.generated",
        "study_plan",
        plan.id,
        user.id,
        {"provider": provider.name, "sessions": len(proposals)},
    )
    await session.commit()
    return {"id": plan.id, "status": plan.status, "sessions": len(proposals)}


@router.patch("/sessions/{session_id}", dependencies=[Depends(require_csrf)])
async def update_session(
    session_id: str,
    payload: SessionUpdate,
    request: Request,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    study_session = await session.scalar(
        select(StudySession).where(StudySession.id == session_id, StudySession.user_id == user.id)
    )
    if study_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(study_session, key, value)
    study_session.user_edited = True
    await record_audit(
        session, request, "study_session.updated", "study_session", study_session.id, user.id
    )
    await session.commit()
    return {
        "id": study_session.id,
        "status": study_session.status,
        "starts_at": study_session.starts_at,
    }
