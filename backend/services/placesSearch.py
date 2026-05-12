# service/placesSearch.py

import os
import requests

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

CITIES = {
    "cebu": {"lat": 10.3157, "lng": 123.8854},
    "manila": {"lat": 14.5995, "lng": 120.9842},
}


def get_place_autocomplete(query: str, city: str = "cebu"):
    if city not in CITIES:
        raise ValueError("City must be either 'cebu' or 'manila'")

    location = CITIES[city]

    url = "https://places.googleapis.com/v1/places:autocomplete"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        # Optional but recommended for field filtering
        "X-Goog-FieldMask": "suggestions.placePrediction.text,suggestions.placePrediction.placeId"
    }

    body = {
        "input": query,

        # NEW way to bias location
        "locationBias": {
            "circle": {
                "center": {
                    "latitude": location["lat"],
                    "longitude": location["lng"]
                },
                "radius": 30000  # 30km bias around Cebu/Manila
            }
        },

        # Optional: restrict results more tightly to PH
        "includedRegionCodes": ["ph"]
    }

    response = requests.post(url, json=body, headers=headers)

    data = response.json()

    # Normalize output for frontend
    suggestions = []

    for item in data.get("suggestions", []):
        prediction = item.get("placePrediction", {})
        suggestions.append({
            "text": prediction.get("text", {}).get("text"),
            "placeId": prediction.get("placeId")
        })

    return suggestions