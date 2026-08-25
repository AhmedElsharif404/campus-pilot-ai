from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.audit import record_audit
from campus_pilot.core.database import get_session
from campus_pilot.core.models import Semester, User
from campus_pilot.core.security import current_user, require_csrf

router = APIRouter(prefix="/semesters", tags=["semesters"])


class SemesterCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    institution: str = Field(min_length=2, max_length=180)
    starts_on: date
    ends_on: date

    @model_validator(mode="after")
    def dates_are_ordered(self) -> "SemesterCreate":
        if self.ends_on <= self.starts_on:
            raise ValueError("ends_on must be after starts_on")
        return self


class SemesterView(SemesterCreate):
    id: str
    is_current: bool


class SemesterPage(BaseModel):
    items: list[SemesterView]
    page: int
    page_size: int
    total: int


@router.get("", response_model=SemesterPage)
async def list_semesters(
    page: int = 1,
    page_size: int = 25,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> SemesterPage:
    page_size = min(max(page_size, 1), 100)
    page = max(page, 1)
    query = select(Semester).where(Semester.user_id == user.id).order_by(Semester.starts_on.desc())
    items = list(
        (await session.scalars(query.offset((page - 1) * page_size).limit(page_size))).all()
    )
    total = (
        await session.scalar(
            select(func.count()).select_from(Semester).where(Semester.user_id == user.id)
        )
        or 0
    )
    return SemesterPage(
        items=[SemesterView.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.post(
    "",
    response_model=SemesterView,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_csrf)],
)
async def create_semester(
    payload: SemesterCreate,
    request: Request,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> SemesterView:
    semester = Semester(user_id=user.id, **payload.model_dump())
    session.add(semester)
    await session.flush()
    await record_audit(session, request, "semester.created", "semester", semester.id, user.id)
    await session.commit()
    return SemesterView.model_validate(semester, from_attributes=True)


@router.get("/{semester_id}", response_model=SemesterView)
async def get_semester(
    semester_id: str,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> SemesterView:
    semester = await session.scalar(
        select(Semester).where(Semester.id == semester_id, Semester.user_id == user.id)
    )
    if semester is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Semester not found")
    return SemesterView.model_validate(semester, from_attributes=True)
