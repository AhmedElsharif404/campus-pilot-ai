# ADR 0001: Modular monolith with deployable workers

- Status: Accepted
- Date: 2026-08-24

## Decision

Keep domain modules in one FastAPI deployable and one PostgreSQL database. Run document extraction in a separate worker deployment using the same domain package.

## Consequences

Cross-domain confirmation stays transactional, operations remain approachable for a portfolio/pilot, and worker resources scale independently. Domain teams must enforce boundaries in code review because the database does not enforce service isolation. Split a service only after measured scaling, reliability, security, or ownership pressure.
