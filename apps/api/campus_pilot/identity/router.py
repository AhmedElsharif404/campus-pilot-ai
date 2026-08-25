from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from campus_pilot.core.audit import record_audit
from campus_pilot.core.config import Settings, get_settings
from campus_pilot.core.database import get_session
from campus_pilot.core.models import User
from campus_pilot.core.security import (
    create_access_token,
    current_user,
    hash_password,
    new_csrf_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class Registration(Credentials):
    display_name: str = Field(min_length=2, max_length=120)


class UserView(BaseModel):
    id: str
    email: EmailStr
    display_name: str


def set_auth_cookies(response: Response, token: str, csrf: str, settings: Settings) -> None:
    response.set_cookie(
        "campus_pilot_session",
        token,
        max_age=settings.access_token_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        "campus_pilot_csrf",
        csrf,
        max_age=settings.access_token_minutes * 60,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


@router.post("/register", response_model=UserView, status_code=status.HTTP_201_CREATED)
async def register(
    payload: Registration,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> UserView:
    email = payload.email.lower()
    if await session.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account already exists")
    user = User(
        email=email,
        display_name=payload.display_name.strip(),
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    await session.flush()
    await record_audit(session, request, "identity.registered", "user", user.id, user.id)
    await session.commit()
    set_auth_cookies(response, create_access_token(user.id, settings), new_csrf_token(), settings)
    return UserView(id=user.id, email=user.email, display_name=user.display_name)


@router.post("/login", response_model=UserView)
async def login(
    payload: Credentials,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> UserView:
    user = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    csrf = new_csrf_token()
    set_auth_cookies(response, create_access_token(user.id, settings), csrf, settings)
    await record_audit(session, request, "identity.logged_in", "user", user.id, user.id)
    await session.commit()
    return UserView(id=user.id, email=user.email, display_name=user.display_name)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    response.delete_cookie("campus_pilot_session", path="/")
    response.delete_cookie("campus_pilot_csrf", path="/")


@router.get("/me", response_model=UserView)
async def me(user: User = Depends(current_user)) -> UserView:
    return UserView(id=user.id, email=user.email, display_name=user.display_name)
