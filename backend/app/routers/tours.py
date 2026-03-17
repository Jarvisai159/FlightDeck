"""Tour CRUD endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRole
from app.models.tour import Tour, TourStatus, TourTheme, TourDifficulty
from app.models.tour_stop import TourStop
from app.schemas.tour import (
    TourCreate, TourUpdate, TourResponse, TourListResponse,
    TourStopCreate, TourStopResponse,
)
from app.core.dependencies import get_current_user, require_auth

router = APIRouter(prefix="/api/tours", tags=["tours"])


@router.get("", response_model=TourListResponse)
async def list_tours(
    city: str | None = None,
    theme: str | None = None,
    language: str | None = None,
    sort_by: str = "newest",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Tour).where(Tour.status == TourStatus.PUBLISHED)

    if city:
        query = query.where(func.lower(Tour.city) == city.lower())
    if theme:
        query = query.where(Tour.theme == TourTheme(theme))
    if language:
        query = query.where(
            or_(
                Tour.original_language == language,
                Tour.available_languages.contains(language),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Sorting
    if sort_by == "price_low":
        query = query.order_by(Tour.price.asc())
    elif sort_by == "price_high":
        query = query.order_by(Tour.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Tour.avg_rating.desc())
    elif sort_by == "popular":
        query = query.order_by(Tour.total_purchases.desc())
    else:  # newest
        query = query.order_by(Tour.published_at.desc())

    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.options(selectinload(Tour.guide), selectinload(Tour.stops))

    result = await db.execute(query)
    tours = result.scalars().all()

    return TourListResponse(
        tours=[TourResponse.model_validate(t) for t in tours],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.get("/{tour_id}", response_model=TourResponse)
async def get_tour(tour_id: int, db: AsyncSession = Depends(get_db)):
    query = (
        select(Tour)
        .where(Tour.id == tour_id)
        .options(selectinload(Tour.guide), selectinload(Tour.stops))
    )
    result = await db.execute(query)
    tour = result.scalar_one_or_none()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return TourResponse.model_validate(tour)


@router.post("", response_model=TourResponse, status_code=status.HTTP_201_CREATED)
async def create_tour(
    data: TourCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in (UserRole.GUIDE, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Guide access required")

    tour = Tour(
        guide_id=user.id,
        title=data.title,
        description=data.description,
        city=data.city,
        country=data.country,
        theme=TourTheme(data.theme),
        difficulty=TourDifficulty(data.difficulty),
        price=data.price,
        currency=data.currency,
        duration_minutes=data.duration_minutes,
        distance_km=data.distance_km,
        original_language=data.original_language,
        cover_image_url=data.cover_image_url,
        start_lat=data.start_lat,
        start_lng=data.start_lng,
    )
    db.add(tour)
    await db.flush()
    await db.refresh(tour)
    return TourResponse.model_validate(tour)


@router.put("/{tour_id}", response_model=TourResponse)
async def update_tour(
    tour_id: int,
    data: TourUpdate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    tour = await db.get(Tour, tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if tour.guide_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your tour")

    update_data = data.model_dump(exclude_unset=True)
    if "theme" in update_data:
        update_data["theme"] = TourTheme(update_data["theme"])
    if "difficulty" in update_data:
        update_data["difficulty"] = TourDifficulty(update_data["difficulty"])

    for field, value in update_data.items():
        setattr(tour, field, value)

    await db.flush()
    await db.refresh(tour)
    return TourResponse.model_validate(tour)


@router.post("/{tour_id}/stops", response_model=TourStopResponse, status_code=status.HTTP_201_CREATED)
async def add_stop(
    tour_id: int,
    data: TourStopCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    tour = await db.get(Tour, tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if tour.guide_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your tour")

    stop = TourStop(
        tour_id=tour_id,
        order=data.order,
        title=data.title,
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        trigger_radius_meters=data.trigger_radius_meters,
        audio_url=data.audio_url,
        audio_duration_seconds=data.audio_duration_seconds,
        translated_audio_urls=data.translated_audio_urls or {},
        image_url=data.image_url,
        image_caption=data.image_caption,
        walking_instructions=data.walking_instructions,
        walking_duration_seconds=data.walking_duration_seconds,
    )
    db.add(stop)

    tour.stop_count = (tour.stop_count or 0) + 1
    await db.flush()
    await db.refresh(stop)
    return TourStopResponse.model_validate(stop)


@router.post("/{tour_id}/publish", response_model=TourResponse)
async def publish_tour(
    tour_id: int,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Tour)
        .where(Tour.id == tour_id)
        .options(selectinload(Tour.guide), selectinload(Tour.stops))
    )
    result = await db.execute(query)
    tour = result.scalar_one_or_none()

    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if tour.guide_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your tour")
    if tour.stop_count < 3:
        raise HTTPException(status_code=400, detail="Tour needs at least 3 stops to publish")

    # Simple quality score based on completeness
    score = 0.0
    if tour.description and len(tour.description) > 50:
        score += 20
    if tour.cover_image_url:
        score += 15
    if tour.stop_count >= 5:
        score += 25
    elif tour.stop_count >= 3:
        score += 15
    stops_with_audio = sum(1 for s in tour.stops if s.audio_url)
    if stops_with_audio == tour.stop_count:
        score += 25
    elif stops_with_audio > 0:
        score += 10
    if tour.start_lat and tour.start_lng:
        score += 15

    tour.quality_score = score
    tour.status = TourStatus.PUBLISHED
    tour.published_at = datetime.now(timezone.utc)

    await db.flush()
    return TourResponse.model_validate(tour)
