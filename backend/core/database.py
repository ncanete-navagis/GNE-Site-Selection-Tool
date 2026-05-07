"""
core/database.py — Async SQLAlchemy engine and session factory.

OPTIMIZATION_ENGINEER — Phase 11
  - Driver:           asyncpg  (postgresql+asyncpg://)
  - pool_size:        10  (max simultaneous connections held open)
  - max_overflow:     20  (extra connections allowed above pool_size under load)
  - expire_on_commit: False  (prevents lazy-load errors on detached instances
                              after the session is closed in async context)

Route handlers obtain an AsyncSession via the ``get_db()`` dependency
defined in ``dependencies.py``.
"""

from __future__ import annotations

import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

#: Async database URL.  Must use the ``postgresql+asyncpg://`` scheme.
#: Reads ASYNC_DATABASE_URL first (legacy alias), then DATABASE_URL (set in .env).
ASYNC_DATABASE_URL: str = (
    os.environ.get("ASYNC_DATABASE_URL")
    or os.environ.get("DATABASE_URL")
    or "postgresql+asyncpg://postgres:postgres@localhost:5432/gne_db"
)

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    echo=False,
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

#: Async session factory consumed by ``dependencies.get_db()``.
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
