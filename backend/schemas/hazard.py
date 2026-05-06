from pydantic import BaseModel
from typing import List, Optional

class HazardFeature(BaseModel):
    hazard_type: str
    geometry: dict
    city_tag: Optional[str] = None
    Var: Optional[float] = None
    GRID: Optional[float] = None
    LH: Optional[float] = None
    HAZ: Optional[float] = None
    surge_level: Optional[int] = None

    class Config:
        from_attributes = True

class HazardLayerResponse(BaseModel):
    hazard_type: str
    features: List[HazardFeature]
    count: int
