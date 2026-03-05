"""Request/response schemas for Module 3: Smart Search."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class RouteSearchRequest(BaseModel):
    origin: str  # IATA code
    destination: str  # IATA code
    departure_date: date
    return_date: Optional[date] = None
    passengers: int = Field(default=1, ge=1, le=9)
    cabin_class: str = "economy"  # economy, premium_economy, business, first
    max_stops: int = Field(default=2, ge=0, le=2)  # 0=direct only, max 2
    max_airlines: int = Field(default=2, ge=1, le=2)  # max airline changes
    max_layover_hours: float = Field(default=12.0, ge=1.0, le=24.0)
    include_nearby_airports: bool = True
    sort_by: str = "best_value"  # best_value, cheapest, fastest, fewest_stops, most_reliable
    currency: str = "EUR"


class FlightSegment(BaseModel):
    airline_iata: str
    airline_name: Optional[str] = None
    flight_number: Optional[str] = None
    departure_airport: str
    departure_airport_name: Optional[str] = None
    arrival_airport: str
    arrival_airport_name: Optional[str] = None
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int
    cabin_class: str
    # Reliability data from Module 2
    on_time_percentage: Optional[float] = None
    reliability_color: Optional[str] = None  # green, amber, red


class ItineraryResponse(BaseModel):
    id: str  # Unique identifier for this itinerary
    segments: list[FlightSegment]
    total_price: float
    currency: str
    total_duration_minutes: int
    total_stops: int
    airlines_involved: list[str]
    layover_durations: list[int]  # minutes between each segment
    # Scoring
    best_value_score: float = 0.0
    reliability_score: float = 0.0
    # Booking
    booking_links: list[dict]  # [{"airline": "FR", "url": "...", "segment_index": 0}]
    source: str  # "kiwi_tequila", "direct", "combined"
    deep_link: Optional[str] = None  # Single booking link if available
    # Flags
    uses_nearby_airports: bool = False
    nearby_airport_note: Optional[str] = None  # e.g. "Departs from Sharjah (SHJ) instead of Dubai (DXB)"
    risk_warnings: list[str] = []  # e.g. ["Tight connection: only 95min in IST"]


class RouteSearchResponse(BaseModel):
    origin: str
    origin_name: Optional[str] = None
    destination: str
    destination_name: Optional[str] = None
    departure_date: date
    searched_airports: list[str]  # All airports searched (including alternatives)
    itineraries: list[ItineraryResponse]
    total_results: int
    search_time_ms: int
    sources_used: list[str]
    sources_unavailable: list[str] = []
