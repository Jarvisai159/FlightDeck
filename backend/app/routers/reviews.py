"""Review endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.tour import Tour
from app.models.review import Review
from app.models.purchase import Purchase
from app.schemas.review import ReviewCreate, ReviewResponse
from app.core.dependencies import require_auth

router = APIRouter(prefix="/api/tours", tags=["reviews"])


@router.post("/{tour_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    tour_id: int,
    data: ReviewCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    tour = await db.get(Tour, tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # Check if user purchased the tour
    result = await db.execute(
        select(Purchase).where(
            Purchase.tour_id == tour_id,
            Purchase.tourist_id == user.id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You must purchase the tour before reviewing")

    # Check for existing review
    existing = await db.execute(
        select(Review).where(
            Review.tour_id == tour_id,
            Review.tourist_id == user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You already reviewed this tour")

    review = Review(
        tour_id=tour_id,
        tourist_id=user.id,
        rating=data.rating,
        storytelling_rating=data.storytelling_rating,
        route_rating=data.route_rating,
        audio_clarity_rating=data.audio_clarity_rating,
        cultural_depth_rating=data.cultural_depth_rating,
        best_moment=data.best_moment,
        comment=data.comment,
    )
    db.add(review)

    # Update tour stats
    tour.review_count = (tour.review_count or 0) + 1
    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.tour_id == tour_id)
    )
    new_avg = avg_result.scalar()
    if new_avg is not None:
        tour.avg_rating = round(float(new_avg), 2)

    await db.flush()
    await db.refresh(review)

    return ReviewResponse(
        id=review.id,
        tour_id=review.tour_id,
        tourist_id=review.tourist_id,
        tourist_name=user.full_name,
        tourist_avatar=user.avatar_url,
        rating=review.rating,
        storytelling_rating=review.storytelling_rating,
        route_rating=review.route_rating,
        audio_clarity_rating=review.audio_clarity_rating,
        cultural_depth_rating=review.cultural_depth_rating,
        best_moment=review.best_moment,
        comment=review.comment,
        created_at=review.created_at,
    )


@router.get("/{tour_id}/reviews", response_model=list[ReviewResponse])
async def list_reviews(
    tour_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    tour = await db.get(Tour, tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    query = (
        select(Review)
        .where(Review.tour_id == tour_id)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(query)
    reviews = result.scalars().all()

    responses = []
    for r in reviews:
        tourist = await db.get(User, r.tourist_id)
        responses.append(ReviewResponse(
            id=r.id,
            tour_id=r.tour_id,
            tourist_id=r.tourist_id,
            tourist_name=tourist.full_name if tourist else "Unknown",
            tourist_avatar=tourist.avatar_url if tourist else None,
            rating=r.rating,
            storytelling_rating=r.storytelling_rating,
            route_rating=r.route_rating,
            audio_clarity_rating=r.audio_clarity_rating,
            cultural_depth_rating=r.cultural_depth_rating,
            best_moment=r.best_moment,
            comment=r.comment,
            created_at=r.created_at,
        ))

    return responses
