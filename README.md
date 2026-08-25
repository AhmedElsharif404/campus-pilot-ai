# CampusPilot AI

CampusPilot AI is a privacy-aware academic planning platform that turns syllabus PDFs into a structured, editable semester workspace. Every extracted value keeps its source document, page, confidence, and review decision. AI proposes; the student confirms.

## Why this project exists

College students routinely translate inconsistent syllabi into calendars, reminders, and study plans by hand. CampusPilot treats that translation as a careful editorial workflow:

1. Create a semester and upload a syllabus PDF.
2. Validate and parse the document in an isolated asynchronous pipeline.
3. Review proposed course details beside page-level evidence.
4. Accept, edit, or reject every consequential field.
5. Turn confirmed records into a semester calendar and realistic study plan.
6. Adjust sessions, work offline where practical, and track follow-through.

## Product direction

The interface uses an Academic Editorial direction: warm paper surfaces, ink typography, compact ledgers, strong deadline semantics, and visible source evidence. The complete design foundation is in [docs/design-system.md](docs/design-system.md). Automated browser coverage verifies the critical journey, accessibility, offline shell, and horizontal-overflow behavior at mobile, tablet, laptop, and large-desktop widths.

## Architecture

This repository is a modular monolith with separately deployable processes:

```text
apps/
  web/       Next.js 16, strict TypeScript, PWA/offline queue
  api/       FastAPI, Pydantic, SQLAlchemy, Alembic
  worker/    Redis-backed document extraction worker
packages/
  contracts/ Shared Zod contracts
```

PostgreSQL/pgvector is the system of record, Redis holds jobs, and S3-compatible storage holds quarantined documents. Local development uses MinIO. The deterministic `MockAIProvider` makes the complete system usable without credentials; `RealProviderAdapter` preserves the same structured contract.

See [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries and diagrams, [SECURITY.md](SECURITY.md) for controls, and [docs/threat-model.md](docs/threat-model.md) for the abuse analysis.

## Quick start

Requirements: Docker Desktop and GNU Make.

```bash
cp .env.example .env
make dev
```

Then open:

- Web: `http://localhost:3000`
- API docs in development: `http://localhost:8000/api/docs`
- MinIO console: `http://localhost:9001`

Seed data is created with:

```bash
make seed
```

Demo account:

```text
Email: alex@northbridge.edu
Password: CampusPilotDemo!2026
```

The web app also includes an **Enter demo workspace** path so the design can be evaluated when infrastructure is not running.

### Run services without Docker

```bash
pnpm install
python -m pip install -e "apps/api[dev]"
make api       # terminal 1
make worker    # terminal 2; requires Redis
make web       # terminal 3
```

SQLite is the safe local API fallback when `CAMPUS_DATABASE_URL` is omitted. PostgreSQL remains the production and integration-test target.

## Quality gates

```bash
make verify
```

The gate covers formatting, ESLint, strict TypeScript, Ruff, strict mypy, API/unit/authorization tests, browser E2E, accessibility, offline navigation, and the production web build. CI adds PostgreSQL and Redis integration checks, committed AI evals, dependency auditing, CodeQL, and secret scanning.

Critical browser coverage follows the real journey: upload syllabus → review extraction → approve fields → create course → rebalance study plan → complete study session.

## Privacy and AI safety

- Uploaded documents are untrusted data, not instructions.
- PDFs are size-, MIME-, and signature-validated before quarantine.
- Extracted fields remain provisional until a student makes a decision.
- Canonical academic items retain `source_field_id` provenance.
- Object-level authorization filters every user-owned query.
- AI responses are validated through structured Pydantic schemas.
- Study planning may move proposed sessions, never confirmed academic events.
- External AI credentials are optional; the mock provider is the default.

## Current limitations

- OCR is a defined fallback boundary, but the repository image does not yet bundle a native OCR engine; image-only PDFs fail safely for manual handling.
- The real-provider adapter targets a generic structured HTTP contract and needs a provider-specific production adapter, cost policy, and redaction review before deployment.
- Local rate limiting is process-local; production should back the limiter with Redis.
- Email/push notification delivery is modeled but not connected to an external provider.
- Calendar sync with institutional LMS or Google/Apple calendars is deliberately outside this first milestone.

## Next production milestone

The next milestone is a limited university pilot: complete native OCR and malware scanning, add an institution-reviewed retention policy, run the eval suite against anonymized opt-in syllabi, complete provider-specific AI and cost controls, and conduct an external accessibility and penetration test.

## License

[MIT](LICENSE)
