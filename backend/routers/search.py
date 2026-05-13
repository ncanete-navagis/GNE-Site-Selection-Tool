# router/search.py

from fastapi import APIRouter, Query, HTTPException
from services.placesSearch import get_place_autocomplete, get_place_details

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/autocomplete")
async def search_places(
    q: str = Query(..., min_length=1),
    city: str = Query("cebu")
):
    """
    Returns autocomplete predictions for search bar.
    """
    try:
        results = get_place_autocomplete(q, city)
        return {
            "query": q,
            "city": city,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/place-details")
async def place_details(
    place_id: str = Query(..., min_length=1)
):
    """
    Returns details (lat, lng, address) for a specific place_id.
    """
    try:
        details = get_place_details(place_id)
        if not details:
            raise HTTPException(status_code=404, detail="Place not found")
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))