"""
routers/recommendations.py — FastAPI router for location recommendations.

Implemented by: API_SPECIALIST
Version: 2.1 | May 2026 (criteria support + optional auth)
"""

import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from dependencies import get_db
from models.user import User
from core.security import get_current_user, get_optional_user
from services import recommendation as rec_service

router = APIRouter(
    prefix="/api/v1",
    tags=["Recommendations"]
)


class RecommendationCreateRequest(BaseModel):
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in EPSG:4326")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in EPSG:4326")
    name: Optional[str] = Field(None, description="Optional name for the location")
    description: Optional[str] = Field(None, description="Optional description for the location")
    
    # Analysis Criteria
    radius_m: Optional[float] = Field(None, ge=100, le=10000, description="Search radius in metres")
    population: Optional[int] = Field(None, description="Target population in the area")
    traffic_kmh: Optional[float] = Field(None, description="Target average traffic speed in km/h")
    lot_area: Optional[float] = Field(None, description="Target lot area in sq. m")
    business_sectors: Optional[List[str]] = Field(None, description="List of business sectors to analyze")


class RecommendationResponse(BaseModel):
    rlocation_id: uuid.UUID
    name: Optional[str]
    analysis: dict
    barangay_name: Optional[str]
    created_at: Optional[datetime]


@router.post("/recommendations/generate", response_model=RecommendationResponse)
async def generate_recommendation(
    request: RecommendationCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Generate a new location recommendation by running analysis.
    
    If authenticated, the result is persisted. If unauthenticated, it returns analysis only.
    """
    user_id = current_user.id if current_user else None
    res = await rec_service.create_recommendation(
        session=db,
        lon=request.longitude,
        lat=request.latitude,
        user_id=user_id,
        name=request.name,
        description=request.description,
        radius_m=request.radius_m,
        population=request.population,
        traffic_kmh=request.traffic_kmh,
        lot_area=request.lot_area,
        business_sectors=request.business_sectors
    )
    return res


@router.get("/users/{user_id}/recommendations", response_model=List[RecommendationResponse])
async def get_user_recommendations(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all location recommendations for a given user."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's recommendations"
        )
    res = await rec_service.get_user_recommendations(session=db, user_id=user_id)
    return res


@router.get("/recommendations/{rlocation_id}", response_model=RecommendationResponse)
async def get_recommendation(
    rlocation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a single location recommendation by its ID."""
    res = await rec_service.get_recommendation(session=db, rlocation_id=rlocation_id)
    return res
