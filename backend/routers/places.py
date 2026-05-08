from fastapi import APIRouter, Query
from services.placesService import (
    fetchRestaurantTypesForRegion,
    discoverRestaurants,
)

router = APIRouter(prefix="/api", tags=["places"])


@router.get("/restaurant-types")
def get_restaurant_types(region: str = "Cebu"):
    normalizedRegion = region.lower()

    if normalizedRegion not in ["cebu", "manila"]:
        return {
            "error": "Invalid region. Only 'Cebu' or 'Manila' are accepted."
        }

    try:
        types = fetchRestaurantTypesForRegion(normalizedRegion)

        return {
            "region": normalizedRegion.capitalize(),
            "types": types
        }

    except Exception as err:
        return {
            "error": str(err)
        }


@router.get("/restaurants")
def get_restaurants(
    region: str = "Cebu",
    filters: str = ""
):
    normalizedRegion = region.capitalize()

    if normalizedRegion not in ["Cebu", "Manila"]:
        return {
            "error": "Invalid region. Only 'Cebu' or 'Manila' are accepted."
        }

    try:
        # Pass filters as-is; the service will handle splitting and normalization
        restaurants = discoverRestaurants(
            normalizedRegion,
            filters
        )

        return {
            "region": normalizedRegion,
            "restaurants": restaurants,
            "count": len(restaurants)
        }

    except Exception as err:
        print(f"API ERROR in /restaurants: {str(err)}")
        return {
            "error": str(err),
            "restaurants": []
        }