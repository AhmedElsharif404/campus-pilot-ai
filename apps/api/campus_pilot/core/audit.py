from typing import Any

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.models import AuditEvent


async def record_audit(
    session: AsyncSession,
    request: Request,
    action: str,
    entity_type: str,
    entity_id: str | None,
    user_id: str | None,
    metadata: dict[str, Any] | None = None,
) -> None:
    session.add(
        AuditEvent(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata_json=metadata or {},
        )
    )
    await session.flush()
