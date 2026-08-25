from datetime import UTC, date, datetime

from httpx import AsyncClient

from campus_pilot.core.database import SessionFactory
from campus_pilot.core.models import Course, Document, Semester
from tests.conftest import authorization


async def test_cross_user_course_document_and_assignment_access_is_denied(
    client: AsyncClient, users: tuple
) -> None:
    owner, attacker = users
    async with SessionFactory() as session:
        semester = Semester(
            user_id=owner.id,
            name="Fall",
            institution="University",
            starts_on=date(2026, 8, 1),
            ends_on=date(2026, 12, 1),
        )
        session.add(semester)
        await session.flush()
        course = Course(user_id=owner.id, semester_id=semester.id, code="BIO 101", name="Biology")
        document = Document(
            user_id=owner.id,
            semester_id=semester.id,
            original_name="private.pdf",
            mime_type="application/pdf",
            byte_size=10,
            sha256="a" * 64,
            object_key="quarantine/private.pdf",
        )
        session.add_all([course, document])
        await session.commit()

    assert (
        await client.get(f"/api/v1/courses/{course.id}", headers=authorization(attacker))
    ).status_code == 404
    assert (
        await client.get(f"/api/v1/documents/{document.id}", headers=authorization(attacker))
    ).status_code == 404
    response = await client.post(
        "/api/v1/assignments",
        headers=authorization(attacker),
        json={
            "course_id": course.id,
            "title": "Intrusion",
            "due_at": datetime.now(UTC).isoformat(),
            "weight": 5,
        },
    )
    assert response.status_code == 404


async def test_owner_can_access_course(client: AsyncClient, users: tuple) -> None:
    owner, _ = users
    async with SessionFactory() as session:
        semester = Semester(
            user_id=owner.id,
            name="Fall",
            institution="University",
            starts_on=date(2026, 8, 1),
            ends_on=date(2026, 12, 1),
        )
        session.add(semester)
        await session.flush()
        course = Course(user_id=owner.id, semester_id=semester.id, code="BIO 101", name="Biology")
        session.add(course)
        await session.commit()
    response = await client.get(f"/api/v1/courses/{course.id}", headers=authorization(owner))
    assert response.status_code == 200
    assert response.json()["name"] == "Biology"
