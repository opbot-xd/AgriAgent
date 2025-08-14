from pydantic import BaseModel, Field
from typing import List, Optional

class ChatMessage(BaseModel):
    content: str
    role: str  # 'user' or 'assistant'

class Location(BaseModel):
    lat: float = Field(..., description="Latitude of the location")
    lng: float = Field(..., description="Longitude of the location")

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's message/query")
    crop_name: str = Field(..., description="Name of the crop")
    location: Location = Field(..., description="User's location coordinates")
    language: str = Field('en', description="Preferred response language")
