import pytest
from unittest.mock import AsyncMock, MagicMock
from services.geo_queries import get_barangay_for_point, get_hazards_near_point, get_traffic_near_point
from models.barangay import Barangay
from models.hazard import Hazard
from models.traffic import TrafficData

@pytest.mark.asyncio
async def test_get_barangay_for_point_outside():
    """Verify get_barangay_for_point returns None for a point outside all barangays."""
    session = AsyncMock()
    
    # Mock the database result to return None (no barangay contains the point)
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = None
    session.execute.return_value = mock_result
    
    lon, lat = 0.0, 0.0 # A point far outside the Philippines
    result = await get_barangay_for_point(session, lon, lat)
    
    assert result is None
    session.execute.assert_called_once()

@pytest.mark.asyncio
async def test_get_hazards_near_point():
    """Verify get_hazards_near_point returns only records within radius."""
    session = AsyncMock()
    
    # Create mock hazards
    mock_hazard1 = Hazard(id="h1", hazard_type="flood", severity="high")
    mock_hazard2 = Hazard(id="h2", hazard_type="landslide", severity="low")
    
    mock_result = MagicMock()
    mock_result.scalars().all.return_value = [mock_hazard1, mock_hazard2]
    session.execute.return_value = mock_result
    
    radius = 500.0
    results = await get_hazards_near_point(session, 121.0, 14.0, radius)
    
    assert len(results) == 2
    assert results[0].hazard_type == "flood"
    session.execute.assert_called_once()
    
    # The actual spatial filtering is done by PostGIS ST_DWithin in the query.
    # Here we assert that the query was executed.
    stmt = session.execute.call_args[0][0]
    stmt_str = str(stmt).lower()
    assert "st_dwithin" in stmt_str

@pytest.mark.asyncio
async def test_get_traffic_near_point_time_window():
    """Verify get_traffic_near_point respects the time_window filter."""
    session = AsyncMock()
    
    mock_traffic = TrafficData(id="t1", traffic_score="80", time_window="morning_peak")
    
    mock_result = MagicMock()
    mock_result.scalars().all.return_value = [mock_traffic]
    session.execute.return_value = mock_result
    
    radius = 1000.0
    time_window = "morning_peak"
    results = await get_traffic_near_point(session, 121.0, 14.0, radius, time_window=time_window)
    
    assert len(results) == 1
    assert results[0].time_window == "morning_peak"
    
    stmt = session.execute.call_args[0][0]
    stmt_str = str(stmt).lower()
    assert "time_window" in stmt_str
    assert "st_dwithin" in stmt_str
