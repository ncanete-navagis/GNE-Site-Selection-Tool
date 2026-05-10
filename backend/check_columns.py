import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    url = os.environ.get('ASYNC_DATABASE_URL')
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'cebu_properties'"))
        columns = [r[0] for r in res]
        print("Columns in cebu_properties:")
        for col in columns:
            print(f" - {col}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
