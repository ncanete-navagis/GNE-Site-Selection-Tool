# router/search.py

from fastapi import APIRouter, Query
from service.placesSearch import get_place_autocomplete

router = APIRouter()


@router.get("/search/autocomplete")
def search_places(
    q: str = Query(..., min_length=1),
    city: str = Query("cebu")  # default Cebu
):
    """
    Returns autocomplete predictions for search bar
    restricted to Cebu or Manila only.
    """

    results = get_place_autocomplete(q, city)

    return {
        "query": q,
        "city": city,
        "results": results
    }