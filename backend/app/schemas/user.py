"""User request/response schemas."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: str = "tourist"  # "tourist" or "guide"
    preferred_language: str = "en"
    preferred_currency: str = "EUR"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    languages: Optional[str] = None
    is_verified_local: bool = False
    preferred_language: str = "en"
    preferred_currency: str = "EUR"
    guide_tagline: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    bio: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    languages: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = None
    preferred_currency: Optional[str] = None
    guide_tagline: Optional[str] = Field(None, max_length=200)


class GuideProfileResponse(BaseModel):
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    languages: Optional[str] = None
    is_verified_local: bool = False
    guide_tagline: Optional[str] = None
    tour_count: int = 0
    avg_rating: float = 0.0
    total_reviews: int = 0

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
