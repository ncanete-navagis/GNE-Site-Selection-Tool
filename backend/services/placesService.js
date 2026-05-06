// /backend/services/placeService.js
import "dotenv/config";
import axios from "axios";

const API_KEY = process.env.GOOGLE_API_KEY;

const BASE_HEADERS = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": API_KEY,
};

export async function fetchPlacesByText(query) {
    const url = "https://places.googleapis.com/v1/places:searchText";

    const body = {
        textQuery: query,
        maxResultCount: 10,
    };

    const headers = {
        ...BASE_HEADERS,
        "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.types,places.id",
    };

    const res = await axios.post(url, body, { headers });
    return res.data.places || [];
}

export async function fetchNearbyPlaces(lat, lng) {
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const body = {
        includedTypes: ["restaurant"],
        maxResultCount: 10,
        locationRestriction: {
            circle: {
                center: { latitude: lat, longitude: lng },
                radius: 500.0,
            },
        },
    };

    const headers = {
        ...BASE_HEADERS,
        "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.types,places.id,places.rating,places.priceLevel",
    };

    const res = await axios.post(url, body, { headers });
    return res.data.places || [];
}

export const REGION_COORDS = {
    Cebu: { lat: 10.3157, lng: 123.8854 },
    Manila: { lat: 14.5995, lng: 120.9842 }
};

const regionTypesCache = new Map();

export async function fetchRestaurantTypesForRegion(region) {
    const normalizedRegion = region?.charAt(0).toUpperCase() + region?.slice(1).toLowerCase() || "Cebu";
    
    if (regionTypesCache.has(normalizedRegion)) {
        return regionTypesCache.get(normalizedRegion);
    }

    const coords = REGION_COORDS[normalizedRegion] || REGION_COORDS.Cebu;
    const places = await fetchNearbyPlaces(coords.lat, coords.lng);

    const extractedTypes = [...new Set(
        places.flatMap(place => place.types || [])
              .filter(type => type.includes("restaurant") || type === "cafe")
    )];

    regionTypesCache.set(normalizedRegion, extractedTypes);

    return extractedTypes;
}