from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class FarmBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, examples=["Sahyadri Bio-Farms"])
    location: str = Field(..., min_length=2, max_length=255, examples=["Nashik, Maharashtra"])
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, examples=[19.9975])
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, examples=[73.7898])
    total_area_acres: float = Field(..., gt=0.0, examples=[12.5])
    elevation_meters: Optional[float] = Field(None, examples=[560.0])
    climate_zone: Optional[str] = Field(None, examples=["Semi-Arid Tropical"])


class FarmCreate(FarmBase):
    user_id: Optional[str] = Field(None, examples=["usr-demo-01"])


class FarmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    total_area_acres: Optional[float] = Field(None, gt=0.0)
    elevation_meters: Optional[float] = None
    climate_zone: Optional[str] = None


class FarmResponse(FarmBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
