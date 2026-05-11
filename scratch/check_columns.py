import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    db_url = "postgresql+asyncpg://postgres:%40Rondina1234@localhost:5432/Project"
    engine = create_async_engine(db_url)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'cebu_properties'"))
        columns = [r[0] for r in res.fetchall()]
        print("Columns in cebu_properties:", columns)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
