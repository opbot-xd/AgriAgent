from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class PriceData(BaseModel):
    date: str
    min_price: float
    modal_price: float
    max_price: float
    is_forecast: bool = False
    confidence_upper: Optional[float] = None
    confidence_lower: Optional[float] = None

class LocationInfo(BaseModel):
    states: List[str]
    districts: Dict[str, List[str]]
    crops: Dict[str, Dict[str, List[str]]]

class ForecastRequest(BaseModel):
    state: str
    district: str
    crop: str
    price_type: str = "Modal_price"
    forecast_days: int = 30

class ForecastResponse(BaseModel):
    historical_data: List[PriceData]
    forecast_data: List[PriceData]
    metrics: Dict[str, Any]
    summary: Dict[str, Any]
