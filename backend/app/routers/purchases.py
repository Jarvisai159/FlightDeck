"""Purchase and playback endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.tour import Tour
from app.models.purchase import Purchase, PurchaseStatus
from app.schemas.purchase import PurchaseCreate, PurchaseResponse, PlaybackUpdate
from app.core.dependencies import require_auth

router = APIRouter(tags=["purchases"])


@router.post(
    "/api/tours/{tour_id}/purchase",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def purchase_tour(
    tour_id: int,
    data: PurchaseCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    tour = await db.get(Tour, tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # Check for existing purchase
    existing = await db.execute(
        select(Purchase).where(
            Purchase.tour_id == tour_id,
            Purchase.tourist_id == user.id,
            Purchase.status != PurchaseStatus.REFUNDED,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You already purchased this tour")

    purchase = Purchase(
        tour_id=tour_id,
        tourist_id=user.id,
        amount=tour.price,
        currency=tour.currency,
        status=PurchaseStatus.COMPLETED,
        language_used=data.language,
    )
    db.add(purchase)

    tour.total_purchases = (tour.total_purchases or 0) + 1

    await db.flush()
    await db.refresh(purchase)

    return PurchaseResponse(
        id=purchase.id,
        tour_id=purchase.tour_id,
        tourist_id=purchase.tourist_id,
        amount=purchase.amount,
        currency=purchase.currency,
        status=purchase.status.value,
        started_at=purchase.started_at,
        completed_at=purchase.completed_at,
        last_stop_reached=purchase.last_stop_reached,
        language_used=purchase.language_used,
        created_at=purchase.created_at,
        tour_title=tour.title,
        tour_city=tour.city,
        tour_cover_image_url=tour.cover_image_url,
    )


@router.get("/api/purchases", response_model=list[PurchaseResponse])
async def list_purchases(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Purchase)
        .where(Purchase.tourist_id == user.id)
        .order_by(Purchase.created_at.desc())
        .options(selectinload(Purchase.tour))
    )
    result = await db.execute(query)
    purchases = result.scalars().all()

    return [
        PurchaseResponse(
            id=p.id,
            tour_id=p.tour_id,
            tourist_id=p.tourist_id,
            amount=p.amount,
            currency=p.currency,
            status=p.status.value,
            started_at=p.started_at,
            completed_at=p.completed_at,
            last_stop_reached=p.last_stop_reached,
            language_used=p.language_used,
            created_at=p.created_at,
            tour_title=p.tour.title if p.tour else None,
            tour_city=p.tour.city if p.tour else None,
            tour_cover_image_url=p.tour.cover_image_url if p.tour else None,
        )
        for p in purchases
    ]


@router.put("/api/purchases/{purchase_id}/progress", response_model=PurchaseResponse)
async def update_progress(
    purchase_id: int,
    data: PlaybackUpdate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    purchase = await db.get(Purchase, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    if purchase.tourist_id != user.id:
        raise HTTPException(status_code=403, detail="Not your purchase")

    if not purchase.started_at:
        purchase.started_at = datetime.now(timezone.utc)

    purchase.last_stop_reached = data.last_stop_reached

    if data.completed:
        purchase.completed_at = datetime.now(timezone.utc)
        # Update tour completion stats
        tour = await db.get(Tour, purchase.tour_id)
        if tour:
            tour.total_completions = (tour.total_completions or 0) + 1
            if tour.total_purchases:
                tour.completion_rate = round(tour.total_completions / tour.total_purchases, 2)

    await db.flush()

    tour = await db.get(Tour, purchase.tour_id)
    return PurchaseResponse(
        id=purchase.id,
        tour_id=purchase.tour_id,
        tourist_id=purchase.tourist_id,
        amount=purchase.amount,
        currency=purchase.currency,
        status=purchase.status.value,
        started_at=purchase.started_at,
        completed_at=purchase.completed_at,
        last_stop_reached=purchase.last_stop_reached,
        language_used=purchase.language_used,
        created_at=purchase.created_at,
        tour_title=tour.title if tour else None,
        tour_city=tour.city if tour else None,
        tour_cover_image_url=tour.cover_image_url if tour else None,
    )
