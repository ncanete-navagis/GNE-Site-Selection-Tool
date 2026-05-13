import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from dependencies import get_db
from models.building import CebuBuilding, ManilaBuilding

router = APIRouter(
    prefix="/api/v1/buildings",
    tags=["Buildings"]
)

@router.get("/")
async def get_buildings(
    region: str = Query("Cebu"),
    xmin: float = Query(...),
    ymin: float = Query(...),
    xmax: float = Query(...),
    ymax: float = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns buildings for a given region and bounding box using async SQLAlchemy.
    """
    model = CebuBuilding if region.lower() == "cebu" else ManilaBuilding
    
    # Bounding box filter
    bbox = func.ST_SetSRID(func.ST_MakeEnvelope(xmin, ymin, xmax, ymax), 4326)
    
    # Simple query using ST_AsGeoJSON
    stmt = select(
        model.ogc_fid,
        model.name,
        model.amenity,
        func.ST_AsGeoJSON(model.geom).label("geojson")
    ).where(
        func.ST_Intersects(model.geom, bbox)
    ).limit(2000)
    
    try:
        result = await db.execute(stmt)
        
        features = []
        for row in result.all():
            fid, name, amenity, geojson_str = row
            
            features.append({
                "type": "Feature",
                "geometry": json.loads(geojson_str),
                "properties": {
                    "id": fid,
                    "name": name or f"Building {fid}",
                    "amenity": amenity,
                    "dataType": "building"
                }
            })
        
        return {
            "type": "FeatureCollection",
            "features": features
        }

    except Exception as e:
        print(f"Error fetching buildings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
