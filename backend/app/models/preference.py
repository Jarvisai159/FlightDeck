"""User preference and price alert models."""

from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserPreference(Base):
    """Auto-detected and explicit user preferences for personalization."""

    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    preference_key: Mapped[str] = mapped_column(String(50), nullable=False)
    preference_value: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.5)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Preference keys:
    # "home_airports" -> '["DXB", "SHJ"]'
    # "preferred_airlines" -> '["EK", "W6", "FR"]'
    # "price_sensitivity" -> "high" | "medium" | "low"
    # "layover_tolerance" -> "2-4 hours"
    # "preferred_cabin" -> "economy"
    # "preferred_travel_days" -> '["friday", "saturday"]'


class PriceAlert(Base):
    """User-configured alerts for price drops on specific routes."""

    __tablename__ = "price_alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    origin: Mapped[str] = mapped_column(String(4), nullable=False)
    destination: Mapped[str] = mapped_column(String(4), nullable=False)
    target_price: Mapped[float | None] = mapped_column(Float)
    current_lowest: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="EUR")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_checked: Mapped[datetime | None] = mapped_column(DateTime)
    last_notified: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
