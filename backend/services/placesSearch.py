# service/placesSearch.py

import os
import requests

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

CITIES = {
    "cebu": {"lat": 10.3157, "lng": 123.8854},
    "manila": {"lat": 14.5995, "lng": 120.9842},
}


def get_place_autocomplete(query: str, city: str = "cebu"):
    """
    Returns autocomplete predictions for search bar biased towards a city.
    """
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment")

    if city.lower() not in CITIES:
        # If city is not explicitly handled, we still allow search but maybe without bias or with a generic PH bias
        location = CITIES["cebu"] # Fallback to Cebu bias
    else:
        location = CITIES[city.lower()]

    url = "https://places.googleapis.com/v1/places:autocomplete"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "suggestions.placePrediction.text,suggestions.placePrediction.placeId"
    }

    body = {
        "input": query,
        "locationBias": {
            "circle": {
                "center": {
                    "latitude": location["lat"],
                    "longitude": location["lng"]
                },
                "radius": 50000  # 50km bias
            }
        },
        "includedRegionCodes": ["ph"]
    }

    try:
        response = requests.post(url, json=body, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        suggestions = []
        for item in data.get("suggestions", []):
            prediction = item.get("placePrediction", {})
            suggestions.append({
                "text": prediction.get("text", {}).get("text"),
                "placeId": prediction.get("placeId")
            })
        return suggestions
    except Exception as e:
        print(f"Error fetching autocomplete: {e}")
        return []


def get_place_details(place_id: str):
    """
    Retrieves place details (coords, formatted address) using Place ID.
    Uses Google Places API v1 (New).
    """
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment")

    url = f"https://places.googleapis.com/v1/places/{place_id}"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "id,location,formattedAddress,displayName"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        return {
            "place_id": data.get("id"),
            "formatted_address": data.get("formattedAddress"),
            "name": data.get("displayName", {}).get("text"),
            "lat": data.get("location", {}).get("latitude"),
            "lng": data.get("location", {}).get("longitude")
        }
    except Exception as e:
        print(f"Error fetching place details: {e}")
        return None