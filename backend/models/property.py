from sqlalchemy import Column, Float, Integer, String
from geoalchemy2 import Geometry
from .base import Base

class CebuProperty(Base):
    """Maps to `cebu_properties` table."""
    __tablename__ = "cebu_properties"

    # Using url as primary key since there's no id column in the schema
    url = Column(String, primary_key=True)
    title = Column(String)
    price = Column(Float)
    purpose = Column(String)
    category = Column(String)
    area = Column(Float)
    location = Column(String)
    coverphotourl = Column(String)
    lat = Column(Float)
    long = Column(Float)
    random_shape_polygon = Column(Geometry(geometry_type='GEOMETRY', srid=4326))
