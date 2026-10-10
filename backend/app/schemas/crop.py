from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CropBase(BaseModel):
    crop_name: str = Field(..., min_length=2, max_length=100, examples=["Tomato"])
    variety: Optional[str] = Field(None, examples=["Abhinav F1 Hybrid"])
    sowing_date: str = Field(..., examples=["2026-08-15"])
    expected_harvest_date: Optional[str] = Field(None, examples=["2026-11-20"])
    growth_stage: str = Field("Vegetative", examples=["Flowering"])
    target_yield_tons: Optional[float] = Field(None, gt=0.0, examples=[24.0])
    actual_yield_tons: Optional[float] = Field(None, ge=0.0)
    status: Optional[str] = Field("Active", examples=["Active"])


class CropCreate(CropBase):
    pass


class CropUpdate(BaseModel):
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    sowing_date: Optional[str] = None
    expected_harvest_date: Optional[str] = None
    growth_stage: Optional[str] = None
    target_yield_tons: Optional[float] = None
    actual_yield_tons: Optional[float] = None
    status: Optional[str] = None


class CropResponse(CropBase):
    id: str
    field_id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
