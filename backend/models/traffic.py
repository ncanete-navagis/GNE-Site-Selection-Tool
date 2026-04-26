"""
models/traffic.py — Traffic Data ORM model.

PK is traffic_id (UUID). Geometry is generic (may be any geometry type)
stored at SRID 4326 using GeoAlchemy2.
"""

import uuid

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geometry

from .base import Base


class TrafficData(Base):
    __tablename__ = "traffic_data"

    traffic_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    traffic_score = Column(String, nullable=True)  # raw score value; keep as String to match ERD (no numeric type specified)
    traffic_type = Column(String, nullable=True)
    geom = Column(Geometry(geometry_type="GEOMETRY", srid=4326), nullable=True)
    source = Column(String, nullable=True)
    time_window = Column(String, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
