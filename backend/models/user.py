"""
models/user.py — User ORM model.

# PK is integer id. Google OAuth users matched by email. password_hash is NULL for OAuth users.
# Do NOT store the Google OAuth 'sub' claim as PK; match by email on upsert in security.py.
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .base import Base


class User(Base):
    __tablename__ = "users"

    # Auto-increment integer PK — DB assigns this, not the application.
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)

    # NULL for Google OAuth users; set only for password-based accounts.
    password_hash = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    history = relationship("LocationHistory", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("LocationRecommendation", back_populates="user", cascade="all, delete-orphan")
