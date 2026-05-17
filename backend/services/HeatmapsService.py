import os
import time
import requests
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Dictionary mapping zoom_level to cache data
_HEATMAP_CACHE = {}

CACHE_TTL_SECONDS = 60 * 60 * 6  # 6 hours


class HeatmapsService:

    @staticmethod
    def _is_cache_valid(zoom_level):
        cache_entry = _HEATMAP_CACHE.get(zoom_level)
        if not cache_entry:
            return False
        return (
            cache_entry["data"] is not None and
            (time.time() - cache_entry["timestamp"]) < CACHE_TTL_SECONDS
        )

    @staticmethod
    def get_step(zoom_level):
        if zoom_level <= 10:
            return 0.05
        elif zoom_level <= 13:
            return 0.02
        else:
            return 0.01

    @staticmethod
    def _generate_grid(min_lat, max_lat, min_lng, max_lng, step=0.015):
        points = []
        lat = min_lat

        while lat <= max_lat:
            lng = min_lng
            while lng <= max_lng:
                points.append((lat, lng))
                lng += step
            lat += step

        return points

    @staticmethod
    def _fetch_restaurants(lat, lng, radius=800):
        """
        Uses NEW Places API (v1) searchNearby
        """

        url = "https://places.googleapis.com/v1/places:searchNearby"

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_API_KEY,
            "X-Goog-FieldMask": "places.id"
        }

        body = {
            "includedTypes": ["restaurant"],
            "maxResultCount": 20,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lng
                    },
                    "radius": radius
                }
            }
        }

        try:
            res = requests.post(url, json=body, headers=headers, timeout=10)
            res.raise_for_status()
            data = res.json()

            places = data.get("places", [])

            # ✅ DEBUG LOG ADDED HERE
            print(f"[Heatmap Debug] lat={lat}, lng={lng}, restaurants_found={len(places)}")

            return len(places)

        except Exception as e:
            print(f"[Heatmap API Error] lat={lat}, lng={lng}, error={e}")
            return 0

    @staticmethod
    def generate_heatmap(zoom_level=12):
        if HeatmapsService._is_cache_valid(zoom_level):
            return _HEATMAP_CACHE[zoom_level]["data"]

        MIN_LAT, MAX_LAT = 10.25, 10.45
        MIN_LNG, MAX_LNG = 123.75, 124.05

        step = HeatmapsService.get_step(zoom_level)

        grid_points = HeatmapsService._generate_grid(
            MIN_LAT, MAX_LAT,
            MIN_LNG, MAX_LNG,
            step=step
        )

        def process_point(point):
            lat, lng = point
            try:
                count = HeatmapsService._fetch_restaurants(lat, lng)

                if count and count > 0:
                    return {
                        "lat": lat,
                        "lng": lng,
                        "weight": count
                    }
            except Exception:
                return None
            return None

        heatmap_data = []

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(process_point, p) for p in grid_points]

            for f in as_completed(futures):
                result = f.result()
                if result:
                    heatmap_data.append(result)

        result = {
            "city": "Cebu",
            "type": "restaurant_density",
            "data": heatmap_data
        }

        _HEATMAP_CACHE[zoom_level] = {
            "data": result,
            "timestamp": time.time()
        }

        return result