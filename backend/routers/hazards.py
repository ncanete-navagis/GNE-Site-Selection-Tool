"""
routers/hazards.py — FastAPI router for Hazard Data API.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from dependencies import get_db
from models.hazard import FloodHazard, LandslideHazard, StormSurgeHazard

router = APIRouter(
    prefix="/api/v1/hazards",
    tags=["Hazards"]
)

@router.get("/", response_model=Dict[str, Any])
async def get_hazards(
    xmin: float = Query(..., description="Western longitude bound"),
    ymin: float = Query(..., description="Southern latitude bound"),
    xmax: float = Query(..., description="Eastern longitude bound"),
    ymax: float = Query(..., description="Northern latitude bound"),
    hazard_type: Optional[str] = Query(None, description="flood, landslide, or storm_surge"),
    db: AsyncSession = Depends(get_db)
):
    envelope = func.ST_MakeEnvelope(xmin, ymin, xmax, ymax, 4326)
    features = []
    models = [(FloodHazard, "flood"), (LandslideHazard, "landslide"), (StormSurgeHazard, "storm_surge")]
    import json
    for model, label in models:
        if hazard_type and hazard_type != label: continue
        stmt = select(model, func.ST_AsGeoJSON(model.geometry).label("geojson")).where(func.ST_Intersects(model.geometry, envelope)).limit(1000)
        result = await db.execute(stmt)
        for row in result.all():
            obj, geojson_str = row
            properties = {k: v for k, v in obj.__dict__.items() if not k.startswith("_") and k != "geometry"}
            properties["hazard_type"] = label
            features.append({"type": "Feature", "geometry": json.loads(geojson_str), "properties": properties})
    return {"type": "FeatureCollection", "features": features}
