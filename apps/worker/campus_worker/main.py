import asyncio
import logging

from redis.asyncio import Redis

from campus_pilot.core.config import get_settings
from campus_pilot.core.database import SessionFactory
from campus_pilot.core.telemetry import job_queue_depth
from campus_pilot.extraction.service import process_extraction_job

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("campus-pilot-worker")
settings = get_settings()


async def run() -> None:
    redis = Redis.from_url(settings.redis_url, decode_responses=True)
    logger.info("worker ready")
    try:
        while True:
            job_queue_depth.set(await redis.llen("campus-pilot:extraction-jobs"))
            item = await redis.blpop("campus-pilot:extraction-jobs", timeout=5)
            if item is None:
                continue
            _, job_id = item
            try:
                async with SessionFactory() as session:
                    await process_extraction_job(job_id, session, settings)
            except Exception:
                logger.exception("extraction failed", extra={"job_id": job_id})
                async with SessionFactory() as session:
                    from campus_pilot.core.models import ExtractionJob
                    from sqlalchemy import select

                    job = await session.scalar(select(ExtractionJob).where(ExtractionJob.id == job_id))
                    if job and job.status == "queued":
                        await redis.rpush("campus-pilot:extraction-jobs", job_id)
    finally:
        await redis.aclose()


if __name__ == "__main__":
    asyncio.run(run())
