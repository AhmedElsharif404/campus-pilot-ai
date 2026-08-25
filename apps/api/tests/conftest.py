import os
from collections.abc import AsyncIterator

os.environ["CAMPUS_DATABASE_URL"] = "sqlite+aiosqlite:///./test_campus_pilot.sqlite3"
os.environ["CAMPUS_AUTO_CREATE_SCHEMA"] = "false"
os.environ["CAMPUS_JWT_SECRET"] = "test-secret-that-is-long-enough-for-hs256-tests"

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from campus_pilot.core.config import get_settings
from campus_pilot.core.database import SessionFactory, engine
from campus_pilot.core.models import Base, User
from campus_pilot.core.security import create_access_token, hash_password
from campus_pilot.main import app


@pytest_asyncio.fixture(autouse=True)
async def database() -> AsyncIterator[None]:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncIterator[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client


@pytest_asyncio.fixture
async def users() -> tuple[User, User]:
    async with SessionFactory() as session:
        first = User(
            email="first@example.edu",
            display_name="First Student",
            password_hash=hash_password("A-secure-password-123"),
        )
        second = User(
            email="second@example.edu",
            display_name="Second Student",
            password_hash=hash_password("Another-secure-password-456"),
        )
        session.add_all([first, second])
        await session.commit()
        return first, second


def authorization(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id, get_settings())}"}
