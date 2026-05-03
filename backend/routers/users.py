"""
routers/users.py — FastAPI router for user operations.

Implemented by: API_SPECIALIST / SECURITY_SPECIALIST
Version: 2.0 | May 2026 (Prompt C — User.id integer, /me response shape fixed)
"""

from fastapi import APIRouter, Depends
from models.user import User
from core.security import get_current_user

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)


from schemas.user import UserResponse

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the profile of the currently authenticated user.

    Returns:
        JSON with id (integer), name, email, created_at, last_login.
        password_hash is NEVER returned.
    """
    return current_user
