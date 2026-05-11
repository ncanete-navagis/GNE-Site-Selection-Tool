import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    db_url = "postgresql+asyncpg://postgres:%40Rondina1234@localhost:5432/Project"
    engine = create_async_engine(db_url)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT random_shape_polygon FROM cebu_properties WHERE random_shape_polygon IS NOT NULL LIMIT 1"))
        val = res.fetchone()
        print("Sample random_shape_polygon:", val[0] if val else "No data")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
