"""
models/__init__.py — Public re-exports for the models package.

Import order matters: Base first, then independent entities (no FKs),
then entities with FKs, so that SQLAlchemy's mapper registry is populated
before relationship() resolution.

Change log (Integration — Prompt B):
  - Removed: Business (→ superseded by CebuBuilding, ManilaBuilding)
  - Removed: Hazard   (→ superseded by FloodHazard, LandslideHazard, StormSurgeHazard)
  - Removed: TrafficData (table does not exist in Earl's schema)
  - Added: CebuBuilding, ManilaBuilding (from models.building)
  - Added: FloodHazard, LandslideHazard, StormSurgeHazard (from models.hazard)
"""

from .base import Base  # noqa: F401

# Independent entities (no FK dependencies)
from .user import User  # noqa: F401
from .building import CebuBuilding, ManilaBuilding  # noqa: F401
from .hazard import FloodHazard, LandslideHazard, StormSurgeHazard  # noqa: F401
from .barangay import Barangay  # noqa: F401
from .analysis import Analysis  # noqa: F401

# Dependent entities (hold FKs to the above)
from .location_history import LocationHistory  # noqa: F401
from .location_recommendation import LocationRecommendation  # noqa: F401

__all__ = [
    "Base",
    "User",
    "CebuBuilding",
    "ManilaBuilding",
    "FloodHazard",
    "LandslideHazard",
    "StormSurgeHazard",
    "Barangay",
    "Analysis",
    "LocationHistory",
    "LocationRecommendation",
]
