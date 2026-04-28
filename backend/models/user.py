"""
models/user.py — User ORM model.

# user_id is the Google OAuth 'sub' claim — set by security.py on first login.
# Do NOT generate this value in the backend; always receive it from the verified ID token.
"""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .base import Base


class User(Base):
    __tablename__ = "users"

    # Google OAuth 'sub' claim — externally provided, never auto-generated.
    user_id = Column(String, primary_key=True, nullable=False)

    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=True)  # populated from Google profile 'name' claim
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)  # updated on each successful OAuth sign-in

    # Relationships
    location_histories = relationship("LocationHistory", back_populates="user", cascade="all, delete-orphan")
    location_recommendations = relationship("LocationRecommendation", back_populates="user", cascade="all, delete-orphan")
