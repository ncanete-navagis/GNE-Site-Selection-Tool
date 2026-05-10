import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

# These imports perfectly match your folder structure!
from dependencies import get_db
from models.hazard import FloodHazard, LandslideHazard, StormSurgeHazard

router = APIRouter(
    prefix="/api/v1/hazards",
    tags=["Hazards"]
)

@router.get("")
async def get_hazards(
    hazard_type: str = Query(None),
    city_tag: str = Query("Cebu"),
    zoom: float = Query(12.0),
    xmin: float = Query(None),
    ymin: float = Query(None),
    xmax: float = Query(None),
    ymax: float = Query(None),
    db: AsyncSession = Depends(get_db)
):
    # If the user selects "None" or the app first loads, return an empty FeatureCollection
    if not hazard_type or hazard_type == 'None':
        return {"type": "FeatureCollection", "features": []}

    # Map the exact text from your React API call to the correct DB Model
    if hazard_type == 'flood':
        model = FloodHazard
        severity = 'High'
        description = 'Flood Hazard Area'
        base_type = 'Flood'
        
    elif hazard_type == 'landslide':
        model = LandslideHazard
        severity = 'High'
        description = 'Landslide Susceptibility'
        base_type = 'Landslide'
        
    elif hazard_type == 'storm_surge':
        model = StormSurgeHazard
        severity = 'Unknown' # Resolved per feature below
        description = 'Storm Surge Hazard'
        base_type = 'Storm Surge'
    else:
        return {"type": "FeatureCollection", "features": []}

    # Dynamic simplification tolerance based on zoom level
    if zoom >= 17:
        tolerance = 0.00001
    elif zoom <= 12:
        tolerance = 0.001
    else:
        tolerance = 0.001 / (2 ** (zoom - 12))

    # Build the SQLAlchemy query safely
    stmt = select(
        model, 
        func.ST_AsGeoJSON(func.ST_Simplify(model.geometry, tolerance)).label("geojson")
    ).where(
        func.lower(func.trim(model.city_tag)) == city_tag.strip().lower()
    )

    # Filter by bounding box if provided from the frontend map
    if xmin is not None and ymin is not None and xmax is not None and ymax is not None:
        bbox_polygon = func.ST_SetSRID(func.ST_MakeEnvelope(xmin, ymin, xmax, ymax), 4326)
        stmt = stmt.where(func.ST_Intersects(model.geometry, bbox_polygon))

    try:
        result = await db.execute(stmt)
        
        features = []
        for i, row in enumerate(result.all()):
            obj, geojson_str = row
            
            # Ensure the GeoJSON is a dictionary, not a string
            if isinstance(geojson_str, str):
                geojson_data = json.loads(geojson_str)
            else:
                geojson_data = geojson_str
                
            # Storm surge uses the `surge_level` attribute from the DB
            current_severity = f"Level {obj.surge_level}" if base_type == 'Storm Surge' else severity

            features.append({
                "type": "Feature",
                "geometry": geojson_data,
                "properties": {
                    "id": i + 1,
                    "name": f'{base_type} Polygon {i + 1}',
                    "filter_type": base_type,
                    "severity": current_severity,
                    "description": description
                }
            })
            
        print(f"DEBUG: Found {len(features)} hazards for {hazard_type} in {city_tag}")
        return {
            "type": "FeatureCollection",
            "features": features
        }

    except Exception as e:
        print(f"Error fetching hazards: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")