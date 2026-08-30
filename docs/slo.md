# Service levels

These are proposed service-level objectives for a future university pilot. CampusPilot is not currently deployed, so the targets below are design requirements rather than measured production performance.

## Availability SLO

- **SLI:** successful non-user-error API requests / eligible API requests
- **Target:** 99.9% over a rolling 30 days
- Exclude explicit 4xx validation/auth failures and planned maintenance; include 429s caused by insufficient service capacity.

## Document-processing SLO

- **SLI:** valid ≤20 MB, ≤100-page machine-readable syllabi reaching `requires_review` within five minutes
- **Target:** 99% over a rolling 30 days
- **Quality guardrail:** schema-valid output ≥99.5%; source-grounding rate ≥99%; deadline hallucination rate <0.5% on committed evals.

## Planning SLO

- **SLI:** valid study-plan requests producing a schema-valid draft within 30 seconds
- **Target:** 99% over a rolling 30 days
- **Safety guardrail:** zero automatic deletions or moves of confirmed academic events.

## Alerting

- Page on a fast availability burn (14.4× over one hour) or document SLO fast burn.
- Ticket on slow burn (2× over six hours), schema failure >2% for 15 minutes, or a queue older than ten minutes.
- Treat any cross-user authorization failure or confirmed-event mutation as a security incident, independent of error budget.
