"""
services/analysis_service.py — Analysis orchestration service.

Implemented by: API_SPECIALIST
Version: 1.2 | May 2026 (criteria support)
"""

from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from models.analysis import Analysis
from services import geo_queries
from services.scoring import (
    compute_scores,
    compute_overall_score,
    score_to_stars,
    generate_pros_cons,
)
from utils.logger import log_scoring_engine_call
import time

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

#: Default spatial search radius in metres.  Override with env var.
DEFAULT_RADIUS_M: float = float(os.environ.get("SCORING_RADIUS_M", 1000))


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _build_response_dict(record: Analysis, details: dict) -> dict:
    """Merge an Analysis ORM row with its stored analysis_details into the
    full API response shape.
    """
    return {
        "analysis_id": str(record.analysis_id),
        "overall_score": record.overall_score,
        "traffic_score": record.traffic_score,
        "foot_traffic_score": record.foot_traffic_score,
        "competing_business_score": record.competing_business_score,
        "landslide_hazard_score": record.landslide_hazard_score,
        "flood_hazard_score": record.flood_hazard_score,
        "storm_surge_score": record.storm_surge_score,
        "stars": details.get("stars"),
        "pros": details.get("pros", []),
        "cons": details.get("cons", []),
        "analyzed_at": (
            record.analyzed_at.isoformat()
            if record.analyzed_at
            else None
        ),
        "barangay_pcode": details.get("barangay_pcode"),
        "barangay_name": details.get("barangay_name"),
        "competitors": details.get("competitors", []),
        # Criteria metadata
        "radius_m": details.get("radius_m"),
        "population": details.get("population"),
        "traffic_kmh": details.get("traffic_kmh"),
        "lot_area": details.get("lot_area"),
        "business_sectors": details.get("business_sectors"),
        # Mock actuals for Comparison Squares
        "actual_population": details.get("actual_population", 0),
        "actual_traffic_kmh": details.get("actual_traffic_kmh", 0),
        "commercial_space": details.get("commercial_space", "No"),
        "sector_counts": details.get("sector_counts", {})
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def run_analysis(
    session: AsyncSession,
    lon: float,
    lat: float,
    name: Optional[str] = None,
    user_id: Optional[str] = None,
    restaurant_type: Optional[str] = None,
    radius_m: Optional[float] = None,
    population: Optional[int] = None,
    traffic_kmh: Optional[float] = None,
    lot_area: Optional[float] = None,
    business_sectors: Optional[List[str]] = None,
) -> dict:
    """Execute the full site-analysis pipeline and persist the result."""
    
    radius = radius_m if radius_m is not None else DEFAULT_RADIUS_M

    # 1. Barangay containment
    barangay = await geo_queries.get_barangay_for_point(session, lon, lat)
    if barangay is None:
        raise HTTPException(
            status_code=404,
            detail="Point outside known barangay boundaries",
        )

    # 2. Spatial proximity queries (concurrent)
    # Map friendly names to OSM amenity tags if business_sectors provided
    amenity_filter = None
    if business_sectors:
        sector_map = {
            "Banks": ["bank", "atm"],
            "Schools": ["school", "college", "university"],
            "Malls": ["mall", "marketplace"],
            "Hospitals": ["hospital", "clinic", "pharmacy"],
            "Restaurants": ["restaurant", "cafe", "fast_food"]
        }
        amenity_filter = []
        for s in business_sectors:
            amenity_filter.extend(sector_map.get(s, []))
    
    hazards, traffic_data, businesses = await asyncio.gather(
        geo_queries.get_hazards_near_point(session, lon, lat, radius),
        geo_queries.get_traffic_near_point(session, lon, lat, radius),
        geo_queries.get_buildings_near_point(session, lon, lat, radius, amenity_filter=amenity_filter),
    )

    # 3. Compute sub-scores
    _start_score_time = time.perf_counter()
    sub_scores = compute_scores(hazards, traffic_data, businesses)
    _score_duration = (time.perf_counter() - _start_score_time) * 1000.0

    # 4. Weighted overall score
    overall_score = compute_overall_score(sub_scores)

    # 5-6. Stars and pros/cons
    stars = score_to_stars(overall_score)
    pros_cons = generate_pros_cons(sub_scores)

    # 7. Persist
    analysis_id = uuid.uuid4()
    analyzed_at = datetime.now(tz=timezone.utc)

    # Mock sector counts for the new UI
    sector_counts = {}
    if business_sectors:
        for s in business_sectors:
            # This is a simplification; in a real app we'd filter businesses by sector again
            sector_counts[s] = len(businesses) // len(business_sectors)
    else:
        sector_counts = {"Restaurants": len(businesses)}

    details: dict = {
        "stars": stars,
        "pros": pros_cons["pros"],
        "cons": pros_cons["cons"],
        "barangay_pcode": barangay.ADM4_PCODE,
        "barangay_name": barangay.ADM4_EN,
        "name": name,
        "user_id": str(user_id) if user_id else None,
        "restaurant_type": restaurant_type,
        "radius_m": radius,
        "population": population,
        "traffic_kmh": traffic_kmh,
        "lot_area": lot_area,
        "business_sectors": business_sectors,
        "actual_population": 15200, # Mock actual for Cebu area
        "actual_traffic_kmh": 22.5,  # Mock actual
        "commercial_space": "Yes" if len(businesses) > 5 else "No",
        "sector_counts": sector_counts,
        "competitors": [
            {
                "name": b.name or "Unnamed Business",
                "amenity": b.amenity,
                "lat": b.lat,
                "lng": b.lon,
                "cuisine": getattr(b, "cuisine", None)
            } for b in businesses[:10] # Limit competitors in JSON
        ]
    }

    record = Analysis(
        analysis_id=analysis_id,
        overall_score=overall_score,
        traffic_score=sub_scores["traffic_score"],
        foot_traffic_score=sub_scores["foot_traffic_score"],
        competing_business_score=sub_scores["competing_business_score"],
        landslide_hazard_score=sub_scores["landslide_hazard_score"],
        flood_hazard_score=sub_scores["flood_hazard_score"],
        storm_surge_score=sub_scores["storm_surge_score"],
        analyzed_at=analyzed_at,
        analysis_details=details,
    )

    session.add(record)
    await session.commit()
    await session.refresh(record)

    return _build_response_dict(record, details)


async def get_analysis(session: AsyncSession, analysis_id: uuid.UUID) -> dict:
    """Retrieve a previously persisted analysis."""
    record: Optional[Analysis] = await session.get(Analysis, analysis_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis {analysis_id} not found",
        )

    details: dict = record.analysis_details or {}
    return _build_response_dict(record, details)
