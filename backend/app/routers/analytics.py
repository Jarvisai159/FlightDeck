"""Historical analytics endpoints (Module 2)."""

from fastapi import APIRouter, Query

from app.schemas.flight import FlightHistoryResponse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/flight/{flight_number}/performance", response_model=FlightHistoryResponse)
async def get_flight_performance(
    flight_number: str,
    period: int = Query(default=30, description="Number of days to analyze (30, 90, 180)"),
):
    """Get on-time performance data for a specific flight.

    Placeholder — will be connected to analytics service in Phase 3.
    """
    from app.services.demo_data import get_demo_flight_performance
    return get_demo_flight_performance(flight_number, period)


@router.get("/route/{origin}/{destination}/performance", response_model=FlightHistoryResponse)
async def get_route_performance(
    origin: str,
    destination: str,
    period: int = Query(default=30),
):
    """Get on-time performance data for a route across all airlines.

    Placeholder — will be connected to analytics service in Phase 3.
    """
    from app.services.demo_data import get_demo_route_performance
    return get_demo_route_performance(origin, destination, period)
