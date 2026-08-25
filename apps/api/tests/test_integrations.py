import os

import pytest
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import create_async_engine


@pytest.mark.integration
async def test_postgres_connection() -> None:
    url = os.getenv("TEST_POSTGRES_URL")
    if not url:
        pytest.skip("TEST_POSTGRES_URL not configured")
    engine = create_async_engine(url)
    async with engine.connect() as connection:
        assert (await connection.exec_driver_sql("SELECT 1")).scalar_one() == 1
    await engine.dispose()


@pytest.mark.integration
async def test_redis_job_round_trip() -> None:
    url = os.getenv("TEST_REDIS_URL")
    if not url:
        pytest.skip("TEST_REDIS_URL not configured")
    redis = Redis.from_url(url, decode_responses=True)
    key = "campus-pilot:test-jobs"
    await redis.delete(key)
    await redis.rpush(key, "job-1")
    assert await redis.lpop(key) == "job-1"
    await redis.aclose()
