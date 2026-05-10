from typing import Optional
from pydantic import BaseModel

class PropertyResponse(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    purpose: Optional[str] = None
    category: Optional[str] = None
    area: Optional[float] = None
    location: Optional[str] = None
    coverphotourl: Optional[str] = None
    url: str
    lat: Optional[float] = None
    long: Optional[float] = None

    class Config:
        from_attributes = True
