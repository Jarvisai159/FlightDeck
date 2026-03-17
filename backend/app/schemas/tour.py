"""Tour request/response schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- Tour Stop Schemas ---

class TourStopCreate(BaseModel):
    order: int
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    latitude: float
    longitude: float
    trigger_radius_meters: int = 30
    audio_url: Optional[str] = None
    audio_duration_seconds: Optional[int] = None
    translated_audio_urls: Optional[dict] = None
    image_url: Optional[str] = None
    image_caption: Optional[str] = Field(None, max_length=300)
    walking_instructions: Optional[str] = None
    walking_duration_seconds: Optional[int] = None


class TourStopResponse(BaseModel):
    id: int
    tour_id: int
    order: int
    title: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    trigger_radius_meters: int = 30
    audio_url: Optional[str] = None
    audio_duration_seconds: Optional[int] = None
    translated_audio_urls: Optional[dict] = None
    image_url: Optional[str] = None
    image_caption: Optional[str] = None
    walking_instructions: Optional[str] = None
    walking_duration_seconds: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Tour Schemas ---

class TourCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    city: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)
    theme: str  # TourTheme value
    difficulty: str = "easy"  # TourDifficulty value
    price: float = 6.99
    currency: str = "EUR"
    duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    original_language: str = "en"
    cover_image_url: Optional[str] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None


class TourUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    theme: Optional[str] = None
    difficulty: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    cover_image_url: Optional[str] = None
    original_language: Optional[str] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    route_geojson: Optional[dict] = None


class GuideInfo(BaseModel):
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    is_verified_local: bool = False
    guide_tagline: Optional[str] = None

    model_config = {"from_attributes": True}


class TourResponse(BaseModel):
    id: int
    guide_id: int
    title: str
    description: Optional[str] = None
    city: str
    country: str
    theme: str
    difficulty: str
    status: str
    price: float
    currency: str
    duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    stop_count: int = 0
    original_language: str = "en"
    available_languages: list[str] = []
    preview_audio_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    route_geojson: Optional[dict] = None
    quality_score: Optional[float] = None
    avg_rating: float = 0.0
    review_count: int = 0
    total_purchases: int = 0
    total_completions: int = 0
    completion_rate: float = 0.0
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    guide: Optional[GuideInfo] = None
    stops: list[TourStopResponse] = []

    model_config = {"from_attributes": True}


class TourListResponse(BaseModel):
    tours: list[TourResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
