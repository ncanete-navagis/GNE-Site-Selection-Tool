"""
models/barangay.py — Barangay ORM model.

Maps to the `ph_barangays` table populated by Earl's GIS data pipeline.
PK is ADM4_PCODE (Philippine Standard Geographic Code for barangay level).
Geometry column is named `geometry` (EPSG:4326) — NOT `boundary` or `geom`.
"""

from sqlalchemy import Column, Text, Float
from geoalchemy2 import Geometry

from .base import Base


class Barangay(Base):
    __tablename__ = "ph_barangays"

    # Primary key: barangay-level PSGC code (e.g. "PH0722302001")
    ADM4_PCODE = Column("ADM4_PCODE", Text, primary_key=True)

    ADM4_EN    = Column("ADM4_EN",    Text)    # Barangay name (English)
    ADM4_REF   = Column("ADM4_REF",   Text)    # Reference code
    ADM3_EN    = Column("ADM3_EN",    Text)    # Municipality / City name
    ADM3_PCODE = Column("ADM3_PCODE", Text)    # Municipality / City PCODE
    ADM2_EN    = Column("ADM2_EN",    Text)    # Province name
    ADM2_PCODE = Column("ADM2_PCODE", Text)    # Province PCODE
    ADM1_EN    = Column("ADM1_EN",    Text)    # Region name
    ADM1_PCODE = Column("ADM1_PCODE", Text)    # Region PCODE
    ADM0_EN    = Column("ADM0_EN",    Text)    # Country name
    ADM0_PCODE = Column("ADM0_PCODE", Text)    # Country PCODE

    Shape_Leng = Column("Shape_Leng", Float)   # Perimeter in degrees
    Shape_Area = Column("Shape_Area", Float)   # Area in square degrees
    AREA_SQKM  = Column("AREA_SQKM",  Float)   # Area in square kilometres

    # Geometry column — named `geometry` in the actual DB (not `boundary` or `geom`)
    geometry = Column(Geometry("GEOMETRY", srid=4326))
