from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.database import get_session
from campus_pilot.core.models import ProgressEntry, StudySession, User
from campus_pilot.core.security import current_user, require_csrf

router = APIRouter(prefix="/progress", tags=["progress"])


class CompletionRequest(BaseModel):
    study_session_id: str
    actual_minutes: int = Field(ge=1, le=720)
    note: str | None = Field(default=None, max_length=2000)


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_csrf)])
async def complete_session(
    payload: CompletionRequest,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, object]:
    study_session = await session.scalar(
        select(StudySession).where(
            StudySession.id == payload.study_session_id, StudySession.user_id == user.id
        )
    )
    if study_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")
    existing = await session.scalar(
        select(ProgressEntry).where(
            ProgressEntry.study_session_id == study_session.id, ProgressEntry.user_id == user.id
        )
    )
    if existing:
        return {"id": existing.id, "completed_at": existing.completed_at}
    entry = ProgressEntry(
        user_id=user.id,
        study_session_id=study_session.id,
        completed_at=datetime.now(UTC),
        actual_minutes=payload.actual_minutes,
        note=payload.note,
    )
    study_session.status = "completed"
    session.add(entry)
    await session.commit()
    return {"id": entry.id, "completed_at": entry.completed_at}


@router.get("/summary")
async def progress_summary(
    user: User = Depends(current_user), session: AsyncSession = Depends(get_session)
) -> dict[str, object]:
    completed = (
        await session.scalar(
            select(func.count()).select_from(ProgressEntry).where(ProgressEntry.user_id == user.id)
        )
        or 0
    )
    minutes = (
        await session.scalar(
            select(func.coalesce(func.sum(ProgressEntry.actual_minutes), 0)).where(
                ProgressEntry.user_id == user.id
            )
        )
        or 0
    )
    planned = (
        await session.scalar(
            select(func.count()).select_from(StudySession).where(StudySession.user_id == user.id)
        )
        or 0
    )
    return {
        "planned_sessions": planned,
        "completed_sessions": completed,
        "focused_minutes": minutes,
        "completion_rate": completed / planned if planned else 0,
    }
