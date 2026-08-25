from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.database import get_session
from campus_pilot.core.models import CalendarEvent, User
from campus_pilot.core.security import current_user

router = APIRouter(prefix="/calendar", tags=["calendar"])


class CalendarEventView(BaseModel):
    id: str
    title: str
    kind: str
    starts_at: datetime
    ends_at: datetime | None
    confirmed: bool
    source_type: str | None
    source_id: str | None


@router.get("", response_model=list[CalendarEventView])
async def get_calendar(
    from_at: datetime,
    to_at: datetime,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> list[CalendarEventView]:
    events = list(
        (
            await session.scalars(
                select(CalendarEvent)
                .where(
                    CalendarEvent.user_id == user.id,
                    CalendarEvent.starts_at >= from_at,
                    CalendarEvent.starts_at <= to_at,
                )
                .order_by(CalendarEvent.starts_at)
            )
        ).all()
    )
    return [CalendarEventView.model_validate(event, from_attributes=True) for event in events]
