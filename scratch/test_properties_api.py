import asyncio
import httpx

async def test_properties():
    url = "http://127.0.0.1:8000/api/v1/properties/buying?min_lat=10.2&max_lat=10.4&min_lng=123.8&max_lng=124.0"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print(f"Count: {len(data)}")
                if len(data) > 0:
                    print(f"First property polygon: {data[0].get('random_shape_polygon')[:100] if data[0].get('random_shape_polygon') else 'None'}")
            else:
                print(f"Error: {resp.text}")
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_properties())
