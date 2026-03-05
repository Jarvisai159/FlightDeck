"""Custom exception classes for the application."""


class FlightDeckError(Exception):
    """Base exception for all FlightDeck errors."""

    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(self.message)


class ScraperError(FlightDeckError):
    """Raised when a scraper fails to fetch data."""

    def __init__(self, source: str, message: str = "Scraper failed"):
        self.source = source
        super().__init__(f"[{source}] {message}")


class ScraperBlockedError(ScraperError):
    """Raised when a scraper is blocked by the target site."""

    pass


class ScraperTimeoutError(ScraperError):
    """Raised when a scraper request times out."""

    pass


class RateLimitExceededError(FlightDeckError):
    """Raised when API rate limits are hit."""

    def __init__(self, source: str, retry_after: int = 60):
        self.source = source
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded for {source}. Retry after {retry_after}s")


class FlightNotFoundError(FlightDeckError):
    """Raised when a flight cannot be found in any source."""

    def __init__(self, flight_number: str):
        super().__init__(f"Flight {flight_number} not found")


class RouteNotFoundError(FlightDeckError):
    """Raised when no routes are found for a given origin/destination."""

    def __init__(self, origin: str, destination: str):
        super().__init__(f"No routes found from {origin} to {destination}")
