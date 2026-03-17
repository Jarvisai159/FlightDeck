"""Discovery and search endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, or_, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.tour import Tour, TourStatus, TourTheme
from app.schemas.tour import TourResponse, TourListResponse

router = APIRouter(prefix="/api/discover", tags=["discovery"])


@router.get("/city/{city}", response_model=TourListResponse)
async def city_landing(
    city: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Tour)
        .where(Tour.status == TourStatus.PUBLISHED, func.lower(Tour.city) == city.lower())
        .order_by(Tour.avg_rating.desc(), Tour.total_purchases.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .options(selectinload(Tour.guide), selectinload(Tour.stops))
    )
    result = await db.execute(query)
    tours = result.scalars().all()

    return TourListResponse(
        tours=[TourResponse.model_validate(t) for t in tours],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/nearby", response_model=TourListResponse)
async def nearby_tours(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    # Simple distance approximation using lat/lng differences
    # 1 degree lat ≈ 111 km, 1 degree lng ≈ 111 * cos(lat) km
    lat_range = radius_km / 111.0
    lng_range = radius_km / (111.0 * max(0.1, abs(__import__("math").cos(__import__("math").radians(lat)))))

    query = (
        select(Tour)
        .where(
            Tour.status == TourStatus.PUBLISHED,
            Tour.start_lat.isnot(None),
            Tour.start_lng.isnot(None),
            Tour.start_lat.between(lat - lat_range, lat + lat_range),
            Tour.start_lng.between(lng - lng_range, lng + lng_range),
        )
        .order_by(Tour.avg_rating.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .options(selectinload(Tour.guide), selectinload(Tour.stops))
    )
    result = await db.execute(query)
    tours = result.scalars().all()

    return TourListResponse(
        tours=[TourResponse.model_validate(t) for t in tours],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/featured", response_model=TourListResponse)
async def featured_tours(
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Tour)
        .where(Tour.status == TourStatus.PUBLISHED)
        .order_by(Tour.avg_rating.desc(), Tour.total_purchases.desc())
        .limit(12)
        .options(selectinload(Tour.guide), selectinload(Tour.stops))
    )
    result = await db.execute(query)
    tours = result.scalars().all()

    return TourListResponse(
        tours=[TourResponse.model_validate(t) for t in tours],
        total=len(tours),
        page=1,
        page_size=12,
        has_more=False,
    )


@router.get("/search", response_model=TourListResponse)
async def search_tours(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    search_term = f"%{q.lower()}%"
    query = (
        select(Tour)
        .where(
            Tour.status == TourStatus.PUBLISHED,
            or_(
                func.lower(Tour.title).like(search_term),
                func.lower(Tour.description).like(search_term),
                func.lower(Tour.city).like(search_term),
                func.lower(Tour.country).like(search_term),
            ),
        )
        .order_by(Tour.avg_rating.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .options(selectinload(Tour.guide), selectinload(Tour.stops))
    )
    result = await db.execute(query)
    tours = result.scalars().all()

    return TourListResponse(
        tours=[TourResponse.model_validate(t) for t in tours],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )
