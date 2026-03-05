"""Redis caching service with configurable TTLs."""

from typing import Optional
import json
import redis.asyncio as redis

from app.config import settings


class CacheService:
    """Async Redis cache with JSON serialization."""

    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def connect(self):
        self._redis = redis.from_url(settings.redis_url, decode_responses=True)

    async def disconnect(self):
        if self._redis:
            await self._redis.close()

    async def get(self, key: str) -> Optional[dict]:
        if not self._redis:
            return None
        value = await self._redis.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: dict, ttl: int = 60):
        if not self._redis:
            return
        await self._redis.set(key, json.dumps(value, default=str), ex=ttl)

    async def delete(self, key: str):
        if not self._redis:
            return
        await self._redis.delete(key)

    async def exists(self, key: str) -> bool:
        if not self._redis:
            return False
        return bool(await self._redis.exists(key))

    # Convenience methods with preset TTLs
    async def cache_flight_status(self, flight_number: str, data: dict):
        """Cache live flight status — short TTL (60 seconds)."""
        await self.set(f"flight:status:{flight_number}", data, ttl=settings.scraper_cache_ttl_live)

    async def get_flight_status(self, flight_number: str) -> Optional[dict]:
        return await self.get(f"flight:status:{flight_number}")

    async def cache_search_results(self, search_hash: str, data: dict):
        """Cache search results — medium TTL (1 hour)."""
        await self.set(f"search:{search_hash}", data, ttl=3600)

    async def get_search_results(self, search_hash: str) -> Optional[dict]:
        return await self.get(f"search:{search_hash}")

    async def cache_weather(self, airport_code: str, data: dict):
        """Cache weather data — medium TTL (30 minutes)."""
        await self.set(f"weather:{airport_code}", data, ttl=1800)

    async def get_weather(self, airport_code: str) -> Optional[dict]:
        return await self.get(f"weather:{airport_code}")


# Singleton instance
cache = CacheService()
