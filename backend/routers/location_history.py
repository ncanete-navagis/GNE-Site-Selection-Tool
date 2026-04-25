"""
routers/location_history.py — FastAPI router for user location history.

Implemented by: API_SPECIALIST / SECURITY_SPECIALIST
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
from models.user import User
from core.security import get_current_user

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Location History"]
)

class LocationHistoryCreate(BaseModel):
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)
    name: str = Field(None)

class LocationHistoryResponse(BaseModel):
    id: str
    longitude: float
    latitude: float
    name: str

@router.get("/{user_id}/history", response_model=List[LocationHistoryResponse])
def get_location_history(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve location history for a user.
    """
    if current_user.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this user's history")
    
    # Placeholder
    return []

@router.post("/{user_id}/history", response_model=LocationHistoryResponse)
def add_location_history(
    user_id: str,
    payload: LocationHistoryCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Add a new location history entry.
    """
    if current_user.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this user's history")
    
    # Placeholder
    return {
        "id": "dummy-uuid",
        "longitude": payload.longitude,
        "latitude": payload.latitude,
        "name": payload.name or "Unnamed Location"
    }

@router.delete("/{user_id}/history", status_code=status.HTTP_204_NO_CONTENT)
def clear_location_history(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Clear all location history for a user.
    """
    if current_user.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this user's history")
    
    # Placeholder for DB delete
    return None
