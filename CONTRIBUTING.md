# Contributing

Thanks for improving CampusPilot. Changes should preserve the core rule: AI output is provisional until a student confirms it.

## Development

1. Fork and clone the repository.
2. Copy `.env.example` to `.env`.
3. Run `make dev`, or start the web/API/worker separately as described in the README.
4. Create a focused branch and include tests with behavioral changes.
5. Run `make verify` before opening a pull request.

## Code organization

- Put domain logic in its explicit `campus_pilot/<domain>` boundary.
- Avoid generic services or helpers when a domain owns the behavior.
- Keep route handlers thin and filter user-owned resources in the database query itself.
- Model AI responses with Pydantic and retain page-level provenance.
- Introduce shared UI only after the same interaction pattern recurs.
- Preserve the Academic Editorial tokens and information density documented in `docs/design-system.md`.

## Pull requests

Explain the user problem, the invariant or threat boundary involved, verification performed, and any migration/operational impact. UI changes should include before/after screenshots at affected breakpoints and pass the axe/overflow browser checks.

## Commit style

Use short imperative subjects. Conventional prefixes such as `feat:`, `fix:`, `docs:`, and `test:` are welcome but not required.
