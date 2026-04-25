"""
dependencies.py — Shared FastAPI dependencies.

This module provides the database session generator.
"""

from typing import Generator
from sqlalchemy.orm import Session

# Placeholder for database setup
# from database import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """
    Dependency that yields a database session and ensures it is closed.
    """
    # Placeholder: yield SessionLocal()
    # For now, we yield a mock or raise NotImplementedError if not initialized
    # try:
    #     db = SessionLocal()
    #     yield db
    # finally:
    #     db.close()
    
    # Until database is fully configured in the backend, raise error if called directly
    raise NotImplementedError("Database connection not yet configured in dependencies.py")
