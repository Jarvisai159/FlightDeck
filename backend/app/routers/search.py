"""Smart search endpoints (Module 3)."""

from fastapi import APIRouter

from app.schemas.search import RouteSearchRequest, RouteSearchResponse

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("/routes", response_model=RouteSearchResponse)
async def search_routes(request: RouteSearchRequest):
    """Find all possible routes from origin to destination.

    Uses Kiwi Tequila API + alternative airport expansion + scoring.
    Placeholder — will be connected to search service in Phase 4.
    """
    from app.services.demo_data import get_demo_route_search
    return get_demo_route_search(request)
