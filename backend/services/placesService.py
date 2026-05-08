import os
import requests

API_KEY = os.environ.get("GOOGLE_API_KEY", "")

BASE_HEADERS = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": API_KEY,
}

def fetchPlacesByText(query):
    url = "https://places.googleapis.com/v1/places:searchText"
    body = {
        "textQuery": query,
        "maxResultCount": 10,
    }
    headers = {
        **BASE_HEADERS,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.types,places.id",
    }
    res = requests.post(url, json=body, headers=headers)
    res.raise_for_status()
    return res.json().get("places", [])

def fetchNearbyPlaces(lat, lng, radius):
    url = "https://places.googleapis.com/v1/places:searchNearby"
    body = {
        "includedTypes": ["restaurant"],
        "maxResultCount": 10,
        "locationRestriction": {
            "circle": {
                "center": { "latitude": lat, "longitude": lng },
                "radius": radius or 500.0,
            },
        },
    }
    headers = {
        **BASE_HEADERS,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.types,places.id,places.rating,places.priceLevel",
    }
    res = requests.post(url, json=body, headers=headers)
    res.raise_for_status()
    return res.json().get("places", [])

REGION_CONFIG = {
    "Cebu": {
        "lat": 10.3157,
        "lng": 123.8854,
        "radius": 15000.0 # Optimal for Cebu's moderate density
    },
    "Manila": {
        "lat": 14.5995,
        "lng": 120.9842,
        "radius": 30000.0 # Optimal for Manila's high density
    }
}

regionTypesCache = {}
regionRestaurantsCache = {}

def fetchRestaurantTypesForRegion(region):
    normalizedRegion = (region[0].upper() + region[1:].lower()) if region else "Cebu"
    
    if normalizedRegion in regionTypesCache:
        return regionTypesCache[normalizedRegion]

    config = REGION_CONFIG.get(normalizedRegion, REGION_CONFIG["Cebu"])
    places = fetchNearbyPlaces(config["lat"], config["lng"], config["radius"])

    types_set = set()
    for place in places:
        for t in place.get("types", []):
            if "restaurant" in t or t == "cafe":
                types_set.add(t)
    
    extractedTypes = list(types_set)
    regionTypesCache[normalizedRegion] = extractedTypes

    return extractedTypes

def discoverRestaurants(region, filters=None):
    if filters is None:
        filters = []
        
    normalizedRegion = (region[0].upper() + region[1:].lower()) if region else "Cebu"
    config = REGION_CONFIG.get(normalizedRegion, REGION_CONFIG["Cebu"])

    allRestaurants = []

    # Check if we already have the raw restaurant data for this region cached
    if normalizedRegion in regionRestaurantsCache:
        allRestaurants = regionRestaurantsCache[normalizedRegion]
    else:
        url = "https://places.googleapis.com/v1/places:searchNearby"
        body = {
            "includedTypes": ["restaurant", "cafe", "bakery", "bar", "meal_takeaway"], # Broader inclusion for robust filtering
            "maxResultCount": 50, # Higher limit for better client-side filtering
            "locationRestriction": {
                "circle": {
                    "center": { "latitude": config["lat"], "longitude": config["lng"] },
                    "radius": config["radius"],
                },
            },
        }

        headers = {
            **BASE_HEADERS,
            "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.types",
        }

        try:
            res = requests.post(url, json=body, headers=headers)
            res.raise_for_status()
            places = res.json().get("places", [])

            # Deduplicate and normalize
            seenIds = set()
            for place in places:
                place_id = place.get("id")
                if place_id and place_id not in seenIds:
                    seenIds.add(place_id)
                    location = place.get("location", {})
                    allRestaurants.append({
                        "place_id": place_id,
                        "name": place.get("displayName", {}).get("text", ""),
                        "geometry": {
                            "location": {
                                "lat": location.get("latitude"),
                                "lng": location.get("longitude"),
                            }
                        },
                        "vicinity": place.get("formattedAddress", ""),
                        "rating": place.get("rating"),
                        "types": place.get("types", [])
                    })

            # Store in cache
            regionRestaurantsCache[normalizedRegion] = allRestaurants
        except Exception as err:
            print("Error discovering restaurants:", err)
            raise err

    # Efficient multi-filter matching
    if filters and len(filters) > 0:
        filterSet = {f.strip().lower() for f in filters}
        filteredRestaurants = []
        for r in allRestaurants:
            if any(t.lower() in filterSet for t in r.get("types", [])):
                filteredRestaurants.append(r)
        return filteredRestaurants

    return allRestaurants
