from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from sqlalchemy.ext.asyncio import AsyncEngine

from campus_pilot.core.config import Settings


def configure_telemetry(app: FastAPI, engine: AsyncEngine, settings: Settings) -> None:
    provider = TracerProvider(
        resource=Resource.create(
            {"service.name": "campus-pilot-api", "deployment.environment": settings.environment}
        )
    )
    if settings.otlp_endpoint:
        provider.add_span_processor(
            BatchSpanProcessor(
                OTLPSpanExporter(
                    endpoint=settings.otlp_endpoint,
                    insecure=not settings.otlp_endpoint.startswith("https://"),
                )
            )
        )
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(
        app, tracer_provider=provider, excluded_urls="/health/live,/metrics"
    )
    SQLAlchemyInstrumentor().instrument(engine=engine.sync_engine, tracer_provider=provider)
