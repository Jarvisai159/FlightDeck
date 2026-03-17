"""Review request/response schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    storytelling_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    route_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    audio_clarity_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    cultural_depth_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    best_moment: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    tour_id: int
    tourist_id: int
    tourist_name: str = ""
    tourist_avatar: Optional[str] = None
    rating: float
    storytelling_rating: Optional[float] = None
    route_rating: Optional[float] = None
    audio_clarity_rating: Optional[float] = None
    cultural_depth_rating: Optional[float] = None
    best_moment: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
