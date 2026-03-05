"""Request/response schemas for airport data."""

from typing import Optional
from pydantic import BaseModel


class AirportResponse(BaseModel):
    id: int
    iata_code: Optional[str] = None
    icao_code: Optional[str] = None
    name: str
    city: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    latitude: float
    longitude: float
    timezone: Optional[str] = None
    airport_group: Optional[str] = None
    alternative_codes: Optional[list[str]] = None

    model_config = {"from_attributes": True}


class AirportSearchQuery(BaseModel):
    q: str  # Search query (airport name, city, or IATA code)
    limit: int = 10


class AirlineResponse(BaseModel):
    id: int
    iata_code: Optional[str] = None
    name: str
    country: Optional[str] = None
    website: Optional[str] = None

    model_config = {"from_attributes": True}
