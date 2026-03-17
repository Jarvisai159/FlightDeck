"""Wandr API — audio tour marketplace."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, async_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed demo data on startup."""
    await init_db()
    async with async_session() as db:
        from app.services.demo_data import seed_demo_data
        await seed_demo_data(db)
    yield


app = FastAPI(
    title="Wandr API",
    description="Audio tour marketplace — walk, listen, discover.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers import auth, tours, reviews, purchases, discovery  # noqa: E402

app.include_router(auth.router)
app.include_router(tours.router)
app.include_router(reviews.router)
app.include_router(purchases.router)
app.include_router(discovery.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "wandr"}
