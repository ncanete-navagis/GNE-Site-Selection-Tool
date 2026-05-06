"""
routers/traffic.py — FastAPI router for Traffic Data API.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from dependencies import get_db
from models.traffic import TrafficData

router = APIRouter(prefix="/api/v1/traffic", tags=["Traffic"])

@router.get("/", response_model=Dict[str, Any])
async def get_traffic(
    xmin: float = Query(...), ymin: float = Query(...), xmax: float = Query(...), ymax: float = Query(...),
    db: AsyncSession = Depends(get_db)
):
    envelope = func.ST_MakeEnvelope(xmin, ymin, xmax, ymax, 4326)
    features = []
    stmt = select(TrafficData, func.ST_AsGeoJSON(TrafficData.geom).label("geojson")).where(func.ST_Intersects(TrafficData.geom, envelope)).limit(1000)
    result = await db.execute(stmt)
    import json
    for row in result.all():
        obj, geojson_str = row
        properties = {k: str(v) if k == "traffic_id" else v for k, v in obj.__dict__.items() if not k.startswith("_") and k != "geom"}
        features.append({"type": "Feature", "geometry": json.loads(geojson_str), "properties": properties})
    return {"type": "FeatureCollection", "features": features}
