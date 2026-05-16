"""
routers/choroplethRouter.py — FastAPI router for choropleth map data.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_db
from services import choroplethService
from services import choroplethRadiusService  # NEW SERVICE
import logging

logger = logging.getLogger("uvicorn.error")

router = APIRouter(
    prefix="/api/v1/choropleth",
    tags=["Choropleth"],
)


@router.get("/population")
async def get_population_choropleth(
    region: str = Query("Cebu", description="Region to fetch data for (Cebu or Manila)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a GeoJSON FeatureCollection of barangays with population density scores.
    Full region-based choropleth.
    """
    if region.lower() not in ["cebu", "manila"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid region. Supported regions are 'Cebu' and 'Manila'."
        )

    logger.info(f"Choropleth request for region: {region}")

    try:
        data = await choroplethService.get_population_choropleth(db, region)
        return data
    except Exception as e:
        logger.error(f"Error generating choropleth: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating choropleth data.")


# NEW ENDPOINT 👇
@router.get("/radius")
async def get_radius_choropleth(
    lat: float = Query(..., description="Latitude of the pin"),
    lng: float = Query(..., description="Longitude of the pin"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a GeoJSON FeatureCollection of barangays within 10km of a point.
    Used for localized choropleth rendering around a marker.
    """

    logger.info(f"Radius choropleth request at lat={lat}, lng={lng}")

    try:
        data = await choroplethRadiusService.get_population_choropleth_within_radius(
            db,
            lat,
            lng
        )
        return data

    except Exception as e:
        logger.error(f"Error generating radius choropleth: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error generating radius choropleth data."
        )