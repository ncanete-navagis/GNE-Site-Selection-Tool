"""
models/__init__.py — Public re-exports for the models package.

Import order matters: Base first, then independent entities (no FKs),
then entities with FKs, so that SQLAlchemy's mapper registry is populated
before relationship() resolution.
"""

from .base import Base  # noqa: F401

# Independent entities (no FK dependencies)
from .user import User  # noqa: F401
from .business import Business  # noqa: F401
from .hazard import Hazard  # noqa: F401
from .traffic import TrafficData  # noqa: F401
from .barangay import Barangay  # noqa: F401
from .analysis import Analysis  # noqa: F401

# Dependent entities (hold FKs to the above)
from .location_history import LocationHistory  # noqa: F401
from .location_recommendation import LocationRecommendation  # noqa: F401

__all__ = [
    "Base",
    "User",
    "Business",
    "Hazard",
    "TrafficData",
    "Barangay",
    "Analysis",
    "LocationHistory",
    "LocationRecommendation",
]
