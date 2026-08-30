# Architecture notes

The authoritative architecture overview and C4 diagrams are in [`../ARCHITECTURE.md`](../ARCHITECTURE.md). This document captures implementation-level conventions.

## API layering

Routes accept transport schemas, perform identity/object authorization, and call domain behavior. SQLAlchemy models are deliberately centralized in `core/models.py` so Alembic has one metadata registry; ownership and behavior remain in domain modules. A future split should follow measured deployment or team-boundary pressure, never namespace aesthetics.

## Transactions

- Upload metadata and extraction job are one transaction.
- Queue publication happens after commit.
- Field decisions each create an audit event in the same transaction.
- Extraction confirmation creates the course and derived academic items atomically.
- Study-plan generation creates a plan and sessions atomically.

## Offline model

The service worker caches the application shell and recent same-origin GET responses. IndexedDB retains explicit low-risk completion intents. Tokens are never stored in IndexedDB or local storage. Upload and AI work require connectivity; the saved agenda and completion intent remain available. Automatic replay and conflict reconciliation are a documented next milestone, not current behavior.

## Contract flow

FastAPI owns the OpenAPI document. `packages/contracts` contains the small hand-maintained Zod subset needed by offline-first UI. The production milestone should generate the complete client from the versioned OpenAPI artifact and fail CI on drift.
