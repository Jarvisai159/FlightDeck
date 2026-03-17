"""Review model."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    tour_id = Column(Integer, ForeignKey("tours.id"), nullable=False)
    tourist_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    rating = Column(Float, nullable=False)  # 1-5 stars
    storytelling_rating = Column(Float)  # Sub-ratings
    route_rating = Column(Float)
    audio_clarity_rating = Column(Float)
    cultural_depth_rating = Column(Float)

    best_moment = Column(Text)  # "What was the best moment?"
    comment = Column(Text)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    tour = relationship("Tour", back_populates="reviews")
    tourist = relationship("User", back_populates="reviews", foreign_keys=[tourist_id])
