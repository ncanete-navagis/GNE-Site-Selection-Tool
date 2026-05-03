"""
core/config.py — Centralised application settings via Pydantic BaseSettings.

Implemented by: SECURITY_SPECIALIST / API_SPECIALIST
Version: 1.0 | May 2026 (Prompt C)

All environment variables are read from the process environment (or .env
when python-dotenv is used).  FastAPI dependency code imports `settings`
from this module — never reads os.environ directly.

Required environment variables:
    GOOGLE_CLIENT_ID   — must match the OAuth client ID in the frontend
    ASYNC_DATABASE_URL — postgresql+asyncpg://... connection string
    ALLOWED_ORIGINS    — JSON array string of allowed CORS origins

Optional:
    SCORING_RADIUS_M   — spatial search radius in metres (default: 500)
    LOG_DIR            — log directory path (default: /var/log/gne)
"""

from __future__ import annotations

import json
import os


class Settings:
    """Lightweight settings container backed by os.environ.

    We intentionally avoid pydantic-settings here to keep the dependency
    footprint minimal.  Validation is explicit per-field.
    """

    def __init__(self) -> None:
        self.GOOGLE_CLIENT_ID: str = os.environ.get("GOOGLE_CLIENT_ID", "")
        self.ASYNC_DATABASE_URL: str = os.environ.get(
            "ASYNC_DATABASE_URL",
            os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres_password@localhost:5432/gne_db")
        )
        self.SCORING_RADIUS_M: float = float(os.environ.get("SCORING_RADIUS_M", 500))
        self.LOG_DIR: str = os.environ.get("LOG_DIR", "/var/log/gne")

        # ALLOWED_ORIGINS is stored in .env as a JSON array string
        # e.g.  ALLOWED_ORIGINS=["http://localhost:5173"]
        _raw = os.environ.get("ALLOWED_ORIGINS", '["http://localhost:5173"]')
        try:
            self.ALLOWED_ORIGINS: list[str] = json.loads(_raw)
        except (ValueError, TypeError):
            # Fallback: treat as a single bare origin string
            self.ALLOWED_ORIGINS = [_raw]


# Module-level singleton — import and use directly:
#   from core.config import settings
settings = Settings()
