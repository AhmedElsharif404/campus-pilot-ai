from prometheus_client import Counter, Gauge, Histogram

document_processing_duration = Histogram(
    "document_processing_duration_seconds", "Document processing duration"
)
extraction_failures = Counter("extraction_failure_total", "Failed extraction jobs")
ai_latency = Histogram("ai_latency_seconds", "AI operation latency", ["operation", "provider"])
ai_cost_estimate = Counter(
    "ai_cost_estimate_usd_total", "Estimated AI spend", ["operation", "provider"]
)
ai_schema_failures = Counter(
    "ai_schema_failure_total", "AI schema validation failures", ["operation"]
)
job_queue_depth = Gauge("job_queue_depth", "Queued extraction jobs")
http_errors = Counter("http_error_total", "HTTP error responses", ["status_code", "route"])
