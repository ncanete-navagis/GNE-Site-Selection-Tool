import httpx
import asyncio
import time

async def test():
    url = "http://localhost:8000/api/v1/recommendations/generate"
    payload = {
        "longitude": 123.922202522068,
        "latitude": 10.3552359393416,
        "radius_m": 250
    }
    
    start = time.time()
    print("Sending POST to", url)
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, json=payload)
            print("Status:", resp.status_code)
    except Exception as e:
        print("Error:", e)
    elapsed = time.time() - start
    print(f"Total request took: {elapsed:.2f}s")

if __name__ == "__main__":
    asyncio.run(test())
