from app.models.user import User
from app.models.airport import Airport
from app.models.airline import Airline
from app.models.flight import Flight, FlightHistory
from app.models.search import SearchCache
from app.models.analytics import AnalyticsEvent, AdTracking
from app.models.preference import UserPreference, PriceAlert

__all__ = [
    "User",
    "Airport",
    "Airline",
    "Flight",
    "FlightHistory",
    "SearchCache",
    "AnalyticsEvent",
    "AdTracking",
    "UserPreference",
    "PriceAlert",
]
