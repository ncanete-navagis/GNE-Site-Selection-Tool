"""
services/recommendation.py — Business logic for Location Recommendations.

Implemented by: API_SPECIALIST
"""

import uuid
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from models.location_recommendation import LocationRecommendation
from models.analysis import Analysis
from services.analysis_service import run_analysis, _build_response_dict


def create_recommendation(
    session: Session,
    lon: float,
    lat: float,
    user_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
) -> dict:
    """
    Generate a new recommendation by running an analysis and persisting it.
    """
    # 1. Run the analysis (this persists the Analysis record)
    analysis_res = run_analysis(
        session=session,
        lon=lon,
        lat=lat,
        name=name,
        user_id=user_id,
        restaurant_type=None,
    )

    # 2. Persist to LocationRecommendation table
    geom_wkt = f"SRID=4326;POINT({lon} {lat})"
    
    rlocation_id = uuid.uuid4()
    
    record = LocationRecommendation(
        rlocation_id=rlocation_id,
        user_id=user_id,
        barangay_id=analysis_res.get("barangay_id"),
        analysis_id=uuid.UUID(analysis_res["analysis_id"]),
        name=name,
        description=description,
        geom=geom_wkt,
        google_place_id=None
    )

    session.add(record)
    session.commit()
    session.refresh(record)

    # 3. Construct response dict
    return {
        "rlocation_id": str(record.rlocation_id),
        "name": record.name,
        "analysis": analysis_res,
        "barangay_name": analysis_res.get("barangay_name"),
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }


def get_user_recommendations(session: Session, user_id: str) -> List[dict]:
    """
    Retrieve all location recommendations for a given user.
    """
    records = (
        session.query(LocationRecommendation)
        .options(joinedload(LocationRecommendation.analysis))
        .filter(LocationRecommendation.user_id == user_id)
        .all()
    )

    results = []
    for rec in records:
        analysis_dict = {}
        barangay_name = None
        if rec.analysis:
            details = rec.analysis.analysis_details or {}
            analysis_dict = _build_response_dict(rec.analysis, details)
            barangay_name = details.get("barangay_name")

        results.append({
            "rlocation_id": str(rec.rlocation_id),
            "name": rec.name,
            "analysis": analysis_dict,
            "barangay_name": barangay_name,
            "created_at": rec.created_at.isoformat() if rec.created_at else None,
        })

    return results


def get_recommendation(session: Session, rlocation_id: uuid.UUID) -> dict:
    """
    Retrieve a single location recommendation by its ID.
    """
    rec = (
        session.query(LocationRecommendation)
        .options(joinedload(LocationRecommendation.analysis))
        .filter(LocationRecommendation.rlocation_id == rlocation_id)
        .first()
    )

    if not rec:
        raise HTTPException(
            status_code=404, detail="Location recommendation not found"
        )

    analysis_dict = {}
    barangay_name = None
    if rec.analysis:
        details = rec.analysis.analysis_details or {}
        analysis_dict = _build_response_dict(rec.analysis, details)
        barangay_name = details.get("barangay_name")

    return {
        "rlocation_id": str(rec.rlocation_id),
        "name": rec.name,
        "analysis": analysis_dict,
        "barangay_name": barangay_name,
        "created_at": rec.created_at.isoformat() if rec.created_at else None,
    }
