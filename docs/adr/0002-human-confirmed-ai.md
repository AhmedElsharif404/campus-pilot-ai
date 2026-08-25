# ADR 0002: AI output is provisional

- Status: Accepted
- Date: 2026-08-24

## Decision

Store every extracted value in `ExtractedField` with confidence and page/source provenance. Require accept, reject, or edited approval before a single atomic confirmation creates canonical records.

## Consequences

The product can explain and correct extraction mistakes, evaluation can measure grounding, and canonical data has a review lineage. Intake takes an extra step; the interface must make review fast and highlight uncertain values.
