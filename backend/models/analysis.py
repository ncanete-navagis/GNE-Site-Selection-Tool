"""
models/analysis.py — Analysis ORM model.

PK is analysis_id (UUID). analysis_details is stored as JSON.
The FK to analysis_id lives on LocationHistory and LocationRecommendation — NOT reversed here.
"""

import uuid

from sqlalchemy import Column, Float, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .base import Base


class Analysis(Base):
    __tablename__ = "analysis"

    analysis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    overall_score = Column(Float, nullable=True)
    traffic_score = Column(Float, nullable=True)
    foot_traffic_score = Column(Float, nullable=True)
    competing_business_score = Column(Float, nullable=True)
    landslide_hazard_score = Column(Float, nullable=True)
    flood_hazard_score = Column(Float, nullable=True)
    storm_surge_score = Column(Float, nullable=True)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    analysis_details = Column(JSON, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    # Relationships (FK lives on the child side)
    location_histories = relationship("LocationHistory", back_populates="analysis")
    location_recommendations = relationship("LocationRecommendation", back_populates="analysis")
