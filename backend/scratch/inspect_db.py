import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    url = os.environ.get('ASYNC_DATABASE_URL')
    if not url:
        # Try DATABASE_URL if ASYNC_DATABASE_URL is not set, but convert to async driver
        url = os.environ.get('DATABASE_URL')
        if url and url.startswith('postgresql://'):
            url = url.replace('postgresql://', 'postgresql+asyncpg://')
            
    if not url:
        print("No database URL found")
        return

    print(f"Connecting to {url}")
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        cities = ['Cebu', 'Talisay', 'Consolacion', 'Liloan', 'Lapu-Lapu', 'Cordova', 'Mandaue']
        for city in cities:
            res = await conn.execute(text(f'SELECT DISTINCT "ADM3_EN" FROM ph_barangays WHERE "ADM2_EN" = \'Cebu\' AND "ADM3_EN" ILIKE \'%{city}%\''))
            print(f"Match for {city}: {[r[0] for r in res]}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
