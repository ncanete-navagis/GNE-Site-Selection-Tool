import os
import requests
from .placesService import REGION_CONFIG

def discoverRestaurants(region, filters):
    config = REGION_CONFIG.get(region, REGION_CONFIG["Cebu"])
    url = "https://places.googleapis.com/v1/places:searchNearby"

    body = {
        "includedTypes": ["restaurant"],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": { "latitude": config["lat"], "longitude": config["lng"] },
                "radius": config.get("radius", 2000.0),
            },
        },
    }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": os.environ.get("GOOGLE_API_KEY", ""),
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.types,places.id,places.rating,places.location",
    }

    res = requests.post(url, json=body, headers=headers)
    res.raise_for_status()
    places = res.json().get("places", [])

    restaurants = []
    for place in places:
        location = place.get("location", {})
        restaurants.append({
            "id": place.get("id", ""),
            "name": place.get("displayName", {}).get("text", ""),
            "lat": location.get("latitude"),
            "lng": location.get("longitude"),
            "address": place.get("formattedAddress", ""),
            "rating": place.get("rating"),
            "types": place.get("types", [])
        })

    if filters:
        filterList = [f.strip().lower() for f in filters.split(",") if f.strip()]
        if len(filterList) > 0:
            filtered = []
            for r in restaurants:
                if any(t.lower() in filterList for t in r.get("types", [])):
                    filtered.append(r)
            restaurants = filtered

    return restaurants
