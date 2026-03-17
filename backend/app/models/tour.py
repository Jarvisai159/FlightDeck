"""Tour model - the core content unit."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.database import Base


class TourStatus(str, enum.Enum):
    DRAFT = "draft"
    PROCESSING = "processing"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class TourDifficulty(str, enum.Enum):
    EASY = "easy"
    MODERATE = "moderate"
    CHALLENGING = "challenging"


class TourTheme(str, enum.Enum):
    HISTORY = "history"
    FOOD = "food"
    ARCHITECTURE = "architecture"
    HIDDEN_GEMS = "hidden_gems"
    NIGHTLIFE = "nightlife"
    STREET_ART = "street_art"
    CULTURE = "culture"
    NATURE = "nature"
    PHOTOGRAPHY = "photography"


class Tour(Base):
    __tablename__ = "tours"

    id = Column(Integer, primary_key=True, index=True)
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(200), nullable=False)
    description = Column(Text)
    city = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False)
    theme = Column(SAEnum(TourTheme), nullable=False)
    difficulty = Column(SAEnum(TourDifficulty), default=TourDifficulty.EASY)
    status = Column(SAEnum(TourStatus), default=TourStatus.DRAFT)

    # Pricing
    price = Column(Float, nullable=False, default=6.99)
    currency = Column(String(3), default="EUR")

    # Tour metadata
    duration_minutes = Column(Integer)  # Estimated duration
    distance_km = Column(Float)  # Total walking distance
    stop_count = Column(Integer, default=0)

    # Audio
    original_language = Column(String(10), default="en")
    available_languages = Column(JSON, default=list)  # ["en", "es", "fr", ...]
    preview_audio_url = Column(String(500))  # 2-min preview clip

    # Media
    cover_image_url = Column(String(500))

    # GPS
    start_lat = Column(Float)
    start_lng = Column(Float)
    route_geojson = Column(JSON)  # Full route as GeoJSON

    # Quality & Stats
    quality_score = Column(Float)  # 0-100 internal score
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    total_purchases = Column(Integer, default=0)
    total_completions = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    published_at = Column(DateTime, nullable=True)

    # Relationships
    guide = relationship("User", back_populates="tours", lazy="selectin")
    stops = relationship("TourStop", back_populates="tour", order_by="TourStop.order", lazy="selectin")
    reviews = relationship("Review", back_populates="tour", lazy="selectin")
    purchases = relationship("Purchase", back_populates="tour", lazy="selectin")
