"""
services/external_places.py — Google Places API integration for foot traffic proxies.

This service calls the Google Places API (New) to retrieve business density and
popularity metrics (user review counts) which serve as a proxy for foot traffic.
"""

import httpx
from typing import Optional, Dict, Any
from core.config import settings
from utils.logger import get_logger

logger = get_logger()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def get_foot_traffic_proxy(
    lat: float,
    lng: float,
    radius_m: float = 500.0,
) -> Dict[str, Any]:
    """Retrieve aggregated popularity data for a location.

    Calls the Google Places API searchNearby endpoint and sums the
    userRatingCount of returned establishments.

    Args:
        lat: Latitude of the search centre.
        lng: Longitude of the search centre.
        radius_m: Search radius in metres.

    Returns:
        A dict containing:
            "total_user_ratings": Sum of userRatingCount for nearby places.
            "place_count": Number of places returned.
    """
    if not settings.GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set. Foot traffic proxy will return 0.")
        return {"total_user_ratings": 0, "place_count": 0}

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.userRatingCount,places.id",
    }

    body = {
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius_m,
            }
        },
        "maxResultCount": 20,  # Max allowed for searchNearby (New) is 20 per request
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(SEARCH_NEARBY_URL, json=body, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Google Places API error ({response.status_code}): {response.text}")
                return {"total_user_ratings": 0, "place_count": 0}

            data = response.json()
            places = data.get("places", [])
            
            total_ratings = sum(p.get("userRatingCount", 0) for p in places)
            
            return {
                "total_user_ratings": total_ratings,
                "place_count": len(places)
            }

    except Exception as e:
        logger.exception(f"Unexpected error fetching foot traffic proxy: {e}")
        return {"total_user_ratings": 0, "place_count": 0}

async def reverse_geocode(
    lat: float,
    lng: float,
) -> Dict[str, Optional[str]]:
    """Convert coordinates into human-readable street and house number.

    Calls the Google Geocoding API.

    Args:
        lat: Latitude.
        lng: Longitude.

    Returns:
        A dict containing:
            "street": Street name (route).
            "house_number": House number (street_number, premise, or subpremise).
    """
    if not settings.GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set. reverse_geocode will return None.")
        return {"street": None, "house_number": None}

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "latlng": f"{lat},{lng}",
        "key": settings.GOOGLE_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code != 200:
                logger.error(f"Google Geocoding API error ({response.status_code}): {response.text}")
                return {"street": None, "house_number": None}

            data = response.json()
            results = data.get("results", [])
            
            if not results:
                return {"street": None, "house_number": None}

            street = None
            house_number = None
            
            # Iterate through results to find the most specific street/number
            for result in results:
                components = result.get("address_components", [])
                
                for comp in components:
                    types = comp.get("types", [])
                    
                    # Look for street
                    if not street and "route" in types:
                        street = comp.get("long_name")
                    
                    # Look for house number / lot
                    if not house_number:
                        if "street_number" in types:
                            house_number = comp.get("long_name")
                        elif "premise" in types:
                            house_number = comp.get("long_name")
                        elif "subpremise" in types:
                            house_number = comp.get("long_name")
                
                # If we found both, we can stop
                if street and house_number:
                    break
            
            return {
                "street": street,
                "house_number": house_number
            }

    except Exception as e:
        logger.exception(f"Unexpected error in reverse_geocode: {e}")
        return {"street": None, "house_number": None}
async def get_traffic_speed_proxy(
    lat: float,
    lng: float,
) -> float:
    """Estimate live traffic speed near the location.
    
    Uses Distance Matrix API to check travel time for a 500m segment
    near the site with departure_time='now'.
    
    Returns:
        Estimated speed in km/h.
    """
    if not settings.GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set. Returning default 30.0 km/h.")
        return 30.0

    # Destination roughly 500m North
    lat_dest = lat + 0.0045 # ~500m
    lng_dest = lng

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": f"{lat},{lng}",
        "destinations": f"{lat_dest},{lng_dest}",
        "departure_time": "now",
        "key": settings.GOOGLE_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code != 200:
                logger.error(f"Distance Matrix API error: {response.text}")
                return 30.0

            data = response.json()
            rows = data.get("rows", [])
            if not rows:
                return 30.0
            
            elements = rows[0].get("elements", [])
            if not elements:
                return 30.0
            
            element = elements[0]
            if element.get("status") != "OK":
                return 30.0

            # Get distance in meters and duration in traffic in seconds
            dist_m = element.get("distance", {}).get("value", 500)
            dur_s = element.get("duration_in_traffic", {}).get("value", 60)

            # speed (km/h) = (dist / 1000) / (dur / 3600)
            speed = (dist_m / 1000.0) / (dur_s / 3600.0)
            
            # Sanity check: cap between 5 and 100
            return max(5.0, min(100.0, speed))

    except Exception as e:
        logger.exception(f"Error in get_traffic_speed_proxy: {e}")
        return 30.0
