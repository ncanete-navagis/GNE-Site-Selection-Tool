import os
import sys
import asyncio
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

from sqlalchemy import select, func, cast, literal_column
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from geoalchemy2 import Geography
import time

from models.hazard import FloodHazard, LandslideHazard, StormSurgeHazard
from models.building import CebuBuilding, ManilaBuilding

ASYNC_DATABASE_URL = os.environ.get("ASYNC_DATABASE_URL", "postgresql+asyncpg://postgres:123@localhost:5432/gne_db")

engine = create_async_engine(ASYNC_DATABASE_URL, echo=False, connect_args={"prepared_statement_cache_size": 0})

async def profile_query(session, name, model, geom_col, lon, lat, radius_m, extra_filter=None):
    point_geog = cast(
        func.ST_SetSRID(func.ST_MakePoint(literal_column(str(lon)), literal_column(str(lat))), 4326),
        Geography,
    )

    query = select(model).where(
        func.ST_DWithin(
            cast(geom_col, Geography),
            point_geog,
            literal_column(str(radius_m)),
        )
    )
    if extra_filter is not None:
        query = query.where(extra_filter)

    start = time.time()
    rows = await session.execute(query)
    res = rows.scalars().all()
    end = time.time()
    
    print(f"{name:.<30} { (end-start)*1000:>10.2f} ms ({len(res)} rows)")

async def run():
    async with AsyncSession(engine) as session:
        lon, lat = 123.922202522068, 10.3552359393416
        radius_m = 250.0
        
        print(f"Profiling queries for radius {radius_m}m at ({lon}, {lat})")
        print("-" * 50)
        
        await profile_query(session, "FloodHazard", FloodHazard, FloodHazard.geometry, lon, lat, radius_m)
        await profile_query(session, "LandslideHazard", LandslideHazard, LandslideHazard.geometry, lon, lat, radius_m)
        await profile_query(session, "StormSurgeHazard", StormSurgeHazard, StormSurgeHazard.geometry, lon, lat, radius_m)
        
        amenities = ['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'food_court', 'biergarten', 'ice_cream', 'juice_bar']
        await profile_query(session, "CebuBuilding", CebuBuilding, CebuBuilding.geom, lon, lat, radius_m, CebuBuilding.amenity.in_(amenities))
        await profile_query(session, "ManilaBuilding", ManilaBuilding, ManilaBuilding.geom, lon, lat, radius_m, ManilaBuilding.amenity.in_(amenities))

if __name__ == "__main__":
    asyncio.run(run())
