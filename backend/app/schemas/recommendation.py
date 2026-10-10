from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class RecommendationResponse(BaseModel):
    id: str
    field_id: str
    category: str = Field(..., examples=["IRRIGATION"])  # IRRIGATION, FERTILIZATION, PEST_CONTROL, HARVEST
    priority: str = Field(..., examples=["HIGH"])        # LOW, MEDIUM, HIGH, URGENT
    title: str = Field(..., examples=["Irrigation recommended"])
    reason: str = Field(..., examples=["Soil moisture is low (18%) and rainfall probability is under 15%."])
    action_steps: List[str] = Field(default_factory=list)
    confidence: float = Field(..., examples=[0.85])
    status: str = Field("PENDING", examples=["PENDING"])
    generated_at: str

    model_config = ConfigDict(from_attributes=True)


class RecommendationGenerateRequest(BaseModel):
    crop: Optional[str] = None
    growth_stage: Optional[str] = None
    soil_moisture: Optional[float] = None
    temperature: Optional[float] = None
    rain_probability: Optional[float] = None


class EarlyWarningResponse(BaseModel):
    warning_type: str
    severity: str
    message: str
    detected_trend: str
    data_points: List[float]
