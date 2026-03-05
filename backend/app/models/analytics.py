"""Analytics event and ad tracking models."""

from datetime import datetime
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AnalyticsEvent(Base):
    """Tracks every meaningful user interaction."""

    __tablename__ = "analytics_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON)

    # Event types:
    # "search" -> {module, origin, destination, date, filters, results_count}
    # "result_click" -> {airline, flight_number, price, position_in_results, source}
    # "booking_link_click" -> {airline, url_domain, flight_number, price, source_platform}
    # "flight_status_check" -> {flight_number, airline, status_result}
    # "history_view" -> {flight_number, airline, route}
    # "comparison_view" -> {itineraries_compared: [...ids]}
    # "ad_impression" -> {slot_id, ad_type, page_context}
    # "ad_click" -> {slot_id, ad_type, destination_url, page_context}
    # "signup" -> {method: google/email}
    # "login" -> {method: google/email}


class AdTracking(Base):
    """Ad impression and click tracking for revenue analytics."""

    __tablename__ = "ad_tracking"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slot_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    ad_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "adsense" or "direct"
    event_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "impression" or "click"
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    session_id: Mapped[str | None] = mapped_column(String(36))
    page_context: Mapped[str | None] = mapped_column(String(50))  # which module/page
    device_type: Mapped[str | None] = mapped_column(String(20))
    country: Mapped[str | None] = mapped_column(String(2))
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
