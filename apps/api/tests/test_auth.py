from httpx import AsyncClient


async def test_register_sets_secure_session_shape(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@example.edu",
            "password": "Long-and-safe-password-123",
            "display_name": "Student",
        },
    )
    assert response.status_code == 201
    cookies = response.headers.get_list("set-cookie")
    assert any(
        "campus_pilot_session=" in cookie and "HttpOnly" in cookie and "SameSite=lax" in cookie
        for cookie in cookies
    )
    assert any("campus_pilot_csrf=" in cookie and "HttpOnly" not in cookie for cookie in cookies)


async def test_invalid_login_is_generic(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.edu", "password": "Long-and-safe-password-123"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


async def test_logout_requires_csrf(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 403
    assert response.json()["detail"] == "CSRF validation failed"
