from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.database import get_session
from campus_pilot.core.models import Assignment, Course, User
from campus_pilot.core.security import current_user, require_csrf

router = APIRouter(prefix="/assignments", tags=["assignments"])


class AssignmentCreate(BaseModel):
    course_id: str
    title: str = Field(min_length=2, max_length=240)
    due_at: datetime
    weight: float | None = Field(default=None, ge=0, le=100)


class AssignmentView(AssignmentCreate):
    id: str
    status: str


class AssignmentPage(BaseModel):
    items: list[AssignmentView]
    page: int
    page_size: int
    total: int


@router.get("", response_model=AssignmentPage)
async def list_assignments(
    page: int = 1,
    page_size: int = 25,
    course_id: str | None = Query(default=None),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> AssignmentPage:
    filters = [Assignment.user_id == user.id]
    if course_id:
        filters.append(Assignment.course_id == course_id)
    query = select(Assignment).where(*filters).order_by(Assignment.due_at)
    page_size = min(max(page_size, 1), 100)
    items = list(
        (await session.scalars(query.offset((max(page, 1) - 1) * page_size).limit(page_size))).all()
    )
    total = await session.scalar(select(func.count()).select_from(Assignment).where(*filters)) or 0
    return AssignmentPage(
        items=[AssignmentView.model_validate(item, from_attributes=True) for item in items],
        page=max(page, 1),
        page_size=page_size,
        total=total,
    )


@router.post(
    "",
    response_model=AssignmentView,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_csrf)],
)
async def create_assignment(
    payload: AssignmentCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> AssignmentView:
    course = await session.scalar(
        select(Course).where(Course.id == payload.course_id, Course.user_id == user.id)
    )
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    assignment = Assignment(user_id=user.id, **payload.model_dump())
    session.add(assignment)
    await session.commit()
    return AssignmentView.model_validate(assignment, from_attributes=True)
