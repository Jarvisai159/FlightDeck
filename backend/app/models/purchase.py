"""Purchase model - tracks tour purchases."""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.database import Base


class PurchaseStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    REFUNDED = "refunded"
    CREDITED = "credited"


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    tour_id = Column(Integer, ForeignKey("tours.id"), nullable=False)
    tourist_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="EUR")
    status = Column(SAEnum(PurchaseStatus), default=PurchaseStatus.PENDING)
    stripe_payment_intent_id = Column(String(255))

    # Tour progress
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    last_stop_reached = Column(Integer, default=0)
    language_used = Column(String(10), default="en")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    tour = relationship("Tour", back_populates="purchases")
    tourist = relationship("User", back_populates="purchases")
