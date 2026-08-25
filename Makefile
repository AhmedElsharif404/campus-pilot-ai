.PHONY: dev install api worker web test verify down seed

install:
	pnpm install
	python -m pip install -e "apps/api[dev]"

dev:
	docker compose up --build

api:
	cd apps/api && uvicorn campus_pilot.main:app --reload --port 8000

worker:
	cd apps/worker && python -m campus_worker.main

web:
	pnpm --filter @campuspilot/web dev

test:
	cd apps/api && pytest -m "not integration"
	pnpm test

verify:
	pnpm format:check
	pnpm lint
	pnpm typecheck
	cd apps/api && ruff check . && mypy campus_pilot && pytest
	pnpm test:e2e
	pnpm build

down:
	docker compose down

seed:
	cd apps/api && python -m campus_pilot.seed
