from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
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
    query = select(CebuProperty).where(
        CebuProperty.purpose == 'buy',
        CebuProperty.lat >= min_lat,
        CebuProperty.lat <= max_lat,
        CebuProperty.long >= min_lng,
        CebuProperty.long <= max_lng
    ).limit(limit)

    result = await db.execute(query)
    properties = result.scalars().all()
    
    return properties
