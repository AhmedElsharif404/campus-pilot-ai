from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.models import Notification


async def create_notification(
    session: AsyncSession, user_id: str, kind: str, title: str, body: str
) -> Notification:
    notification = Notification(user_id=user_id, kind=kind, title=title, body=body)
    session.add(notification)
    await session.flush()
    return notification
