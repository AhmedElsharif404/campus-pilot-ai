# Security policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub’s private vulnerability reporting for this repository and include the affected endpoint, reproduction steps, impact, and any suggested mitigation. Do not include real student records or course documents.

Maintainers should acknowledge a report within three business days, provide a triage decision within seven, and coordinate disclosure after a fix is available.

## Supported versions

Until the first stable release, security updates apply to the current `main` branch only.

## Implemented controls

- Argon2id password hashing and short-lived HS256 sessions with issuer, expiry, and unique token IDs
- HttpOnly, SameSite cookies; production-secure cookies through configuration
- Double-submit CSRF validation for cookie-authenticated mutations; bearer API clients are exempt
- Object-level authorization on every user-owned selector, including nested course/document operations
- Strict Pydantic inputs, SQLAlchemy parameterization, upload byte limits, MIME and PDF magic validation
- Quarantined object namespace, no document execution, encrypted S3 objects, and bounded PDF/page/text processing
- Human confirmation before canonical academic persistence
- Delimited untrusted document data and structured AI output schemas
- CSP, frame denial, no-sniff, referrer, permissions, and cross-origin opener headers
- Per-route/IP rate limiting with a documented Redis production migration
- Append-only audit events for identity, upload, extraction decisions, planning, and manual edits
- CodeQL, dependency audits, Dependabot, and Gitleaks in CI

See [docs/threat-model.md](docs/threat-model.md) for trust boundaries and abuse cases.

## Secrets

Copy `.env.example` to `.env`; never commit `.env`. Demo credentials are intentionally public and must never be reused outside local/demo data. Production JWT, database, object-storage, telemetry, and AI credentials must come from a managed secret store and rotate independently.
