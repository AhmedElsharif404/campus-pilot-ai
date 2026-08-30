# Operations runbook

## Service indicators

Start with `/health/live`, then `/health/ready`. The current `/metrics` export includes `job_queue_depth`, `extraction_failure_total`, `document_processing_duration_seconds`, `ai_schema_failure_total`, and `ai_latency_seconds`, in addition to the standard Python process metrics. HTTP error-rate and provider cost metrics require deployment- or provider-specific instrumentation and must not be inferred from zero-valued placeholders.

## Extraction backlog

1. Confirm API readiness and Redis reachability.
2. Compare queue depth with active worker count and processing duration.
3. Inspect terminal job `error_code` without logging document contents.
4. Scale workers if jobs are healthy but slow.
5. For repeated parser/schema failures, stop automatic retries after attempt three and route the document to manual handling.
6. Never mark a job completed or create canonical academic items by operational override.

## AI provider degradation

Switch `CAMPUS_AI_PROVIDER=mock` for deterministic demo/continuity behavior. The real adapter must fail closed on schema validation. Do not fall back to unstructured output. Alert when schema failures exceed 2% over 15 minutes or p95 provider latency exceeds 20 seconds.

## Database recovery

Use provider-managed point-in-time recovery. Restore into an isolated environment, verify audit/event and extraction/canonical referential integrity, then promote through the documented disaster-recovery process. Do not copy production documents into developer machines.

## Suspected data exposure

Disable affected credentials, preserve audit logs, stop nonessential exports, and follow the incident plan. Avoid altering source records before evidence capture. Notify affected institutions/users under the applicable policy and law.
