# ADR 0003: Offline agenda with queued intent

- Status: Accepted
- Date: 2026-08-24

## Decision

Cache the application shell and recent GET responses. Store explicit low-risk mutations, such as study-session completion, in IndexedDB for later sync. Do not store session tokens, source PDFs, new uploads, or AI requests in browser persistence.

## Consequences

Students retain daily utility during unstable connectivity without copying sensitive document data into broad browser storage. Conflict resolution is required for queued edits; server versions remain authoritative for academic records.
