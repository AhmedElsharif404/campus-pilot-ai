from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from campus_pilot.assignments.router import router as assignments_router
from campus_pilot.calendar.router import router as calendar_router
from campus_pilot.core.config import get_settings
from campus_pilot.core.database import create_schema, engine
from campus_pilot.core.middleware import RateLimitMiddleware, SecurityHeadersMiddleware
from campus_pilot.core.otel import configure_telemetry
from campus_pilot.courses.router import router as courses_router
from campus_pilot.documents.router import router as documents_router
from campus_pilot.extraction.router import router as extraction_router
from campus_pilot.identity.router import router as identity_router
from campus_pilot.progress.router import router as progress_router
from campus_pilot.semesters.router import router as semesters_router
from campus_pilot.study_plans.router import router as study_plans_router

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    if settings.auto_create_schema:
        await create_schema()
    yield
    await engine.dispose()


app = FastAPI(
    title="CampusPilot API",
    version="1.0.0",
    description="Versioned API for privacy-aware, human-confirmed academic planning.",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.environment != "production" else None,
    redoc_url=None,
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, limit=120, window_seconds=60)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "X-CSRF-Token"],
)
configure_telemetry(app, engine, settings)

api_prefix = "/api/v1"
for router in [
    identity_router,
    semesters_router,
    courses_router,
    documents_router,
    extraction_router,
    assignments_router,
    calendar_router,
    study_plans_router,
    progress_router,
]:
    app.include_router(router, prefix=api_prefix)


@app.get("/health/live", tags=["health"])
async def live() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"])
async def ready() -> dict[str, str]:
    async with engine.connect() as connection:
        await connection.exec_driver_sql("SELECT 1")
    return {"status": "ready"}


@app.get("/metrics", include_in_schema=False)
async def metrics() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
