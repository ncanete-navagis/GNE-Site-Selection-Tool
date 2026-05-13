import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost/gne_db')
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT count(*), min(ST_X(ST_Centroid(geom))), max(ST_X(ST_Centroid(geom))), min(ST_Y(ST_Centroid(geom))), max(ST_Y(ST_Centroid(geom))) FROM cebu_buildings'))
        print(res.all())

asyncio.run(main())
