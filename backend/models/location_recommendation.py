"""
models/location_recommendation.py — Location Recommendation ORM model.

PK is rlocation_id (UUID).
FKs: user_id → users.user_id (String), barangay_id → barangays.barangay_id (String),
     analysis_id → analyses.analysis_id (UUID).
Geometry is stored as Point (SRID 4326) using GeoAlchemy2.
"""

import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from .base import Base


class LocationRecommendation(Base):
    __tablename__ = "location_recommendations"

    rlocation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    # FK → users.user_id (String — Google OAuth sub)
    user_id = Column(String, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    # FK → barangays.barangay_id (String — PSGC code)
    barangay_id = Column(String, ForeignKey("barangays.barangay_id", ondelete="SET NULL"), nullable=True)

    # FK → analyses.analysis_id (UUID)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("analyses.analysis_id", ondelete="SET NULL"), nullable=True)

    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    geom = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    google_place_id = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="location_recommendations")
    barangay = relationship("Barangay", back_populates="location_recommendations")
    analysis = relationship("Analysis", back_populates="location_recommendations")
