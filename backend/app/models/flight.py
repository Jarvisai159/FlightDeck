"""Flight status and history models."""

from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Flight(Base):
    """Current/recent flight status. Updated in real-time by scrapers."""

    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    flight_number: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    airline_iata: Mapped[str | None] = mapped_column(String(3), index=True)
    departure_airport: Mapped[str] = mapped_column(String(4), nullable=False, index=True)
    arrival_airport: Mapped[str] = mapped_column(String(4), nullable=False, index=True)
    scheduled_departure: Mapped[datetime | None] = mapped_column(DateTime)
    scheduled_arrival: Mapped[datetime | None] = mapped_column(DateTime)
    actual_departure: Mapped[datetime | None] = mapped_column(DateTime)
    actual_arrival: Mapped[datetime | None] = mapped_column(DateTime)
    status: Mapped[str | None] = mapped_column(String(20))  # on_time, delayed, cancelled, landed, in_air, boarding
    delay_minutes: Mapped[int | None] = mapped_column(Integer)
    delay_reason: Mapped[str | None] = mapped_column(String(500))
    gate: Mapped[str | None] = mapped_column(String(10))
    terminal: Mapped[str | None] = mapped_column(String(10))
    aircraft_type: Mapped[str | None] = mapped_column(String(50))
    aircraft_registration: Mapped[str | None] = mapped_column(String(20))
    # Live position data (from OpenSky / ADS-B)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    altitude: Mapped[float | None] = mapped_column(Float)
    heading: Mapped[float | None] = mapped_column(Float)
    speed: Mapped[float | None] = mapped_column(Float)
    # Data provenance
    source: Mapped[str | None] = mapped_column(String(50))  # which scraper provided this
    scraped_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<Flight {self.flight_number} {self.status}>"


class FlightHistory(Base):
    """Historical flight performance records. Accumulated over time for Module 2."""

    __tablename__ = "flight_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    flight_number: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    airline_iata: Mapped[str | None] = mapped_column(String(3), index=True)
    departure_airport: Mapped[str] = mapped_column(String(4), nullable=False, index=True)
    arrival_airport: Mapped[str] = mapped_column(String(4), nullable=False, index=True)
    flight_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    status: Mapped[str | None] = mapped_column(String(20))
    delay_minutes: Mapped[int | None] = mapped_column(Integer)
    cancellation_reason: Mapped[str | None] = mapped_column(String(500))
    source: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<FlightHistory {self.flight_number} {self.flight_date}>"
