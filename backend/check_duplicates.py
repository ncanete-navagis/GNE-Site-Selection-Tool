import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    url = os.environ.get('ASYNC_DATABASE_URL')
    if not url:
        print("No URL")
        return
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        res = await conn.execute(text('SELECT lat, long, count(*) as cnt FROM cebu_properties GROUP BY lat, long HAVING count(*) > 1 ORDER BY cnt DESC LIMIT 10'))
        rows = res.all()
        if not rows:
            print("No duplicate coordinates found.")
        for r in rows:
            print(f"Lat: {r[0]}, Lng: {r[1]}, Count: {r[2]}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
