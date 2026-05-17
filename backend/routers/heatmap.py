from fastapi import APIRouter
from services.HeatmapsService import HeatmapsService

router = APIRouter(
    prefix="/api/heatmap",
    tags=["Heatmap"]
)


@router.get("/restaurants")
def get_restaurant_heatmap(zoom: int = 12):
    """
    Returns restaurant density heatmap data using Places API (v1).
    Cached to avoid repeated API billing.
    """

    return {
        "success": True,
        "payload": HeatmapsService.generate_heatmap(zoom)
    }