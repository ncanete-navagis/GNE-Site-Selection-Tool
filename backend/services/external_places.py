"""
services/external_places.py — Google Places API integration for foot traffic proxies.

This service calls the Google Places API (New) to retrieve business density and
popularity metrics (user review counts) which serve as a proxy for foot traffic.
"""

import httpx
from typing import Optional, Dict, Any, List
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
    client: Optional[httpx.AsyncClient] = None,
) -> Dict[str, Any]:
    """Retrieve aggregated popularity data for a location."""
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
        "maxResultCount": 20,
    }

    # If no client provided, use a one-off client
    _close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=10.0)
        _close_client = True

    try:
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
    finally:
        if _close_client:
            await client.aclose()

async def reverse_geocode(
    lat: float,
    lng: float,
    client: Optional[httpx.AsyncClient] = None,
) -> Dict[str, Optional[str]]:
    """Convert coordinates into human-readable street and house number."""
    if not settings.GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set. reverse_geocode will return None.")
        return {"street": None, "house_number": None}

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "latlng": f"{lat},{lng}",
        "key": settings.GOOGLE_API_KEY,
    }

    _close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=10.0)
        _close_client = True

    try:
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
        for result in results:
            components = result.get("address_components", [])
            for comp in components:
                types = comp.get("types", [])
                if not street and "route" in types:
                    street = comp.get("long_name")
                if not house_number:
                    if "street_number" in types or "premise" in types or "subpremise" in types:
                        house_number = comp.get("long_name")
            if street and house_number:
                break
        
        return {"street": street, "house_number": house_number}
    except Exception as e:
        logger.exception(f"Unexpected error in reverse_geocode: {e}")
        return {"street": None, "house_number": None}
    finally:
        if _close_client:
            await client.aclose()

async def get_traffic_speed_proxy(
    lat: float,
    lng: float,
    client: Optional[httpx.AsyncClient] = None,
) -> float:
    """Estimate live traffic speed near the location."""
    if not settings.GOOGLE_API_KEY:
        return 30.0

    lat_dest = lat + 0.0045 # ~500m
    lng_dest = lng

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": f"{lat},{lng}",
        "destinations": f"{lat_dest},{lng_dest}",
        "departure_time": "now",
        "key": settings.GOOGLE_API_KEY,
    }

    _close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=10.0)
        _close_client = True

    try:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            return 30.0

        data = response.json()
        rows = data.get("rows", [])
        if not rows or not rows[0].get("elements"):
            return 30.0
        
        element = rows[0]["elements"][0]
        if element.get("status") != "OK":
            return 30.0

        dist_m = element.get("distance", {}).get("value", 500)
        dur_s = element.get("duration_in_traffic", {}).get("value", 60)
        speed = (dist_m / 1000.0) / (dur_s / 3600.0)
        return max(5.0, min(100.0, speed))
    except Exception:
        return 30.0
    finally:
        if _close_client:
            await client.aclose()

SECTOR_TYPE_MAP = {
    "banks": ["bank", "atm"],
    "schools": ["school", "primary_school", "secondary_school", "university"],
    "malls": ["shopping_mall"],
    "hospitals": ["hospital"],
    "restaurants": ["restaurant", "cafe", "fast_food_restaurant", "bakery", "bar"],
}

async def _get_single_sector_count(
    lat: float,
    lng: float,
    radius_m: float,
    sector: str,
    client: httpx.AsyncClient
) -> int:
    """Fetch count for a single business sector with de-duplication logic."""
    types = SECTOR_TYPE_MAP.get(sector.lower(), [])
    if not types:
        return 0

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.types,places.location",
    }

    body = {
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius_m,
            }
        },
        "includedTypes": types,
        "maxResultCount": 20,
    }

    try:
        response = await client.post(SEARCH_NEARBY_URL, json=body, headers=headers)
        if response.status_code != 200:
            logger.error(f"Sector count error for {sector}: {response.text}")
            return 0
        
        data = response.json()
        places = data.get("places", [])
        logger.info(f"Raw places found for {sector}: {len(places)}")
        
        if not places:
            return 0

        # De-duplication Logic:
        # We group by name (lowercase) to avoid counting "Mall Wing A" and "Mall Wing B" separately
        # We also filter out items that are likely just components of a larger business.
        seen_names = set()
        unique_count = 0
        
        for p in places:
            display_name = p.get("displayName", {}).get("text", "").lower().strip()
            if not display_name:
                continue
                
            # Basic normalization: remove common suffixes that cause duplicates
            norm_name = display_name
            for suffix in [" - parking", " entrance", " wing", " annex", " building", " atm"]:
                if norm_name.endswith(suffix):
                    norm_name = norm_name.replace(suffix, "").strip()
            
            # If we haven't seen this name (or normalized name) yet, count it
            if norm_name not in seen_names:
                seen_names.add(norm_name)
                unique_count += 1
                
        return unique_count
    except Exception as e:
        logger.error(f"Error fetching sector count for {sector}: {e}")
        return 0

async def get_sector_counts(
    lat: float,
    lng: float,
    radius_m: float = 500.0,
    sectors: Optional[List[str]] = None,
    client: Optional[httpx.AsyncClient] = None,
) -> Dict[str, int]:
    """Retrieve counts for multiple business sectors in parallel using the connection pool."""
    if not sectors:
        return {}
    if not settings.GOOGLE_API_KEY:
        return {s: 0 for s in sectors}

    # If no client provided, create a one-off
    _close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=10.0)
        _close_client = True

    try:
        import asyncio
        tasks = [_get_single_sector_count(lat, lng, radius_m, s, client) for s in sectors]
        results = await asyncio.gather(*tasks)
        
        # Use original sector casing for keys to match frontend expectations
        return {sector: count for sector, count in zip(sectors, results)}
    except Exception as e:
        logger.error(f"Global error in get_sector_counts: {e}")
        return {s: 0 for s in sectors}
    finally:
        if _close_client:
            await client.aclose()
