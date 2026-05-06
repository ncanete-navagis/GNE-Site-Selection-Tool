from sqlalchemy import Column, Float, String, Integer, Text, BigInteger
from geoalchemy2 import Geometry
from .base import Base

class FloodHazard(Base):
    __tablename__ = "combined_flood_hazards"
    
    _ctid = Column("ctid", Text, primary_key=True) # No declared PK — using PostgreSQL ctid as surrogate
    Var = Column(Float)
    geometry = Column(Geometry("GEOMETRY", srid=4326))
    city_tag = Column(String)

class LandslideHazard(Base):
    __tablename__ = "combined_landslide_hazards"
    
    _ctid = Column("ctid", Text, primary_key=True) # No declared PK — using PostgreSQL ctid as surrogate
    GRID = Column(Float)
    LH = Column(Float)
    geometry = Column(Geometry("GEOMETRY", srid=4326))
    city_tag = Column(String)

class StormSurgeHazard(Base):
    __tablename__ = "combined_storm_surge_hazards"
    
    _ctid = Column("ctid", Text, primary_key=True) # No declared PK — using PostgreSQL ctid as surrogate
    HAZ = Column(Float)
    geometry = Column(Geometry("GEOMETRY", srid=4326))
    city_tag = Column(String)
    surge_level = Column(BigInteger)
