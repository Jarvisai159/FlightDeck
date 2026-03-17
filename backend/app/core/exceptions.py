"""Custom exception classes for the application."""


class WandrError(Exception):
    """Base exception for all Wandr errors."""

    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(self.message)


class TourNotFoundError(WandrError):
    """Raised when a tour cannot be found."""

    def __init__(self, tour_id: int):
        super().__init__(f"Tour {tour_id} not found")


class AudioProcessingError(WandrError):
    """Raised when audio processing fails."""

    def __init__(self, message: str = "Audio processing failed"):
        super().__init__(message)


class PaymentError(WandrError):
    """Raised when a payment operation fails."""

    def __init__(self, message: str = "Payment failed"):
        super().__init__(message)


class RateLimitExceededError(WandrError):
    """Raised when API rate limits are hit."""

    def __init__(self, source: str, retry_after: int = 60):
        self.source = source
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded for {source}. Retry after {retry_after}s")
