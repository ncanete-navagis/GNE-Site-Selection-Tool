"""
models/building.py — Building ORM models for OSM POI data.

Replaces the old `models/business.py` which referenced a non-existent
`businesses` table.  The actual DB has two city-scoped tables loaded from
OpenStreetMap (OSM) by Earl's ingestion pipeline.

Geometry column is named `geom` (EPSG:4326) in both tables.

Note: These tables have hundreds of OSM tag columns.  Only the columns
      relevant to the scoring engine and API are mapped here.
      SQLAlchemy silently ignores unmapped columns.
"""

from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geometry

from .base import Base


class CebuBuilding(Base):
    """Maps to `cebu_buildings` — OSM POI data for Metro Cebu."""

    __tablename__ = "cebu_buildings"

    ogc_fid = Column(Integer, primary_key=True, autoincrement=True)
    geom    = Column(Geometry("GEOMETRY", srid=4326))
    name    = Column(String)
    amenity = Column(String)   # OSM amenity tag (e.g. 'restaurant', 'cafe')
    cuisine = Column(String)   # OSM cuisine tag (e.g. 'pizza', 'filipino')


class ManilaBuilding(Base):
    """Maps to `manila_buildings` — OSM POI data for Metro Manila."""

    __tablename__ = "manila_buildings"

    ogc_fid = Column(Integer, primary_key=True, autoincrement=True)
    geom    = Column(Geometry("GEOMETRY", srid=4326))
    name    = Column(String)
    amenity = Column(String)   # OSM amenity tag (e.g. 'restaurant', 'cafe')
    cuisine = Column(String)   # OSM cuisine tag (e.g. 'pizza', 'filipino')
