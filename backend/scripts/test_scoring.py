import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from services.analysis_service import run_analysis
from core.config import settings

async def test_scoring():
    print("Initializing test_scoring...")
    # Setup DB session
    print(f"Connecting to DB at {settings.ASYNC_DATABASE_URL}...")
    try:
        engine = create_async_engine(settings.ASYNC_DATABASE_URL, echo=True)
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    except Exception as e:
        print(f"Failed to create engine: {e}")
        return

    # Locations to test
    locations = [
        {"name": "Cebu IT Park (High Foot Traffic)", "lat": 10.3297, "lon": 123.9059},
        {"name": "Guadalupe Residential (Lower Foot Traffic)", "lat": 10.3208, "lon": 123.8845},
    ]

    async with AsyncSessionLocal() as session:
        for loc in locations:
            print(f"\nAnalyzing: {loc['name']} ({loc['lat']}, {loc['lon']})")
            try:
                result = await run_analysis(
                    session=session,
                    lon=loc['lon'],
                    lat=loc['lat'],
                    name=loc['name']
                )
                print(f"Overall Score: {result['overall_score']:.2f}")
                print(f"Foot Traffic Score: {result['foot_traffic_score']:.2f}")
                print(f"Stars: {result['stars']} *")
                print(f"Pros: {', '.join(result['pros'])}")
                print(f"Cons: {', '.join(result['cons'])}")
            except Exception as e:
                print(f"Error analyzing {loc['name']}: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_scoring())
