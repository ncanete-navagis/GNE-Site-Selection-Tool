from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.property import CebuProperty
from schemas.property import PropertyResponse
from dependencies import get_db

router = APIRouter(
    prefix="/api/v1/properties",
    tags=["Properties"]
)

@router.get("/buying", response_model=List[PropertyResponse])
async def get_buying_properties(
    min_lat: float = Query(..., description="Minimum latitude"),
    max_lat: float = Query(..., description="Maximum latitude"),
    min_lng: float = Query(..., description="Minimum longitude"),
    max_lng: float = Query(..., description="Maximum longitude"),
    limit: int = Query(200, description="Maximum number of properties to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch properties listed for buying within a specific bounding box.
    """
    # Use ST_AsGeoJSON to get the polygon in a format React can easily use
    # We select the property and the GeoJSON string separately
    stmt = select(
        CebuProperty,
        func.ST_AsGeoJSON(CebuProperty.random_shape_polygon).label("polygon_geojson")
    ).where(
        CebuProperty.purpose == 'buy',
        CebuProperty.lat >= min_lat,
        CebuProperty.lat <= max_lat,
        CebuProperty.long >= min_lng,
        CebuProperty.long <= max_lng
    ).limit(limit)

    result = await db.execute(stmt)
    rows = result.all()
    
    properties = []
    for row in rows:
        prop = row.CebuProperty
        # Convert ORM object to dict so we can safely overwrite the field for the response
        prop_data = {
            "title": prop.title,
            "price": prop.price,
            "purpose": prop.purpose,
            "category": prop.category,
            "area": prop.area,
            "location": prop.location,
            "coverphotourl": prop.coverphotourl,
            "url": prop.url,
            "lat": prop.lat,
            "long": prop.long,
            "random_shape_polygon": row.polygon_geojson
        }
        properties.append(prop_data)
    
    print(f"DEBUG: Found {len(properties)} buying properties")
    return properties
