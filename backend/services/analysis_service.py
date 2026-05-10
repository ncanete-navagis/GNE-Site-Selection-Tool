"""
services/analysis_service.py — Analysis orchestration service.

Implemented by: API_SPECIALIST
Version: 1.1 | April 2026 (OPTIMIZATION_ENGINEER Phase 11 — async + parallel queries)

Responsibility:
  This module is the single entry-point for the site-analysis pipeline.
  It coordinates three previously implemented layers in strict order:

    1. geo_queries   — PostGIS spatial lookups (barangay, hazards, traffic,
                       businesses)
    2. scoring       — Stateless normalisation + weighted aggregation
    3. SQLAlchemy    — Persists the Analysis row (and optional extras via
                       analysis_details JSON column)

Design rules (API_SPECIALIST):
  - No raw SQL strings; all DB access goes through the session + ORM.
  - analysis_id is generated here (UUID4); the DB default is a fallback.
  - analyzed_at is set server-side (datetime.utcnow()); the DB default is
    a fallback to guard against clock-skew on multi-instance deployments.
  - Extra response fields that are NOT physical Analysis columns (stars,
    pros, cons, barangay_pcode, barangay_name, name, user_id,
    restaurant_type) are persisted inside the analysis_details JSON column
    so that the GET endpoint can reconstruct the full response without
    re-running the spatial pipeline.
  - If no barangay contains the query point, raises HTTPException(404).
  - SCORING_RADIUS_M defaults to 500 m; override via environment variable.

Performance (OPTIMIZATION_ENGINEER — Phase 11):
  - run_analysis() and get_analysis() are now async.
  - Session type upgraded to AsyncSession.
  - The three independent spatial proximity queries (hazards, traffic,
    businesses) are executed concurrently via asyncio.gather(), reducing
    total latency from ~3× single-query time to ~1× single-query time.

Public surface:
  async run_analysis(session, lon, lat, name, user_id, restaurant_type) -> dict
  async get_analysis(session, analysis_id) -> dict
"""

from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from models.analysis import Analysis
from services import geo_queries, external_places
from services.scoring import (
    compute_scores,
    compute_overall_score,
    score_to_stars,
    generate_pros_cons,
)
from utils.logger import log_scoring_engine_call, get_logger
import time

logger = get_logger()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

#: Default spatial search radius in metres.  Override with env var.
SCORING_RADIUS_M: float = float(os.environ.get("SCORING_RADIUS_M", 500))


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _build_response_dict(record: Analysis, details: dict) -> dict:
    """Merge an Analysis ORM row with its stored analysis_details into the
    full API response shape.

    Args:
        record: A persisted :class:`~models.analysis.Analysis` ORM instance.
        details: The dict previously stored in ``record.analysis_details``.

    Returns:
        A ``dict`` matching the POST /analysis/ response contract.
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
        "street": details.get("street"),
        "house_number": details.get("house_number"),
        "population": details.get("population"),
        "actual_population": details.get("actual_population"),
        "traffic_kmh": details.get("traffic_kmh"),
        "actual_traffic_kmh": details.get("actual_traffic_kmh"),
        "lot_area": details.get("lot_area"),
        "commercial_space": details.get("commercial_space"),
        "restaurant_type": details.get("restaurant_type"),
        "sector_counts": details.get("sector_counts", {}),
        "nearby_establishments": details.get("sector_counts", {}),
        "site_context": details.get("site_context", {}),
        "market_analysis": details.get("market_analysis", {}),
        "scoring_breakdown": {
            "foot_traffic": record.foot_traffic_score,
            "competition": record.competing_business_score,
            "flood_safety": record.flood_hazard_score,
            "landslide_safety": record.landslide_hazard_score,
            "storm_surge_safety": record.storm_surge_score,
            "traffic": record.traffic_score,
        }
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
    """Execute the full site-analysis pipeline and persist the result.

    Pipeline steps
    --------------
    1. Identify the containing barangay via ST_Within.  If none is found,
       raises :class:`fastapi.HTTPException` with status 404.
    2. Run spatial proximity queries (hazards, traffic, businesses) within
       :data:`SCORING_RADIUS_M` metres **concurrently** via asyncio.gather().
    3. Normalise raw query results into sub-scores via
       :func:`~services.scoring.compute_scores`.
    4. Aggregate sub-scores into a weighted overall score via
       :func:`~services.scoring.compute_overall_score`.
    5. Map overall score to a 1–5 star rating.
    6. Generate human-readable pros/cons lists.
    7. Persist an :class:`~models.analysis.Analysis` ORM row.  Extra
       response fields (stars, pros, cons, barangay metadata, caller
       inputs) are stored in the ``analysis_details`` JSON column.
    8. Return the full response dict without a second DB round-trip.

    Args:
        session: Active async SQLAlchemy database session (provided by the
            router dependency).
        lon: Longitude of the candidate site in EPSG:4326.
        lat: Latitude of the candidate site in EPSG:4326.
        name: Optional human-readable label for the location.
        user_id: Optional UUID string of the requesting user.
        restaurant_type: Optional restaurant category string; reserved for
            future weight-vector customisation (currently ignored by the
            scoring engine — weights default to equal).
        radius_m: Optional search radius in metres.
        population: Optional target population count.
        traffic_kmh: Optional target traffic speed.
        lot_area: Optional target lot area.
        business_sectors: Optional list of sectors to count. Defaults to 
            ["restaurants", "banks", "schools", "hospitals", "malls"].

    Returns:
        A ``dict`` matching the POST /api/v1/analysis/ response schema.

    Raises:
        :class:`fastapi.HTTPException` (404): When the point does not fall
            inside any known barangay boundary.
    """
    # ------------------------------------------------------------------
    # Step 1 — Barangay containment check
    # ------------------------------------------------------------------
    barangay = await geo_queries.get_barangay_for_point(session, lon, lat)
    if barangay is None:
        raise HTTPException(
            status_code=404,
            detail="Point outside known barangay boundaries",
        )

    # ------------------------------------------------------------------
    # Step 2 — Spatial proximity queries (concurrent)
    #
    # The queries are independent — no data dependency between them.
    # asyncio.gather() runs them concurrently, reducing wall-clock latency.
    # ------------------------------------------------------------------
    # Use provided radius or fall back to default
    radius = radius_m if radius_m is not None else SCORING_RADIUS_M

    # Use provided sectors or fall back to defaults expected by the UI
    sectors = business_sectors
    if sectors is None:
        sectors = ["restaurants", "banks", "schools", "hospitals", "malls"]

    start_gather = time.perf_counter()
    import httpx
    async with httpx.AsyncClient(timeout=15.0) as client:
        hazards, traffic_data, businesses, foot_traffic_data, address_details, live_traffic_speed, sector_counts, site_context, market_analysis = await asyncio.gather(
            geo_queries.get_hazards_near_point(session, lon, lat, radius),
            geo_queries.get_traffic_near_point(session, lon, lat, radius),
            geo_queries.get_buildings_near_point(session, lon, lat, radius),
            external_places.get_foot_traffic_proxy(lat, lon, radius, client=client),
            external_places.reverse_geocode(lat, lon, client=client),
            external_places.get_traffic_speed_proxy(lat, lon, client=client),
            external_places.get_sector_counts(lat, lon, radius, sectors, client=client),
            external_places.get_site_context(lat, lon, radius, client=client),
            external_places.get_market_analysis(lat, lon, radius, client=client),
        )
    gather_duration = (time.perf_counter() - start_gather) * 1000
    logger.info(f"Parallel analysis gather took {gather_duration:.2f}ms")

    # ------------------------------------------------------------------
    # Step 3 — Compute sub-scores (normalised to [0.0, 1.0])
    # ------------------------------------------------------------------
    _start_score_time = time.perf_counter()
    sub_scores = compute_scores(hazards, businesses, traffic_data, foot_traffic_data)
    _score_duration = (time.perf_counter() - _start_score_time) * 1000.0

    log_scoring_engine_call(
        lon=lon,
        lat=lat,
        sub_scores=sub_scores,
        duration_ms=_score_duration
    )

    # ------------------------------------------------------------------
    # Step 4 — Weighted overall score
    #   restaurant_type weight customisation is reserved for a future
    #   sprint; equal weights are applied for now.
    # ------------------------------------------------------------------
    overall_score = compute_overall_score(sub_scores)

    # ------------------------------------------------------------------
    # Step 5–6 — Stars and pros/cons
    # ------------------------------------------------------------------
    stars = score_to_stars(overall_score)
    pros_cons = generate_pros_cons(sub_scores)

    # ------------------------------------------------------------------
    # Step 7 — Persist to Analysis table
    # ------------------------------------------------------------------
    analysis_id = uuid.uuid4()
    analyzed_at = datetime.now(tz=timezone.utc)

    # All fields that are not physical Analysis columns are stored here so
    # the GET endpoint can reconstruct the same response without repeating
    # the spatial pipeline.
    details: dict = {
        "stars": stars,
        "pros": pros_cons["pros"],
        "cons": pros_cons["cons"],
        "barangay_pcode": barangay.ADM4_PCODE,   # actual PK column in ph_barangays
        "barangay_name": barangay.ADM4_EN,        # English barangay name column
        "street": address_details.get("street"),
        "house_number": address_details.get("house_number"),
        "name": name,
        "user_id": str(user_id) if user_id else None,
        "restaurant_type": restaurant_type,
        "population": population,
        "traffic_kmh": traffic_kmh,
        "lot_area": lot_area,
        "actual_population": int((barangay.AREA_SQKM or 1.0) * 5000), # Mock: 5k people per sqkm
        "actual_traffic_kmh": round(live_traffic_speed, 1),
        "commercial_space": "Yes" if len(businesses) > 0 else "No",
        "sector_counts": sector_counts,
        "site_context": site_context,
        "market_analysis": market_analysis,
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

    # ------------------------------------------------------------------
    # Step 8 — Return response dict (no second DB round-trip needed)
    # ------------------------------------------------------------------
    return _build_response_dict(record, details)


async def get_analysis(session: AsyncSession, analysis_id: uuid.UUID) -> dict:
    """Retrieve a previously persisted analysis by its primary key.

    Reconstructs the full API response from the Analysis ORM row and
    the ``analysis_details`` JSON column without re-running spatial
    queries.

    Args:
        session: Active async SQLAlchemy database session.
        analysis_id: UUID primary key of the target Analysis record.

    Returns:
        A ``dict`` matching the GET /api/v1/analysis/{analysis_id}
        response schema (same shape as the POST response).

    Raises:
        :class:`fastapi.HTTPException` (404): When no Analysis record
            exists for the given ``analysis_id``.
    """
    record: Optional[Analysis] = await session.get(Analysis, analysis_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis {analysis_id} not found",
        )

    details: dict = record.analysis_details or {}
    return _build_response_dict(record, details)
