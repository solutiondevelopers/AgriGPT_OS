from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class SoilReadingCreate(BaseModel):
    moisture_percentage: Optional[float] = Field(None, ge=0.0, le=100.0, examples=[28.5])
    temperature_celsius: Optional[float] = Field(None, ge=-10.0, le=60.0, examples=[24.0])
    ph_level: Optional[float] = Field(None, ge=0.0, le=14.0, examples=[6.8])
    nitrogen_mg_kg: Optional[float] = Field(None, ge=0.0, examples=[135.0])
    phosphorus_mg_kg: Optional[float] = Field(None, ge=0.0, examples=[30.0])
    potassium_mg_kg: Optional[float] = Field(None, ge=0.0, examples=[175.0])
    electrical_conductivity_ds_m: Optional[float] = Field(None, ge=0.0, examples=[1.2])
    organic_matter_percentage: Optional[float] = Field(None, ge=0.0, le=100.0, examples=[2.5])
    sensor_id: Optional[str] = Field(None, examples=["SN-IOT-092"])
    source: Optional[str] = Field("sensor", examples=["sensor"])


class SoilReadingResponse(SoilReadingCreate):
    id: str
    field_id: str
    recorded_at: str

    model_config = ConfigDict(from_attributes=True)


class SoilHistoryResponse(BaseModel):
    field_id: str
    count: int
    readings: List[SoilReadingResponse]
