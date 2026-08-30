# Threat model

## Assets

Student identity, course enrollment, source syllabi, extracted page text, deadlines, study behavior, session cookies, API/AI credentials, and audit history.

## Trust boundaries

1. Browser ↔ public web/API
2. API ↔ PostgreSQL/Redis/object storage
3. Worker ↔ uploaded document bytes
4. Worker ↔ optional external AI provider
5. Maintainer/CI ↔ deployment secrets

## Primary threats and mitigations

| Threat                        | Example                                        | Mitigation                                                                                                   | Residual risk                                                                               |
| ----------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Broken object authorization   | User guesses another document UUID             | Every selector includes authenticated `user_id`; explicit cross-user tests                                   | New endpoints must keep the pattern                                                         |
| Prompt injection in syllabus  | PDF says to reveal data or alter the plan      | Documents are delimited untrusted data; structured schemas; provider receives no unrelated user data         | Model may still return low-quality fields; human review remains required                    |
| Malicious PDF                 | Active content, parser bomb, encrypted payload | Quarantine namespace, signature/MIME/size/page/text bounds, strict parser, no browser rendering or execution | Native parser vulnerabilities require rapid dependency patching and production malware scan |
| Silent academic corruption    | Hallucinated exam becomes canonical            | Pending fields, page/source/confidence, explicit accept/edit/reject, atomic confirmation                     | Student may confirm an incorrect field; UI highlights low confidence                        |
| CSRF/session theft            | Cross-site mutation or exposed cookie          | SameSite+HttpOnly cookies, double-submit CSRF, short expiry, CSP, secure production cookies                  | XSS in same origin remains high impact; avoid unsafe HTML                                   |
| Upload replay/job duplication | Retried upload produces duplicate records      | Per-user idempotency key and terminal-job short circuit                                                      | Storage object dedup/retention still needs policy                                           |
| Queue poisoning               | Forged job ID or repeated failures             | Worker loads authoritative job from DB, bounds attempts, replaces provisional output                         | Production queue should add ACL/TLS and dead-letter monitoring                              |
| Sensitive telemetry           | Source text appears in traces                  | Metrics use operation IDs/counters; audit metadata avoids full documents and secrets                         | Review future error logging and provider SDK defaults                                       |
| AI cost abuse                 | Automated plan/extraction requests             | Auth, upload limits, rate limiting, idempotency, per-execution latency/provider metadata                     | Provider-specific usage accounting, user quotas, and budgets are not implemented yet        |

## Abuse-case tests

The suite covers cross-user access for courses/documents/nested assignment creation, malformed MIME/signature/size, prompt-injection text, invalid grounded schemas, duplicate completion, and CSRF-aware/bearer mutation paths. The production pilot adds DAST, malformed-PDF corpus testing, and external penetration testing.
