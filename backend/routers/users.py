"""
routers/users.py — FastAPI router for user operations.

Implemented by: API_SPECIALIST / SECURITY_SPECIALIST
"""

from fastapi import APIRouter, Depends
from models.user import User
from core.security import get_current_user

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve the profile of the currently authenticated user.
    """
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }
