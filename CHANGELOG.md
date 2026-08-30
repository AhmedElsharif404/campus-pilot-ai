# Changelog

All notable changes follow Keep a Changelog conventions. This project uses semantic versioning after `1.0.0`.

## [Unreleased]

### Added

- Academic Editorial Next.js PWA covering landing, auth, onboarding, upload, processing, grounded review, semester, course, calendar, assignments, study planning, today, progress, and settings
- FastAPI modular monolith with explicit domain boundaries and versioned REST endpoints
- PostgreSQL data model with pgvector-enabled development image, Alembic baseline, Redis worker, and S3/MinIO document quarantine
- Mock and real AI provider adapters with structured schemas and document-injection boundary
- Human-confirmed extraction decisions and canonical-data provenance
- Argon2 authentication, CSRF, object authorization, rate limits, secure headers, audit trail, and security CI
- OpenTelemetry instrumentation and Prometheus metrics
- Unit, API, authorization, document, schema, integration, E2E, accessibility, responsive, offline, and AI eval coverage
- Docker Compose development environment and deterministic demo seed

### Fixed

- Made API-unavailable upload fallback explicit and opt-in instead of silently presenting synthetic success
- Added CSRF propagation for document upload and CSRF enforcement for logout
- Replaced arbitrary fallback deadlines with semester-bounded date normalization that refuses ambiguous exam times
- Versioned real-provider prompt/schema requests and instrumented schema-validation failures
- Corrected documentation for current pgvector, offline replay, cost accounting, and observability boundaries
