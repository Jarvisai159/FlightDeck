"""Airport and airline lookup/autocomplete endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.airport import Airport
from app.models.airline import Airline
from app.schemas.airport import AirportResponse, AirlineResponse

router = APIRouter(prefix="/api/airports", tags=["airports"])


@router.get("/search", response_model=list[AirportResponse])
async def search_airports(
    q: str = Query(min_length=1, description="Search by name, city, IATA, or ICAO code"),
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Autocomplete search for airports."""
    search = f"%{q.upper()}%"
    search_lower = f"%{q.lower()}%"

    result = await db.execute(
        select(Airport)
        .where(
            or_(
                Airport.iata_code.ilike(search),
                Airport.icao_code.ilike(search),
                Airport.name.ilike(search_lower),
                Airport.city.ilike(search_lower),
            )
        )
        # Prioritize IATA exact matches, then name matches
        .order_by(
            # Exact IATA match first
            (Airport.iata_code == q.upper()).desc(),
            Airport.name,
        )
        .limit(limit)
    )
    airports = result.scalars().all()
    return [AirportResponse.model_validate(a) for a in airports]


@router.get("/{iata_code}", response_model=AirportResponse)
async def get_airport(iata_code: str, db: AsyncSession = Depends(get_db)):
    """Get airport by IATA code."""
    result = await db.execute(
        select(Airport).where(Airport.iata_code == iata_code.upper())
    )
    airport = result.scalar_one_or_none()
    if not airport:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Airport {iata_code} not found")
    return AirportResponse.model_validate(airport)


@router.get("/{iata_code}/alternatives", response_model=list[AirportResponse])
async def get_alternative_airports(iata_code: str, db: AsyncSession = Depends(get_db)):
    """Get nearby alternative airports for a given airport."""
    result = await db.execute(
        select(Airport).where(Airport.iata_code == iata_code.upper())
    )
    airport = result.scalar_one_or_none()
    if not airport or not airport.airport_group:
        return []

    # Find all airports in the same group
    result = await db.execute(
        select(Airport)
        .where(Airport.airport_group == airport.airport_group)
        .where(Airport.iata_code != iata_code.upper())
    )
    alternatives = result.scalars().all()
    return [AirportResponse.model_validate(a) for a in alternatives]


# --- Airlines ---

airlines_router = APIRouter(prefix="/api/airlines", tags=["airlines"])


@airlines_router.get("/search", response_model=list[AirlineResponse])
async def search_airlines(
    q: str = Query(min_length=1),
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Autocomplete search for airlines."""
    search = f"%{q}%"
    result = await db.execute(
        select(Airline)
        .where(
            or_(
                Airline.iata_code.ilike(search),
                Airline.name.ilike(search),
            )
        )
        .where(Airline.is_active.is_(True))
        .order_by((Airline.iata_code == q.upper()).desc(), Airline.name)
        .limit(limit)
    )
    airlines = result.scalars().all()
    return [AirlineResponse.model_validate(a) for a in airlines]
