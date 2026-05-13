import requests
import json

def test_choropleth(region):
    url = f"http://localhost:8000/api/choropleth/population?region={region}"
    print(f"Testing {region} choropleth...")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Received {len(data['features'])} features.")
            if len(data['features']) > 0:
                first_feature = data['features'][0]
                print(f"Sample Property: {first_feature['properties']}")
                # Validate GeoJSON structure
                assert data['type'] == "FeatureCollection"
                assert 'geometry' in first_feature
                assert 'properties' in first_feature
                assert 'densityScore' in first_feature['properties']
        else:
            print(f"Failed with status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Note: Make sure the server is running on localhost:8000
    test_choropleth("Cebu")
    test_choropleth("Manila")
