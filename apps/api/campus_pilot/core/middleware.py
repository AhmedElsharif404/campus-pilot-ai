import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable

from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: object, limit: int = 120, window_seconds: int = 60) -> None:
        super().__init__(app)  # type: ignore[arg-type]
        self.limit = limit
        self.window_seconds = window_seconds
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        client = request.client.host if request.client else "unknown"
        key = f"{client}:{request.url.path.split('/')[3] if request.url.path.startswith('/api/v1/') else 'other'}"
        now = time.monotonic()
        bucket = self.requests[key]
        while bucket and bucket[0] < now - self.window_seconds:
            bucket.popleft()
        if len(bucket) >= self.limit:
            return Response(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": str(self.window_seconds)},
            )
        bucket.append(now)
        return await call_next(request)
