"""
core/security.py — Google OAuth 2.0 Security Layer.

Implemented by: SECURITY_SPECIALIST
Version: 2.1 | May 2026 (added optional user support)
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from core.config import settings
from dependencies import get_db
from models.user import User


async def get_current_user(
    authorization: str | None = Header(None),
    session: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency: verify Google ID token → upsert user → return User.
    Now allows optional auth for testing.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # Mock user for testing without frontend auth
        result = await session.execute(select(User).where(User.email == "test@navagis.com"))
        user: User | None = result.scalar_one_or_none()
        if not user:
            user = User(name="Test User", email="test@navagis.com", password_hash=None)
            session.add(user)
            await session.flush()
        return user

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


async def get_optional_user(
    authorization: str | None = Header(None),
    session: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Dependency for endpoints that can work without auth (transient mode)."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization, session)
    except HTTPException:
        return None
