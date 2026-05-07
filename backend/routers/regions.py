"""
routers/regions.py FastAPI router for Region Selection API.
"""

from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/v1/regions", tags=["Regions"])

REGIONS = [
    {"id": "north", "name": "North", "bounds": {"xmin": 123.85, "ymin": 10.35, "xmax": 124.05, "ymax": 10.45}},
    {"id": "south", "name": "South", "bounds": {"xmin": 123.80, "ymin": 10.20, "xmax": 123.95, "ymax": 10.30}},
    {"id": "central", "name": "Central", "bounds": {"xmin": 123.85, "ymin": 10.30, "xmax": 123.95, "ymax": 10.35}},
    {"id": "east", "name": "East", "bounds": {"xmin": 123.95, "ymin": 10.30, "xmax": 124.05, "ymax": 10.40}},
    {"id": "west", "name": "West", "bounds": {"xmin": 123.75, "ymin": 10.30, "xmax": 123.85, "ymax": 10.40}}
]

@router.get("/", response_model=List[Dict[str, Any]])
async def get_regions():
    return REGIONS
