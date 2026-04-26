"""
routers/barangays.py — FastAPI router for barangay reference data.

Implemented by: OPTIMIZATION_ENGINEER
Phase 11 — Query Performance & Response Speed Optimization

Endpoints
---------
GET /api/v1/barangays/               — paginated list    (cached 1 h TTL)
GET /api/v1/barangays/{barangay_id}  — single lookup     (cached 1 h TTL)

Caching
-------
- Backend: InMemoryBackend (fastapi-cache2), initialised in main.py startup.
- TTL: 3 600 seconds (1 hour).
- Caching is SAFE here — barangay reference data is NOT user-specific.
- User-specific endpoints (/history, /recommendations) are explicitly NOT cached.

Pagination
----------
- ?page=1&page_size=50  (defaults)
- page_size is capped at 200.
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_cache.decorator import cache
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from dependencies import get_db
from models.barangay import Barangay

router = APIRouter(
    prefix="/api/v1",
    tags=["Barangays"],
)

# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class BarangayResponse(BaseModel):
    """Public-facing barangay representation (geometry excluded — payload size)."""

    barangay_id: str
    name: str
    municipality: Optional[str] = None
    population: Optional[int] = None

    model_config = {"from_attributes": True}


class BarangayListResponse(BaseModel):
    """Paginated barangay list envelope."""

    page: int
    page_size: int
    total: int
    items: List[BarangayResponse]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/barangays/", response_model=BarangayListResponse)
@cache(expire=3600)
async def list_barangays(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=200, description="Records per page (max 200)"),
    db: AsyncSession = Depends(get_db),
) -> BarangayListResponse:
    """Return a paginated list of all barangays.

    Results are cached for **1 hour** — barangay boundaries change infrequently
    and this endpoint is not user-specific.

    Args:
        page: 1-indexed page number (default 1).
        page_size: Records per page (default 50, max 200).
        db: Injected async database session.

    Returns:
        :class:`BarangayListResponse` with pagination metadata and the current
        page of :class:`BarangayResponse` items.
    """
    offset = (page - 1) * page_size

    # Total row count (for pagination metadata)
    count_result = await db.execute(select(func.count()).select_from(Barangay))
    total: int = count_result.scalar_one()

    # Paginated rows ordered deterministically by PK
    stmt = (
        select(Barangay)
        .order_by(Barangay.barangay_id)
        .offset(offset)
        .limit(page_size)
    )
    rows_result = await db.execute(stmt)
    barangays = rows_result.scalars().all()

    return BarangayListResponse(
        page=page,
        page_size=page_size,
        total=total,
        items=[BarangayResponse.model_validate(b) for b in barangays],
    )


@router.get("/barangays/{barangay_id}", response_model=BarangayResponse)
@cache(expire=3600)
async def get_barangay(
    barangay_id: str,
    db: AsyncSession = Depends(get_db),
) -> BarangayResponse:
    """Return a single barangay by its PSGC code.

    Results are cached for **1 hour**.

    Args:
        barangay_id: PSGC code string (e.g. ``"063001001"``).
        db: Injected async database session.

    Returns:
        A :class:`BarangayResponse` for the matching barangay.

    Raises:
        HTTPException(404): When no barangay with the given ID exists.
    """
    record: Optional[Barangay] = await db.get(Barangay, barangay_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail=f"Barangay '{barangay_id}' not found",
        )
    return BarangayResponse.model_validate(record)
