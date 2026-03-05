"""Search result cache model."""

from datetime import datetime
from sqlalchemy import String, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SearchCache(Base):
    """Cached search results to avoid re-scraping within TTL."""

    __tablename__ = "search_cache"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    search_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    origin: Mapped[str] = mapped_column(String(4), nullable=False)
    destination: Mapped[str] = mapped_column(String(4), nullable=False)
    departure_date: Mapped[str] = mapped_column(String(10), nullable=False)
    return_date: Mapped[str | None] = mapped_column(String(10))
    passengers: Mapped[int] = mapped_column(default=1)
    cabin_class: Mapped[str] = mapped_column(String(20), default="economy")
    results_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    results_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
