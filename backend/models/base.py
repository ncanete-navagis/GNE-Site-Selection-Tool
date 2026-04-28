"""
models/base.py — Shared SQLAlchemy declarative base.

All ORM models import Base from here. Never import Base from individual model files
to avoid circular imports.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
