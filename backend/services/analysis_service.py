"""
services/analysis_service.py — Analysis orchestration service.

Implemented by: API_SPECIALIST
Version: 1.0 | April 2026

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
    pros, cons, barangay_id, barangay_name, name, user_id,
    restaurant_type) are persisted inside the analysis_details JSON column
    so that the GET endpoint can reconstruct the full response without
    re-running the spatial pipeline.
  - If no barangay contains the query point, raises HTTPException(404).
  - SCORING_RADIUS_M defaults to 500 m; override via environment variable.

Public surface:
  run_analysis(session, lon, lat, name, user_id, restaurant_type) -> dict
  get_analysis(session, analysis_id) -> dict
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.analysis import Analysis
from services import geo_queries
from services.scoring import (
    compute_scores,
    compute_overall_score,
    score_to_stars,
    generate_pros_cons,
)

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
        "barangay_id": details.get("barangay_id"),
        "barangay_name": details.get("barangay_name"),
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def run_analysis(
    session: Session,
    lon: float,
    lat: float,
    name: Optional[str] = None,
    user_id: Optional[str] = None,
    restaurant_type: Optional[str] = None,
) -> dict:
    """Execute the full site-analysis pipeline and persist the result.

    Pipeline steps
    --------------
    1. Identify the containing barangay via ST_Within.  If none is found,
       raises :class:`fastapi.HTTPException` with status 404.
    2. Run spatial proximity queries (hazards, traffic, businesses) within
       :data:`SCORING_RADIUS_M` metres.
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
        session: Active SQLAlchemy database session (provided by the router
            dependency).
        lon: Longitude of the candidate site in EPSG:4326.
        lat: Latitude of the candidate site in EPSG:4326.
        name: Optional human-readable label for the location.
        user_id: Optional UUID string of the requesting user.
        restaurant_type: Optional restaurant category string; reserved for
            future weight-vector customisation (currently ignored by the
            scoring engine — weights default to equal).

    Returns:
        A ``dict`` matching the POST /api/v1/analysis/ response schema.

    Raises:
        :class:`fastapi.HTTPException` (404): When the point does not fall
            inside any known barangay boundary.
    """
    # ------------------------------------------------------------------
    # Step 1 — Barangay containment check
    # ------------------------------------------------------------------
    barangay = geo_queries.get_barangay_for_point(session, lon, lat)
    if barangay is None:
        raise HTTPException(
            status_code=404,
            detail="Point outside known barangay boundaries",
        )

    # ------------------------------------------------------------------
    # Step 2 — Spatial proximity queries
    # ------------------------------------------------------------------
    hazards = geo_queries.get_hazards_near_point(
        session, lon, lat, SCORING_RADIUS_M
    )
    traffic_data = geo_queries.get_traffic_near_point(
        session, lon, lat, SCORING_RADIUS_M
    )
    businesses = geo_queries.get_businesses_near_point(
        session, lon, lat, SCORING_RADIUS_M
    )

    # ------------------------------------------------------------------
    # Step 3 — Compute sub-scores (normalised to [0.0, 1.0])
    # ------------------------------------------------------------------
    sub_scores = compute_scores(hazards, traffic_data, businesses)

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
        "barangay_id": barangay.barangay_id,
        "barangay_name": barangay.name,
        "name": name,
        "user_id": str(user_id) if user_id else None,
        "restaurant_type": restaurant_type,
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
    session.commit()
    session.refresh(record)

    # ------------------------------------------------------------------
    # Step 8 — Return response dict (no second DB round-trip needed)
    # ------------------------------------------------------------------
    return _build_response_dict(record, details)


def get_analysis(session: Session, analysis_id: uuid.UUID) -> dict:
    """Retrieve a previously persisted analysis by its primary key.

    Reconstructs the full API response from the Analysis ORM row and
    the ``analysis_details`` JSON column without re-running spatial
    queries.

    Args:
        session: Active SQLAlchemy database session.
        analysis_id: UUID primary key of the target Analysis record.

    Returns:
        A ``dict`` matching the GET /api/v1/analysis/{analysis_id}
        response schema (same shape as the POST response).

    Raises:
        :class:`fastapi.HTTPException` (404): When no Analysis record
            exists for the given ``analysis_id``.
    """
    record: Optional[Analysis] = session.get(Analysis, analysis_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis {analysis_id} not found",
        )

    details: dict = record.analysis_details or {}
    return _build_response_dict(record, details)
