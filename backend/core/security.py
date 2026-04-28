"""
core/security.py — Google OAuth 2.0 Security Layer.

Implemented by: SECURITY_SPECIALIST
"""

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from dependencies import get_db
from models.user import User

# Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")

security_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that extracts the Bearer token, verifies it with Google,
    and upserts the user in the database.
    """
    token = credentials.credentials
    try:
        # Verify the token with Google
        payload = id_token.verify_oauth2_token(
            token, grequests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    # Extract claims
    user_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("name")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing subject or email in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Upsert User logic
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        # User exists, update last_login
        user.last_login = func.now()
        db.commit()
        db.refresh(user)
    else:
        # User does not exist, insert
        user = User(
            user_id=user_id,
            email=email,
            full_name=name,
            last_login=func.now()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
