FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN addgroup --system campus && adduser --system --ingroup campus campus
WORKDIR /app
COPY apps/api /app/api
COPY apps/worker /app/worker
RUN pip install --no-cache-dir /app/api && pip install --no-cache-dir --no-deps /app/worker
RUN mkdir -p /app/api/uploads/quarantine && chown -R campus:campus /app
USER campus
WORKDIR /app/api
CMD ["python", "-m", "campus_worker.main"]
