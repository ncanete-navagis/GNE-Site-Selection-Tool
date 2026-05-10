import os
from fastapi import APIRouter, HTTPException, Query
import httpx
from typing import Dict, Any, List, Optional
from core.config import settings

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

async def fetch_nearby_places(
    lat: float, 
    lng: float, 
    radius: float = 500.0,
    field_mask: str = "places.displayName,places.formattedAddress,places.types,places.id,places.rating,places.location"
) -> List[Dict[str, Any]]:
    url = "https://places.googleapis.com/v1/places:searchNearby"
    body = {
        "includedTypes": ["restaurant"],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius,
            }
        }
    }
    headers = get_base_headers()
    headers["X-Goog-FieldMask"] = field_mask

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=body, headers=headers)
        if response.status_code != 200:
            return []
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
    # Use a larger radius for type discovery (e.g., 5000m)
    places = await fetch_nearby_places(coords["lat"], coords["lng"], radius=5000.0)
    
    extracted_types = set()
    for place in places:
        for t in place.get("types", []):
            normalized_t = str(t).strip().lower()
            if "restaurant" in normalized_t or normalized_t == "cafe":
                extracted_types.add(normalized_t)
                
    types_list = sorted(list(extracted_types))
    region_types_cache[normalized_region] = types_list

    return {"region": normalized_region, "types": types_list}

@router.get("/restaurants")
async def get_restaurants(
    region: Optional[str] = Query("Cebu"),
    filters: Optional[str] = Query(None)
):
    normalized_region = region.capitalize() if region else "Cebu"
    coords = REGION_COORDS.get(normalized_region, REGION_COORDS["Cebu"])
    
    # Discovery usually uses a larger radius, e.g., 2000m as in the old service
    places = await fetch_nearby_places(coords["lat"], coords["lng"], radius=2000.0)
    
    restaurants = []
    for place in places:
        loc = place.get("location", {})
        restaurants.append({
            "id": place.get("id", ""),
            "name": place.get("displayName", {}).get("text", ""),
            "lat": loc.get("latitude"),
            "lng": loc.get("longitude"),
            "address": place.get("formattedAddress", ""),
            "rating": place.get("rating"),
            "types": [t.lower() for t in place.get("types", [])]
        })
        
    if filters:
        filter_list = [f.strip().lower() for f in filters.split(",") if f.strip()]
        if filter_list:
            restaurants = [
                r for r in restaurants 
                if any(f in r["types"] for f in filter_list)
            ]
            
    return {"region": normalized_region, "restaurants": restaurants}
