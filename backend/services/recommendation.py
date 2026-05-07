"""
services/recommendation.py — Business logic for Location Recommendations.

Implemented by: API_SPECIALIST
Version: 2.0 | May 2026 (Prompt C — async rewrite)
"""

import uuid
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from models.location_recommendation import LocationRecommendation
from models.analysis import Analysis
from services.analysis_service import run_analysis, _build_response_dict


async def create_recommendation(
    session: AsyncSession,
    lon: float,
    lat: float,
    user_id: Optional[int] = None,
    name: Optional[str] = None,
    description: Optional[str] = None,
) -> dict:
    """
    Generate a new recommendation by running an analysis.

    When user_id is provided (authenticated), the result is persisted to
    LocationRecommendation and linked to the user account.
    When user_id is None (unauthenticated), the analysis still runs and
    the result is returned without any DB persistence.
    """
    # 1. Run the analysis (this persists the Analysis record)
    analysis_res = await run_analysis(
        session=session,
        lon=lon,
        lat=lat,
        name=name,
        user_id=str(user_id) if user_id else None,
        restaurant_type=None,
    )

    # 2. Persist to LocationRecommendation only for authenticated users
    if user_id is not None:
        geom_wkt = f"SRID=4326;POINT({lon} {lat})"
        rlocation_id = uuid.uuid4()

        record = LocationRecommendation(
            rlocation_id=rlocation_id,
            user_id=user_id,
            barangay_pcode=analysis_res.get("barangay_pcode"),
            analysis_id=uuid.UUID(analysis_res["analysis_id"]),
            name=name,
            description=description,
            geom=geom_wkt,
            google_place_id=None
        )
        session.add(record)
        await session.commit()
        await session.refresh(record)

        return {
            "rlocation_id": str(record.rlocation_id),
            "name": record.name,
            "analysis": analysis_res,
            "barangay_name": analysis_res.get("barangay_name"),
            "created_at": record.created_at.isoformat() if record.created_at else None,
        }

    # Unauthenticated path — return analysis without persisting
    return {
        "rlocation_id": str(uuid.uuid4()),  # ephemeral ID, not in DB
        "name": name,
        "analysis": analysis_res,
        "barangay_name": analysis_res.get("barangay_name"),
        "created_at": None,
    }


async def get_user_recommendations(session: AsyncSession, user_id: int) -> List[dict]:
    """
    Retrieve all location recommendations for a given user.
    """
    stmt = (
        select(LocationRecommendation)
        .options(joinedload(LocationRecommendation.analysis))
        .filter(LocationRecommendation.user_id == user_id)
    )
    result = await session.execute(stmt)
    records = result.scalars().all()

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


async def get_recommendation(session: AsyncSession, rlocation_id: uuid.UUID) -> dict:
    """
    Retrieve a single location recommendation by its ID.
    """
    stmt = (
        select(LocationRecommendation)
        .options(joinedload(LocationRecommendation.analysis))
        .filter(LocationRecommendation.rlocation_id == rlocation_id)
    )
    result = await session.execute(stmt)
    rec = result.scalars().first()

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
