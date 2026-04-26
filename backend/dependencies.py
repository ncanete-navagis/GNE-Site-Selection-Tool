"""
dependencies.py — Shared FastAPI dependencies.

OPTIMIZATION_ENGINEER — Phase 11
  Replaced the NotImplementedError stub with a real AsyncSession generator
  backed by the engine configured in core/database.py.
"""

from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from core.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an :class:`~sqlalchemy.ext.asyncio.AsyncSession` for one request.

    The session is automatically closed when the request finishes (or raises).
    All DB-touching route handlers should declare this as a FastAPI dependency::

        db: AsyncSession = Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        yield session
