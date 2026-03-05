"""Flight status endpoints (Module 1)."""

from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.schemas.flight import FlightStatusResponse, FlightSearchQuery

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("/{flight_number}/status", response_model=FlightStatusResponse)
async def get_flight_status(
    flight_number: str,
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format, defaults to today"),
):
    """Get current status for a specific flight.

    Uses the ScraperManager to query multiple sources with fallback.
    This is a placeholder — will be connected to ScraperManager in Phase 2.
    """
    # Phase 2: Replace with ScraperManager integration
    # For now, return demo data
    from app.services.demo_data import get_demo_flight_status
    return get_demo_flight_status(flight_number)


@router.post("/search", response_model=list[FlightStatusResponse])
async def search_flights_by_route(query: FlightSearchQuery):
    """Search for flights by route (from/to airports + optional airline).

    This is a placeholder — will be connected to ScraperManager in Phase 2.
    """
    from app.services.demo_data import get_demo_route_flights
    return get_demo_route_flights(query.departure_airport, query.arrival_airport)
