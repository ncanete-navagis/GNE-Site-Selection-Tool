"""
tests/test_geo_queries.py — Unit tests for spatial query helpers.

Updated (Prompt B Integration): removed Hazard / TrafficData imports.
New models: FloodHazard, LandslideHazard, StormSurgeHazard (hazard.py)
            CebuBuilding, ManilaBuilding (building.py)
Traffic stub: get_traffic_near_point always returns [] — no execute call.
Hazard query: now returns list[dict] (not ORM instances) — check dict keys.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock

from services.geo_queries import (
    get_barangay_for_point,
    get_hazards_near_point,
    get_traffic_near_point,
)
from models.barangay import Barangay
from models.hazard import FloodHazard, LandslideHazard, StormSurgeHazard


@pytest.mark.asyncio
async def test_get_barangay_for_point_outside():
    """Verify get_barangay_for_point returns None for a point outside all barangays."""
    session = AsyncMock()

    # Mock the database result to return None (no barangay contains the point)
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = None
    session.execute.return_value = mock_result

    lon, lat = 0.0, 0.0  # A point far outside the Philippines
    result = await get_barangay_for_point(session, lon, lat)

    assert result is None
    session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_hazards_near_point():
    """Verify get_hazards_near_point queries all three hazard tables and returns dicts."""
    session = AsyncMock()

    # Each call to session.execute returns an empty scalars() result for simplicity.
    # The function loops over 3 models so execute is called 3 times.
    mock_result = MagicMock()
    mock_result.scalars().return_value = []
    session.execute.return_value = mock_result

    radius = 500.0
    results = await get_hazards_near_point(session, 121.0, 14.0, radius)

    # execute is called once per hazard table (flood, landslide, storm_surge)
    assert session.execute.call_count == 3
    # Results is a list (may be empty with mocked empty DB)
    assert isinstance(results, list)


@pytest.mark.asyncio
async def test_get_hazards_near_point_filtered():
    """Verify hazard_type filter skips irrelevant tables (only 1 execute call)."""
    session = AsyncMock()

    mock_result = MagicMock()
    mock_result.scalars().return_value = []
    session.execute.return_value = mock_result

    await get_hazards_near_point(session, 121.0, 14.0, 500.0, hazard_type="flood")

    # Only the flood table should be queried
    assert session.execute.call_count == 1


@pytest.mark.asyncio
async def test_get_traffic_near_point_returns_empty_stub():
    """Verify get_traffic_near_point returns [] without hitting the DB (stub)."""
    session = AsyncMock()

    results = await get_traffic_near_point(session, 121.0, 14.0, 1000.0)

    assert results == []
    # The stub must NOT query the database (table does not exist)
    session.execute.assert_not_called()
