import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("GOOGLE_API_KEY", "")

if not API_KEY:
    raise Exception("GOOGLE_API_KEY environment variable is missing")

BASE_HEADERS = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": API_KEY,
}

REGION_CONFIG = {
    "Cebu": {
        "lat": 10.3157,
        "lng": 123.8854,
        "radius": 20000.0,
    },
    "Manila": {
        "lat": 14.5995,
        "lng": 120.9842,
        "radius": 12000.0,
    },
}

regionTypesCache = {}
regionRestaurantsCache = {}


def debug_response(res):
    print("\n================ GOOGLE API DEBUG ================")
    # print("STATUS:", res.status_code)
    # print("BODY:", res.text)
    print("==================================================\n")


def fetchPlacesByText(query):
    url = "https://places.googleapis.com/v1/places:searchText"

    body = {
        "textQuery": query,
        "maxResultCount": 10,
    }

    headers = {
        **BASE_HEADERS,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.formattedAddress,"
            "places.types,"
            "places.id,"
            "places.rating,"
            "places.location"
        ),
    }

    try:
        res = requests.post(
            url,
            json=body,
            headers=headers,
            timeout=15,
        )

        debug_response(res)

        res.raise_for_status()

        return res.json().get("places", [])

    except requests.exceptions.HTTPError as e:
        print("HTTP ERROR:", str(e))
        return []

    except Exception as e:
        print("GENERAL ERROR:", str(e))
        return []


def fetchNearbyPlaces(lat, lng, radius=5000.0, includedTypes=None):
    url = "https://places.googleapis.com/v1/places:searchNearby"

    if includedTypes is None:
        includedTypes = ["restaurant"]

    body = {
        "includedTypes": includedTypes,
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": lat,
                    "longitude": lng,
                },
                "radius": radius,
            }
        },
    }

    headers = {
        **BASE_HEADERS,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.formattedAddress,"
            "places.types,"
            "places.id,"
            "places.rating,"
            "places.priceLevel,"
            "places.location"
        ),
    }

    try:
        res = requests.post(
            url,
            json=body,
            headers=headers,
            timeout=15,
        )

        debug_response(res)

        res.raise_for_status()

        return res.json().get("places", [])

    except requests.exceptions.HTTPError as e:
        print("HTTP ERROR:", str(e))
        return []

    except Exception as e:
        print("GENERAL ERROR:", str(e))
        return []


def fetchRestaurantTypesForRegion(region):
    normalizedRegion = (
        region[0].upper() + region[1:].lower()
        if region
        else "Cebu"
    )

    if normalizedRegion in regionTypesCache:
        return regionTypesCache[normalizedRegion]

    config = REGION_CONFIG.get(
        normalizedRegion,
        REGION_CONFIG["Cebu"]
    )

    places = fetchNearbyPlaces(
        config["lat"],
        config["lng"],
        config["radius"],
    )

    types_set = set()

    for place in places:
        for t in place.get("types", []):
            # Robust normalization for matching and storage
            normalized_t = str(t).strip().lower()
            if "restaurant" in normalized_t or normalized_t == "cafe":
                types_set.add(normalized_t)

    extractedTypes = sorted(list(types_set))

    regionTypesCache[normalizedRegion] = extractedTypes

    return extractedTypes


def discoverRestaurants(region, filters=""):

    normalizedRegion = (
        region[0].upper() + region[1:].lower()
        if region
        else "Cebu"
    )

    config = REGION_CONFIG.get(
        normalizedRegion,
        REGION_CONFIG["Cebu"]
    )

    places = fetchNearbyPlaces(
        config["lat"],
        config["lng"],
        config["radius"],
    )

    restaurants = []

    for place in places:

        location = place.get("location", {})

        place_types = [
            str(t).strip().lower()
            for t in place.get("types", [])
        ]

        restaurants.append({
            "id": place.get("id", ""),
            "name": place.get("displayName", {}).get("text", ""),
            "lat": location.get("latitude"),
            "lng": location.get("longitude"),
            "address": place.get("formattedAddress", ""),
            "rating": place.get("rating"),
            "types": place_types
        })

    # FILTERING
    if filters:
        # Robust normalization of filters
        # Handle both string (comma-separated) and list inputs
        raw_filters = []
        if isinstance(filters, str):
            raw_filters = filters.split(",")
        elif isinstance(filters, list):
            raw_filters = filters

        filterList = [
            str(f).strip().lower().replace(" ", "_")
            for f in raw_filters
            if str(f).strip()
        ]

        if not filterList:
            return restaurants

        filtered_restaurants = []
        for restaurant in restaurants:
            restaurant_types = restaurant.get("types", [])
            matches = any(f in restaurant_types for f in filterList)
            if matches:
                filtered_restaurants.append(restaurant)
        restaurants = filtered_restaurants

    return restaurants


def discoverPOIs(region, types_list, lat=None, lng=None, radius=None):
    """
    Returns a list of POIs for a given region and a list of Google Place types.
    Can be optionally restricted to a specific circle using lat, lng, and radius.
    """
    normalizedRegion = (
        region[0].upper() + region[1:].lower()
        if region
        else "Cebu"
    )

    config = REGION_CONFIG.get(
        normalizedRegion,
        REGION_CONFIG["Cebu"]
    )

    if isinstance(types_list, str):
        types_list = [t.strip() for t in types_list.split(",") if t.strip()]

    # If lat/lng/radius are provided, use them! Otherwise fall back to region defaults
    search_lat = lat if lat is not None else config["lat"]
    search_lng = lng if lng is not None else config["lng"]
    search_radius = radius if radius is not None else config["radius"]

    places = fetchNearbyPlaces(
        search_lat,
        search_lng,
        search_radius,
        includedTypes=types_list
    )

    pois = []
    for place in places:
        location = place.get("location", {})
        pois.append({
            "id": place.get("id", ""),
            "name": place.get("displayName", {}).get("text", ""),
            "lat": location.get("latitude"),
            "lng": location.get("longitude"),
            "address": place.get("formattedAddress", ""),
            "rating": place.get("rating"),
            "types": [str(t).strip().lower() for t in place.get("types", [])]
        })

    return pois