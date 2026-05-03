"""
core/security.py — Google OAuth 2.0 Security Layer.

Implemented by: SECURITY_SPECIALIST
Version: 2.0 | May 2026 (Prompt C — async rewrite, email-based upsert)

Auth strategy (confirmed):
  - The frontend sends a Google ID token in the Authorization header
    as "Bearer <token>".
  - The backend verifies the token with Google's OAuth2 library.
  - Users are matched / created by EMAIL, not by the Google 'sub' claim.
  - User.id is an auto-increment integer assigned by the DB; it is never
    set from the token payload.
  - password_hash is NULL for all OAuth users.

SECURITY SPECIALIST rules applied:
  - Token verification delegates entirely to google.oauth2.id_token —
    no manual JWT parsing.
  - HTTPException(401) on any verification failure — no detail leakage.
  - last_login is updated on every successful authentication.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from core.config import settings
from dependencies import get_db
from models.user import User


async def get_current_user(
    authorization: str = Header(...),
    session: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency: verify Google ID token → upsert user → return User.

    Expects the Authorization header in the form:
        Authorization: Bearer <google-id-token>

    Flow:
      1. Extract Bearer token from header.
      2. Verify token with Google (raises 401 on failure).
      3. Extract email + name claims.
      4. SELECT user by email; INSERT if not found (flush to get integer id).
      5. Update last_login, commit, refresh, return.

    Args:
        authorization: Raw value of the Authorization header.
        session: Async SQLAlchemy session from get_db() dependency.

    Returns:
        The authenticated User ORM instance (id is an integer).

    Raises:
        HTTPException(401): On missing/invalid header or failed token verification.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception:
        # Do NOT leak the underlying error — just report invalid/expired.
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

    # ------------------------------------------------------------------
    # Upsert by email — id is integer auto-assigned by DB, not by us.
    # ------------------------------------------------------------------
    result = await session.execute(select(User).where(User.email == email))
    user: User | None = result.scalar_one_or_none()

    if not user:
        user = User(name=name, email=email, password_hash=None)
        session.add(user)
        await session.flush()   # triggers DB INSERT → populates user.id

    user.last_login = datetime.utcnow()
    await session.commit()
    await session.refresh(user)
    return user
