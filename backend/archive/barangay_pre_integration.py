"""
models/barangay.py — Barangay ORM model.

PK is barangay_id (String — PSGC code, e.g. "063001001").
Boundary is stored as Polygon (SRID 4326) using GeoAlchemy2.
"""

from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from .base import Base


class Barangay(Base):
    __tablename__ = "barangays"

    barangay_id = Column(String, primary_key=True, nullable=False)  # PSGC code
    name = Column(String, nullable=False)
    population = Column(Integer, nullable=True)
    boundary = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    municipality = Column(String, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    # Relationships
    location_histories = relationship("LocationHistory", back_populates="barangay")
    location_recommendations = relationship("LocationRecommendation", back_populates="barangay")
