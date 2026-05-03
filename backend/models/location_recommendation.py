"""
models/location_recommendation.py — Location Recommendation ORM model.

PK is rlocation_id (UUID).
FKs: user_id → users.id (Integer — NOT string), analysis_id → analyses.analysis_id (UUID).
barangay_pcode is plain Text — no FK constraint (see location_history.py for rationale).
Geometry column is named `geom` (Point, EPSG:4326).
"""

import uuid

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from .base import Base


class LocationRecommendation(Base):
    __tablename__ = "location_recommendation"

    rlocation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    # FK → users.id (Integer — matches the actual users table PK type)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Barangay PSGC code stored as plain text — no FK constraint.
    # Matches the `barangay_pcode` column in the actual DB schema.
    barangay_pcode = Column(Text, nullable=True)

    # FK → analyses.analysis_id (UUID)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("analyses.analysis_id", ondelete="SET NULL"), nullable=True)

    name            = Column(String,  nullable=True)
    description     = Column(String,  nullable=True)
    geom            = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    google_place_id = Column(String,  nullable=True)

    # Relationships
    user     = relationship("User",     back_populates="recommendations")
    analysis = relationship("Analysis", back_populates="location_recommendations")
