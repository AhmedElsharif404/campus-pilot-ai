# Architecture

CampusPilot is a modular monolith. Domain boundaries live in one API codebase and share one PostgreSQL transaction boundary; document work runs in a separately deployable worker. This keeps operational complexity proportional to the product while allowing resource-heavy parsing and AI execution to scale independently.

## System context

```mermaid
C4Context
  title CampusPilot AI system context
  Person(student, "College student", "Owns documents and confirms academic data")
  System(campus, "CampusPilot AI", "Builds a grounded academic workspace from course documents")
  System_Ext(ai, "Configured AI provider", "Optional structured extraction and planning")
  System_Ext(calendar, "External calendars", "Future export/sync boundary")
  Rel(student, campus, "Uploads, reviews, plans, completes")
  Rel(campus, ai, "Sends delimited data and schemas", "HTTPS")
  Rel(campus, calendar, "Exports confirmed events only", "Future")
```

## Containers

```mermaid
C4Container
  title CampusPilot containers
  Person(student, "Student")
  Container(web, "Web/PWA", "Next.js, TypeScript", "SSR shell, review UI, offline agenda and queued actions")
  Container(api, "API", "FastAPI, SQLAlchemy", "Auth, domain rules, human confirmation, versioned REST")
  Container(worker, "Worker", "Python", "PDF parsing, extraction, schema validation, retry")
  ContainerDb(postgres, "System of record", "PostgreSQL + pgvector", "Users, academic data, provenance, audits")
  ContainerDb(redis, "Job/cache", "Redis", "Extraction queue and production limiter target")
  ContainerDb(objects, "Document store", "S3/MinIO", "Quarantined source PDFs")
  System_Ext(ai, "AI provider", "Optional")
  Rel(student, web, "Uses", "HTTPS")
  Rel(web, api, "Typed versioned API", "HTTPS/JSON")
  Rel(api, postgres, "Transactions", "SQL/TLS")
  Rel(api, objects, "Quarantines uploads", "S3 API")
  Rel(api, redis, "Enqueues jobs", "RESP/TLS")
  Rel(worker, redis, "Claims/retries jobs", "RESP/TLS")
  Rel(worker, objects, "Reads source documents", "S3 API")
  Rel(worker, postgres, "Stores pages, provisional fields, execution records", "SQL/TLS")
  Rel(worker, ai, "Delimited document data + JSON schema", "HTTPS")
```

## Domain boundaries

| Domain                     | Owns                                                | Not allowed to do                           |
| -------------------------- | --------------------------------------------------- | ------------------------------------------- |
| `identity`                 | accounts, authentication, sessions                  | expose another user’s records               |
| `semesters`                | academic date frame                                 | infer canonical courses from raw AI output  |
| `courses`                  | confirmed course, meetings, instructors             | mutate provisional extraction               |
| `documents`                | upload validation, quarantine, pages                | execute or render active document content   |
| `extraction`               | jobs, grounded provisional fields, review decisions | write canonical data before confirmation    |
| `assignments` / `calendar` | confirmed work and calendar projection              | silently move confirmed events              |
| `study_plans`              | suggested plans and editable sessions               | delete/reschedule confirmed academic events |
| `progress`                 | actual completion                                   | present behavioral signals as grades        |
| `notifications`            | restrained user-facing alerts                       | send unbounded AI-originated text           |
| `analytics`                | aggregate planning signals                          | collect document contents                   |
| `ai`                       | provider contracts and schemas                      | let document text alter system behavior     |
| `audit`                    | append-only security/product decisions              | store secrets or full source documents      |

## Document state machine

```mermaid
stateDiagram-v2
  [*] --> quarantined: upload validated
  quarantined --> queued: job committed
  queued --> processing: worker claims
  processing --> requires_review: pages + schema valid
  processing --> queued: retryable failure (<3)
  processing --> failed: terminal failure
  requires_review --> completed: all fields decided + user confirms
  failed --> queued: explicit retry
```

Upload and planning requests accept idempotency keys. The database commit precedes queue publication so a temporary Redis failure leaves a discoverable queued job rather than losing source state. Workers short-circuit terminal jobs and replace provisional page/field results on retry.

## Canonical-data invariant

`ExtractedField` is never itself a course or deadline. It carries the proposed value, page, exact source reference, confidence, and a pending/accepted/rejected/edited decision. Confirmation creates canonical objects and attaches `source_field_id`; rejected fields are excluded.

## Deployment

The web, API, and worker images are independently deployable. The API and worker use the same package and schema migration. Horizontal API and worker scaling is safe once the production rate limiter is Redis-backed and workers use PostgreSQL row locking or a queue visibility-timeout implementation appropriate to the deployment platform.

Detailed tradeoffs are recorded in [docs/adr](docs/adr).
