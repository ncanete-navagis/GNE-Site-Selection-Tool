"""
models/hazard.py — Hazard ORM models (three separate tables).

Replaces the old single `hazards` table ORM which did not exist in Earl's schema.
Each class maps to one of the three real hazard tables in `gne_db`.

Geometry column is named `geometry` (EPSG:4326) in all three tables.

PK strategy:
  No declared PK column exists in Earl's schema for these tables.
  PostgreSQL's internal `ctid` (tuple ID) is used as a surrogate PK so
  SQLAlchemy can uniquely identify rows.  ctid is a transient system column —
  it changes after VACUUM FULL or cluster operations.  Do NOT persist ctids
  outside of a single transaction.
  # No declared PK in Earl's schema — using ctid as surrogate
"""

from sqlalchemy import Column, Text, Float, BigInteger
from geoalchemy2 import Geometry

from .base import Base


class FloodHazard(Base):
    """Maps to `combined_flood_hazards`.

    Columns (from gap analysis Table 6):
      Var      — hazard variable / classification value
      geometry — spatial geometry (EPSG:4326)
      city_tag — city identifier tag
    """

    __tablename__ = "combined_flood_hazards"

    # No declared PK in Earl's schema — using ctid as surrogate
    _row_id = Column("ctid", Text, primary_key=True)

    Var      = Column("Var",      Float)                          # hazard classification value
    geometry = Column(Geometry("GEOMETRY", srid=4326))
    city_tag = Column("city_tag", Text)


class LandslideHazard(Base):
    """Maps to `combined_landslide_hazards`.

    Columns (from gap analysis Table 6):
      GRID     — grid reference ID
      LH       — landslide hazard value
      geometry — spatial geometry (EPSG:4326)
      city_tag — city identifier tag
    """

    __tablename__ = "combined_landslide_hazards"

    # No declared PK in Earl's schema — using ctid as surrogate
    _row_id  = Column("ctid",     Text,  primary_key=True)

    GRID     = Column("GRID",     Float)                          # grid reference ID
    LH       = Column("LH",       Float)                          # landslide hazard intensity
    geometry = Column(Geometry("GEOMETRY", srid=4326))
    city_tag = Column("city_tag", Text)


class StormSurgeHazard(Base):
    """Maps to `combined_storm_surge_hazards`.

    Columns (from gap analysis Table 6):
      HAZ        — hazard classification value
      geometry   — spatial geometry (EPSG:4326)
      city_tag   — city identifier tag
      surge_level — numeric surge level (bigint)
    """

    __tablename__ = "combined_storm_surge_hazards"

    # No declared PK in Earl's schema — using ctid as surrogate
    _row_id     = Column("ctid",        Text,       primary_key=True)

    HAZ         = Column("HAZ",         Float)                     # hazard value
    geometry    = Column(Geometry("GEOMETRY", srid=4326))
    city_tag    = Column("city_tag",    Text)
    surge_level = Column("surge_level", BigInteger)                 # storm surge level
