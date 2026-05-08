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
