from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class WeatherCurrent(BaseModel):
    temperature_celsius: float = Field(..., examples=[28.4])
    humidity_percentage: float = Field(..., examples=[62.0])
    apparent_temp_celsius: Optional[float] = Field(None, examples=[29.1])
    condition: str = Field(..., examples=["Partly Cloudy"])
    weather_code: Optional[int] = Field(None, examples=[2])
    wind_speed_kmh: Optional[float] = Field(None, examples=[12.5])
    wind_direction_deg: Optional[int] = Field(None, examples=[240])
    rainfall_mm: Optional[float] = Field(0.0, examples=[0.0])
    uv_index: Optional[float] = Field(None, examples=[6.5])


class WeatherForecastDay(BaseModel):
    date: str
    temperature_max: float
    temperature_min: float
    rain_probability_pct: float
    precipitation_sum_mm: float
    condition: str
    weather_code: int


class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current: WeatherCurrent
    source: str = "Open-Meteo Realtime Engine"


class WeatherForecastResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current: WeatherCurrent
    daily_forecast: List[WeatherForecastDay]
