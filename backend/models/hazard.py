"""
models/hazard.py — Hazards ORM model.

PK is hazard_id (UUID). Geometry is generic (may be any geometry type)
stored at SRID 4326 using GeoAlchemy2.
"""

import uuid

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geometry

from .base import Base


class Hazard(Base):
    __tablename__ = "hazards"

    hazard_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    hazard_type = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    geom = Column(Geometry(geometry_type="GEOMETRY", srid=4326), nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
