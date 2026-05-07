"""
core/security.py — Google OAuth 2.0 Security Layer.

Implemented by: SECURITY_SPECIALIST
Version: 2.1 | May 2026 (optional auth support)

Auth strategy (confirmed):
  - The frontend sends a Google ID token in the Authorization header
    as "Bearer <token>".
  - The backend verifies the token with Google's OAuth2 library.
  - Users are matched / created by EMAIL, not by the Google 'sub' claim.
  - User.id is an auto-increment integer assigned by the DB; it is never
    set from the token payload.
  - password_hash is NULL for all OAuth users.

Two dependencies are provided:
  - get_current_user  → REQUIRED auth (raises 401 if missing/invalid)
  - get_optional_user → OPTIONAL auth (returns None if no/invalid header)
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import Depends, Header, HTTPException
from fastapi.security.utils import get_authorization_scheme_param
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from core.config import settings
from dependencies import get_db
from models.user import User


# ---------------------------------------------------------------------------
# Internal helper — verify + upsert
# ---------------------------------------------------------------------------

async def _verify_and_upsert(token: str, session: AsyncSession) -> User:
    """Verify a Google ID token and upsert the user. Raises 401 on failure."""
    try:
        payload = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google token",
        )

    email: str | None = payload.get("email")
    name: str = payload.get("name", email or "Unknown")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Token missing email claim",
        )

    result = await session.execute(select(User).where(User.email == email))
    user: User | None = result.scalar_one_or_none()

    if not user:
        user = User(name=name, email=email, password_hash=None)
        session.add(user)
        await session.flush()

    user.last_login = datetime.utcnow()
    await session.commit()
    await session.refresh(user)
    return user


# ---------------------------------------------------------------------------
# REQUIRED dependency — use on endpoints that MUST have an authenticated user
# ---------------------------------------------------------------------------

async def get_current_user(
    authorization: str = Header(...),
    session: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency: verify Google ID token → upsert user → return User.

    Expects:  Authorization: Bearer <google-id-token>
    Raises:   HTTPException(401) on missing/invalid header or token failure.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format",
        )

    token = authorization.removeprefix("Bearer ").strip()
    return await _verify_and_upsert(token, session)


# ---------------------------------------------------------------------------
# OPTIONAL dependency — use on endpoints that WORK for unauthenticated users
#   but can also accept an authenticated user for extra features (e.g. saving).
# ---------------------------------------------------------------------------

async def get_optional_user(
    authorization: Optional[str] = Header(default=None),
    session: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """FastAPI dependency: optionally verify Google ID token.

    Returns:
        User ORM instance if a valid Bearer token is supplied.
        None if the Authorization header is absent or not a Bearer token.

    Raises:
        HTTPException(401) ONLY when a Bearer token is present but invalid —
        prevents silent auth failures from bad tokens.
    """
    if not authorization:
        return None

    scheme, token = get_authorization_scheme_param(authorization)
    if scheme.lower() != "bearer" or not token:
        return None  # Not a bearer token — treat as anonymous

    return await _verify_and_upsert(token, session)
