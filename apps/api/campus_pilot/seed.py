import asyncio
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import select

from campus_pilot.core.database import SessionFactory, create_schema
from campus_pilot.core.models import (
    Assignment,
    CalendarEvent,
    Course,
    CourseMeeting,
    Instructor,
    Semester,
    StudyPlan,
    StudySession,
    User,
)
from campus_pilot.core.security import hash_password

DEMO_EMAIL = "alex@northbridge.edu"
DEMO_PASSWORD = "CampusPilotDemo!2026"


async def seed() -> None:
    await create_schema()
    async with SessionFactory() as session:
        if await session.scalar(select(User).where(User.email == DEMO_EMAIL)):
            return
        user = User(
            email=DEMO_EMAIL, display_name="Alex Rivera", password_hash=hash_password(DEMO_PASSWORD)
        )
        session.add(user)
        await session.flush()
        semester = Semester(
            user_id=user.id,
            name="Fall 2026",
            institution="Northbridge University",
            starts_on=date(2026, 8, 31),
            ends_on=date(2026, 12, 18),
            is_current=True,
        )
        session.add(semester)
        await session.flush()
        course_data = [
            ("BIO 214", "Cell Biology", "Dr. Maya Chen", "green"),
            ("HIST 238", "Cities & Memory", "Prof. Julian Reed", "blue"),
            ("STAT 201", "Applied Statistics", "Dr. Nia Brooks", "amber"),
            ("ENGL 170", "Writing the Natural World", "Prof. Eli Mora", "red"),
        ]
        courses: list[Course] = []
        for index, (code, name, instructor, color) in enumerate(course_data):
            course = Course(
                user_id=user.id,
                semester_id=semester.id,
                code=code,
                name=name,
                color=color,
                summary=f"Demo course workspace for {name}.",
            )
            session.add(course)
            await session.flush()
            courses.append(course)
            session.add(Instructor(course_id=course.id, name=instructor))
            session.add(
                CourseMeeting(
                    course_id=course.id,
                    weekday=index % 5,
                    starts_at=datetime.strptime("09:30", "%H:%M").time(),
                    ends_at=datetime.strptime("10:45", "%H:%M").time(),
                    location="Northbridge campus",
                )
            )
        now = datetime(2026, 9, 16, 12, 0, tzinfo=UTC)
        assignments = [
            Assignment(
                user_id=user.id,
                course_id=courses[1].id,
                title="Reading response: urban archives",
                due_at=now + timedelta(hours=10),
                weight=5,
            ),
            Assignment(
                user_id=user.id,
                course_id=courses[0].id,
                title="Cell membrane lab report",
                due_at=now + timedelta(days=2, hours=12),
                weight=12,
            ),
            Assignment(
                user_id=user.id,
                course_id=courses[2].id,
                title="Problem set 4",
                due_at=now + timedelta(days=3),
                weight=4,
            ),
        ]
        session.add_all(assignments)
        await session.flush()
        for assignment in assignments:
            session.add(
                CalendarEvent(
                    user_id=user.id,
                    semester_id=semester.id,
                    title=assignment.title,
                    kind="assignment",
                    starts_at=assignment.due_at,
                    confirmed=True,
                    source_type="assignment",
                    source_id=assignment.id,
                )
            )
        plan = StudyPlan(
            user_id=user.id,
            semester_id=semester.id,
            starts_on=date(2026, 9, 14),
            ends_on=date(2026, 9, 20),
            status="active",
            rationale="Seeded realistic study week.",
            idempotency_key="demo-study-plan",
        )
        session.add(plan)
        await session.flush()
        session.add_all(
            [
                StudySession(
                    user_id=user.id,
                    study_plan_id=plan.id,
                    assignment_id=assignments[2].id,
                    title="Problem set 4 · questions 1–6",
                    starts_at=now + timedelta(hours=3),
                    duration_minutes=45,
                    rationale="Starts the Friday deadline early",
                ),
                StudySession(
                    user_id=user.id,
                    study_plan_id=plan.id,
                    assignment_id=assignments[1].id,
                    title="Lab report · draft results section",
                    starts_at=now + timedelta(hours=7),
                    duration_minutes=50,
                    rationale="High-priority weighted work",
                ),
            ]
        )
        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
