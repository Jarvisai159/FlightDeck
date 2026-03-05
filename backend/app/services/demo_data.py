"""Demo/fixture data so the UI works without any live API calls.

Every endpoint returns realistic-looking data during development.
Replace these with real scraper integrations in later phases.
"""

from datetime import datetime, date, timedelta, timezone
from app.schemas.flight import FlightStatusResponse, FlightHistoryResponse
from app.schemas.search import (
    RouteSearchRequest,
    RouteSearchResponse,
    ItineraryResponse,
    FlightSegment,
)


def get_demo_flight_status(flight_number: str) -> FlightStatusResponse:
    """Return realistic demo data for any flight number."""
    now = datetime.now(timezone.utc)
    return FlightStatusResponse(
        flight_number=flight_number.upper(),
        airline_iata=flight_number[:2].upper(),
        airline_name=_airline_name(flight_number[:2].upper()),
        departure_airport="DXB",
        departure_airport_name="Dubai International Airport",
        arrival_airport="LIS",
        arrival_airport_name="Lisbon Portela Airport",
        scheduled_departure=now - timedelta(hours=2),
        scheduled_arrival=now + timedelta(hours=5),
        actual_departure=now - timedelta(hours=1, minutes=45),
        actual_arrival=None,
        status="in_air",
        delay_minutes=15,
        delay_reason="Late arrival of aircraft",
        gate="B22",
        terminal="3",
        aircraft_type="Boeing 777-300ER",
        aircraft_registration="A6-EGO",
        latitude=36.5,
        longitude=10.2,
        altitude=37000,
        heading=305,
        speed=480,
        source="demo",
        scraped_at=now,
        departure_weather={
            "temperature_c": 32,
            "condition": "Clear",
            "wind_speed_kmh": 15,
            "humidity": 45,
        },
        arrival_weather={
            "temperature_c": 18,
            "condition": "Partly Cloudy",
            "wind_speed_kmh": 22,
            "humidity": 65,
        },
    )


def get_demo_route_flights(origin: str, destination: str) -> list[FlightStatusResponse]:
    """Return demo flights for a route."""
    now = datetime.now(timezone.utc)
    flights = []
    demo_airlines = [("EK", "Emirates", "203"), ("TP", "TAP Portugal", "658"), ("TK", "Turkish Airlines", "762")]

    for airline_code, airline_name, num in demo_airlines:
        flights.append(
            FlightStatusResponse(
                flight_number=f"{airline_code}{num}",
                airline_iata=airline_code,
                airline_name=airline_name,
                departure_airport=origin.upper(),
                departure_airport_name=f"{origin.upper()} Airport",
                arrival_airport=destination.upper(),
                arrival_airport_name=f"{destination.upper()} Airport",
                scheduled_departure=now + timedelta(hours=len(flights) * 3),
                scheduled_arrival=now + timedelta(hours=len(flights) * 3 + 7),
                status="scheduled",
                source="demo",
                scraped_at=now,
            )
        )
    return flights


def get_demo_flight_performance(flight_number: str, period: int) -> FlightHistoryResponse:
    """Return demo performance analytics."""
    today = date.today()
    daily = []
    for i in range(min(period, 30)):
        d = today - timedelta(days=i)
        statuses = ["on_time", "on_time", "on_time", "minor_delay", "major_delay"]
        status = statuses[i % len(statuses)]
        delay = 0 if status == "on_time" else (12 if status == "minor_delay" else 45)
        daily.append({"date": d.isoformat(), "status": status, "delay": delay})

    return FlightHistoryResponse(
        flight_number=flight_number.upper(),
        period_days=period,
        total_flights=period,
        on_time_percentage=72.5,
        average_delay_minutes=14.3,
        cancellation_rate=2.1,
        delay_distribution={"under_15": 55, "15_to_30": 25, "30_to_60": 15, "over_60": 5},
        daily_performance=daily,
        best_days=["Tuesday", "Wednesday"],
        worst_days=["Friday", "Sunday"],
    )


def get_demo_route_performance(origin: str, destination: str, period: int) -> FlightHistoryResponse:
    """Return demo performance analytics for a route."""
    return get_demo_flight_performance(f"{origin}-{destination}", period)


def get_demo_route_search(request: RouteSearchRequest) -> RouteSearchResponse:
    """Return demo search results for Module 3."""
    dep = datetime.combine(request.departure_date, datetime.min.time().replace(hour=6), tzinfo=timezone.utc)

    itineraries = [
        # Direct flight
        ItineraryResponse(
            id="demo-1",
            segments=[
                FlightSegment(
                    airline_iata="EK",
                    airline_name="Emirates",
                    flight_number="EK191",
                    departure_airport=request.origin,
                    departure_airport_name="Dubai International",
                    arrival_airport=request.destination,
                    arrival_airport_name="Lisbon Portela",
                    departure_time=dep + timedelta(hours=2),
                    arrival_time=dep + timedelta(hours=10),
                    duration_minutes=480,
                    cabin_class="economy",
                    on_time_percentage=85.2,
                    reliability_color="green",
                ),
            ],
            total_price=385.00,
            currency=request.currency,
            total_duration_minutes=480,
            total_stops=0,
            airlines_involved=["Emirates"],
            layover_durations=[],
            best_value_score=0.82,
            reliability_score=0.85,
            booking_links=[{"airline": "EK", "url": "https://www.emirates.com", "segment_index": 0}],
            source="demo",
            deep_link="https://www.emirates.com",
        ),
        # 1-stop via Istanbul
        ItineraryResponse(
            id="demo-2",
            segments=[
                FlightSegment(
                    airline_iata="TK",
                    airline_name="Turkish Airlines",
                    flight_number="TK760",
                    departure_airport=request.origin,
                    departure_airport_name="Dubai International",
                    arrival_airport="IST",
                    arrival_airport_name="Istanbul Airport",
                    departure_time=dep + timedelta(hours=1),
                    arrival_time=dep + timedelta(hours=6),
                    duration_minutes=300,
                    cabin_class="economy",
                    on_time_percentage=78.0,
                    reliability_color="green",
                ),
                FlightSegment(
                    airline_iata="TK",
                    airline_name="Turkish Airlines",
                    flight_number="TK1755",
                    departure_airport="IST",
                    departure_airport_name="Istanbul Airport",
                    arrival_airport=request.destination,
                    arrival_airport_name="Lisbon Portela",
                    departure_time=dep + timedelta(hours=8),
                    arrival_time=dep + timedelta(hours=12),
                    duration_minutes=240,
                    cabin_class="economy",
                    on_time_percentage=74.5,
                    reliability_color="amber",
                ),
            ],
            total_price=245.00,
            currency=request.currency,
            total_duration_minutes=660,
            total_stops=1,
            airlines_involved=["Turkish Airlines"],
            layover_durations=[120],
            best_value_score=0.75,
            reliability_score=0.76,
            booking_links=[
                {"airline": "TK", "url": "https://www.turkishairlines.com", "segment_index": 0},
                {"airline": "TK", "url": "https://www.turkishairlines.com", "segment_index": 1},
            ],
            source="demo",
            deep_link="https://www.turkishairlines.com",
        ),
        # 1-stop budget combo (different airlines — the killer feature)
        ItineraryResponse(
            id="demo-3",
            segments=[
                FlightSegment(
                    airline_iata="W6",
                    airline_name="Wizz Air",
                    flight_number="W6101",
                    departure_airport="SHJ",
                    departure_airport_name="Sharjah Airport",
                    arrival_airport="BGY",
                    arrival_airport_name="Milan Bergamo",
                    departure_time=dep + timedelta(hours=3),
                    arrival_time=dep + timedelta(hours=9),
                    duration_minutes=360,
                    cabin_class="economy",
                    on_time_percentage=68.3,
                    reliability_color="amber",
                ),
                FlightSegment(
                    airline_iata="FR",
                    airline_name="Ryanair",
                    flight_number="FR4782",
                    departure_airport="BGY",
                    departure_airport_name="Milan Bergamo",
                    arrival_airport=request.destination,
                    arrival_airport_name="Lisbon Portela",
                    departure_time=dep + timedelta(hours=13),
                    arrival_time=dep + timedelta(hours=16),
                    duration_minutes=180,
                    cabin_class="economy",
                    on_time_percentage=71.0,
                    reliability_color="amber",
                ),
            ],
            total_price=127.00,
            currency=request.currency,
            total_duration_minutes=780,
            total_stops=1,
            airlines_involved=["Wizz Air", "Ryanair"],
            layover_durations=[240],
            best_value_score=0.88,
            reliability_score=0.69,
            booking_links=[
                {"airline": "W6", "url": "https://wizzair.com", "segment_index": 0},
                {"airline": "FR", "url": "https://www.ryanair.com", "segment_index": 1},
            ],
            source="demo",
            uses_nearby_airports=True,
            nearby_airport_note="Departs from Sharjah (SHJ) instead of Dubai (DXB) — 30 min drive",
            risk_warnings=["Separate bookings: if Wizz Air is delayed, Ryanair won't wait"],
        ),
    ]

    return RouteSearchResponse(
        origin=request.origin,
        origin_name="Dubai",
        destination=request.destination,
        destination_name="Lisbon",
        departure_date=request.departure_date,
        searched_airports=["DXB", "SHJ", "AUH", "LIS", "OPO", "FAO"],
        itineraries=itineraries,
        total_results=len(itineraries),
        search_time_ms=1250,
        sources_used=["demo"],
        sources_unavailable=[],
    )


def _airline_name(code: str) -> str:
    names = {
        "EK": "Emirates",
        "FZ": "FlyDubai",
        "W6": "Wizz Air",
        "FR": "Ryanair",
        "TP": "TAP Portugal",
        "TK": "Turkish Airlines",
        "G9": "Air Arabia",
        "6E": "IndiGo",
        "QR": "Qatar Airways",
    }
    return names.get(code, f"Airline {code}")
