"""Request/response schemas for flight data."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class FlightStatusResponse(BaseModel):
    flight_number: str
    airline_iata: Optional[str] = None
    airline_name: Optional[str] = None
    departure_airport: str
    departure_airport_name: Optional[str] = None
    arrival_airport: str
    arrival_airport_name: Optional[str] = None
    scheduled_departure: Optional[datetime] = None
    scheduled_arrival: Optional[datetime] = None
    actual_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    status: Optional[str] = None
    delay_minutes: Optional[int] = None
    delay_reason: Optional[str] = None
    gate: Optional[str] = None
    terminal: Optional[str] = None
    aircraft_type: Optional[str] = None
    aircraft_registration: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None
    source: Optional[str] = None
    scraped_at: Optional[datetime] = None
    # Weather at airports
    departure_weather: Optional[dict] = None
    arrival_weather: Optional[dict] = None

    model_config = {"from_attributes": True}


class FlightPositionResponse(BaseModel):
    """Lightweight position update for WebSocket streaming."""
    flight_number: str
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None
    timestamp: datetime


class FlightSearchQuery(BaseModel):
    """Search by route instead of flight number."""
    departure_airport: str
    arrival_airport: str
    airline: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD, defaults to today


class FlightHistoryResponse(BaseModel):
    """Analytics data for a specific flight or route."""
    flight_number: Optional[str] = None
    route: Optional[str] = None
    period_days: int
    total_flights: int
    on_time_percentage: float
    average_delay_minutes: float
    cancellation_rate: float
    delay_distribution: dict  # {"under_15": 45, "15_to_30": 20, "30_to_60": 10, "over_60": 5}
    daily_performance: list[dict]  # [{"date": "2026-03-01", "status": "on_time", "delay": 0}]
    best_days: list[str]
    worst_days: list[str]
