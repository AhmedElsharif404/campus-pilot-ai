from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.database import get_session
from campus_pilot.core.models import Course, User
from campus_pilot.core.security import current_user

router = APIRouter(prefix="/courses", tags=["courses"])


class CourseView(BaseModel):
    id: str
    semester_id: str
    code: str
    name: str
    color: str
    summary: str | None


class CoursePage(BaseModel):
    items: list[CourseView]
    page: int
    page_size: int
    total: int


@router.get("", response_model=CoursePage)
async def list_courses(
    semester_id: str | None = Query(default=None),
    page: int = 1,
    page_size: int = 25,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> CoursePage:
    filters = [Course.user_id == user.id]
    if semester_id:
        filters.append(Course.semester_id == semester_id)
    query = select(Course).where(*filters).order_by(Course.code)
    page_size = min(max(page_size, 1), 100)
    items = list(
        (await session.scalars(query.offset((max(page, 1) - 1) * page_size).limit(page_size))).all()
    )
    total = await session.scalar(select(func.count()).select_from(Course).where(*filters)) or 0
    return CoursePage(
        items=[CourseView.model_validate(item, from_attributes=True) for item in items],
        page=max(page, 1),
        page_size=page_size,
        total=total,
    )


@router.get("/{course_id}", response_model=CourseView)
async def get_course(
    course_id: str, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)
) -> CourseView:
    course = await session.scalar(
        select(Course).where(Course.id == course_id, Course.user_id == user.id)
    )
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return CourseView.model_validate(course, from_attributes=True)
