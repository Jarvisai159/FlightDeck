"""Database engine and session management.

SQLAlchemy async engine works with both SQLite (aiosqlite) and
PostgreSQL (asyncpg). Switch by changing DATABASE_URL in .env.
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.is_development,
    # SQLite needs this for async; PostgreSQL ignores it
    connect_args={"check_same_thread": False}
    if "sqlite" in settings.database_url
    else {},
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency that yields a database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables. Used on first startup before Alembic is set up."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
