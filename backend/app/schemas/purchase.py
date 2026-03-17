"""Purchase request/response schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PurchaseCreate(BaseModel):
    language: str = "en"


class PurchaseResponse(BaseModel):
    id: int
    tour_id: int
    tourist_id: int
    amount: float
    currency: str = "EUR"
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_stop_reached: int = 0
    language_used: str = "en"
    created_at: datetime

    # Nested tour info for "my purchases" listing
    tour_title: Optional[str] = None
    tour_city: Optional[str] = None
    tour_cover_image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class PlaybackUpdate(BaseModel):
    last_stop_reached: int
    completed: bool = False
