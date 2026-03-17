"""Tour stop model - individual points of interest within a tour."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


class TourStop(Base):
    __tablename__ = "tour_stops"

    id = Column(Integer, primary_key=True, index=True)
    tour_id = Column(Integer, ForeignKey("tours.id"), nullable=False)

    order = Column(Integer, nullable=False)  # Stop sequence number
    title = Column(String(200), nullable=False)
    description = Column(Text)

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    trigger_radius_meters = Column(Integer, default=30)  # GPS geofence radius

    # Audio
    audio_url = Column(String(500))  # Original language audio
    audio_duration_seconds = Column(Integer)
    translated_audio_urls = Column(JSON, default=dict)  # {"es": "url", "fr": "url", ...}

    # Visual moments
    image_url = Column(String(500))
    image_caption = Column(String(300))

    # Navigation
    walking_instructions = Column(Text)  # "Turn left at the fountain..."
    walking_duration_seconds = Column(Integer)  # Time to walk from previous stop

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    tour = relationship("Tour", back_populates="stops")
