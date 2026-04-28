"""
models/business.py — Business ORM model.

PK is google_places_id (String) sourced from Google Places API.
Geometry is stored as Point (SRID 4326) using GeoAlchemy2.
"""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from geoalchemy2 import Geometry

from .base import Base


class Business(Base):
    __tablename__ = "businesses"

    google_places_id = Column(String, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    geom = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
