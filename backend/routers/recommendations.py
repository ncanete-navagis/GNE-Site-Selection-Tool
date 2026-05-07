"""
routers/recommendations.py — FastAPI router for location recommendations.

Implemented by: API_SPECIALIST
Version: 2.1 | May 2026 (optional auth — unauthenticated use allowed)

Auth strategy:
  - /recommendations/generate   → optional auth via get_optional_user.
      Authenticated: runs analysis AND persists to DB under the user account.
      Unauthenticated: runs analysis, returns result WITHOUT persisting.
  - /users/{user_id}/recommendations → required auth (user data).
  - /recommendations/{id}           → required auth.
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
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Generate a new location recommendation by running analysis.

    - Authenticated users: result is persisted and linked to their account.
    - Unauthenticated users: analysis runs and result is returned without saving.
    """
    user_id = current_user.id if current_user else None
    res = await rec_service.create_recommendation(
        session=db,
        lon=request.longitude,
        lat=request.latitude,
        user_id=user_id,
        name=request.name,
        description=request.description
    )
    return res


@router.get("/users/{user_id}/recommendations", response_model=List[RecommendationResponse])
async def get_user_recommendations(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all location recommendations for a given user (auth required)."""
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
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single location recommendation by its ID (auth required)."""
    res = await rec_service.get_recommendation(session=db, rlocation_id=rlocation_id)
    return res
