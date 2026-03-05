"""Request/response schemas for authentication."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: Optional[str] = None
    auth_provider: str
    email_verified: bool
    preferred_currency: str
    preferred_airports: Optional[list[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferred_currency: Optional[str] = None
    preferred_airports: Optional[list[str]] = None
    notification_preferences: Optional[dict] = None
