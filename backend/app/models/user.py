"""User model - supports both guides and tourists."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    TOURIST = "tourist"
    GUIDE = "guide"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Null for OAuth
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.TOURIST, nullable=False)
    avatar_url = Column(String(500))
    bio = Column(Text)
    city = Column(String(100))
    country = Column(String(100))
    languages = Column(String(500))  # JSON array of language codes
    is_verified_local = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    preferred_language = Column(String(10), default="en")
    preferred_currency = Column(String(3), default="EUR")
    google_id = Column(String(255), unique=True, nullable=True)

    # Guide-specific
    guide_tagline = Column(String(200))
    total_earnings = Column(Float, default=0.0)
    stripe_account_id = Column(String(255))

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    tours = relationship("Tour", back_populates="guide", lazy="selectin")
    reviews = relationship("Review", back_populates="tourist", foreign_keys="Review.tourist_id", lazy="selectin")
    purchases = relationship("Purchase", back_populates="tourist", lazy="selectin")
