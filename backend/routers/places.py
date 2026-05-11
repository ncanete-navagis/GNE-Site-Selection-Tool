import os
from fastapi import APIRouter, HTTPException, Query
import httpx
from typing import Dict, Any, List, Optional
from core.config import settings
from services import placesService

router = APIRouter(
    prefix="/api/v1/places",
    tags=["Places"]
)

REGION_COORDS = {
    "Cebu": {"lat": 10.3157, "lng": 123.8854},
    "Manila": {"lat": 14.5995, "lng": 120.9842}
}

region_types_cache = {}

def get_base_headers() -> Dict[str, str]:
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY is not set in backend")
    return {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
    }

async def fetch_nearby_places(lat: float, lng: float) -> List[Dict[str, Any]]:
    url = "https://places.googleapis.com/v1/places:searchNearby"
    body = {
        "includedTypes": ["restaurant"],
        "maxResultCount": 10,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 500.0,
            }
        }
    }
    headers = get_base_headers()
    headers["X-Goog-FieldMask"] = "places.displayName,places.formattedAddress,places.types,places.id,places.rating,places.priceLevel"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=body, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Google Places API Error: {response.text}")
        data = response.json()
        return data.get("places", [])

@router.get("/restaurant-types")
async def get_restaurant_types(region: Optional[str] = Query("Cebu")):
    normalized_region = region.capitalize() if region else "Cebu"
    
    if normalized_region not in ["Cebu", "Manila"]:
        raise HTTPException(status_code=400, detail="Invalid region. Only 'Cebu' or 'Manila' are accepted.")

    if normalized_region in region_types_cache:
        return {"region": normalized_region, "types": region_types_cache[normalized_region]}

    coords = REGION_COORDS.get(normalized_region, REGION_COORDS["Cebu"])
    places = await fetch_nearby_places(coords["lat"], coords["lng"])
    
    extracted_types = set()
    for place in places:
        for t in place.get("types", []):
            if "restaurant" in t or t == "cafe":
                extracted_types.add(t)
                
    types_list = list(extracted_types)
    region_types_cache[normalized_region] = types_list

    return {"region": normalized_region, "types": types_list}


@router.get("/filter-options")
def get_filter_options(region: Optional[str] = Query("Cebu")):
    """
    New endpoint dedicated to providing simple filter dropdown data.
    Returns a simple array of strings.
    """
    return placesService.fetchRestaurantTypesForRegion(region)


@router.get("/search")
def search_restaurants(region: Optional[str] = Query("Cebu"), filters: Optional[str] = Query("")):
    """
    Returns a list of restaurants for a given region and filters.
    Used for rendering restaurant location pins on the map.
    """
    return placesService.discoverRestaurants(region, filters)
