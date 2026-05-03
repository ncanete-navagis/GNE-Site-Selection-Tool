"""
services/geo_queries.py — PostGIS spatial query helper functions.

Used by the scoring engine (services/scoring.py) and FastAPI route handlers.

Design rules (GIS_DATABASE_ENGINEER):
  - All geometry is stored and queried in EPSG:4326 (WGS 84).
  - ST_DWithin is called on the *geography* cast of the column so that the
    radius parameter is interpreted in **metres** without manual degree
    conversion (avoids per-latitude accuracy issues).
  - Returns raw ORM instances (or dicts for unified hazard results);
    callers are responsible for serialisation.

Performance (OPTIMIZATION_ENGINEER — Phase 11):
  - All functions are async/await; callers must await them.
  - Session type is AsyncSession (sqlalchemy.ext.asyncio).
  - SQLAlchemy 2.x select() API used throughout.
  - Three independent proximity queries run concurrently via asyncio.gather()
    in analysis_service.py.

Geometry column naming (CONFIRMED from Earl's schema):
  geometry → ph_barangays, combined_*_hazards tables
  geom     → cebu_buildings, manila_buildings, location_history,
              location_recommendation

# ---------------------------------------------------------------------------
# Expected indexes (Earl applies via migration — do NOT create here)
#
#   Table: ph_barangays
#     geometry       — GiST  (ST_Within containment)
#                      CREATE INDEX idx_ph_barangays_geometry_gist
#                        ON ph_barangays USING GIST (geometry);
#
#   Tables: combined_flood_hazards, combined_landslide_hazards,
#           combined_storm_surge_hazards
#     geometry       — GiST  (ST_DWithin geography proximity)
#
#   Tables: cebu_buildings, manila_buildings
#     geom           — GiST  (ST_DWithin geography proximity)
#     amenity        — btree (IN list filter)
# ---------------------------------------------------------------------------
"""

from __future__ import annotations

from typing import Optional

from geoalchemy2.types import Geography
from sqlalchemy import cast, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.barangay import Barangay
from models.building import CebuBuilding, ManilaBuilding
from models.hazard import FloodHazard, LandslideHazard, StormSurgeHazard

# ---------------------------------------------------------------------------
# Food-amenity filter applied by get_buildings_near_point by default
# ---------------------------------------------------------------------------

FOOD_AMENITIES: list[str] = [
    "restaurant", "cafe", "fast_food", "bar", "pub",
    "food_court", "biergarten", "ice_cream", "juice_bar",
]

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_SRID = 4326


def _make_point_expr(lon: float, lat: float):
    """Return a PostGIS ST_SetSRID(ST_MakePoint(lon, lat), 4326) expression."""
    return func.ST_SetSRID(func.ST_MakePoint(lon, lat), _SRID)


# ---------------------------------------------------------------------------
# Public query helpers
# ---------------------------------------------------------------------------


async def get_barangay_for_point(
    session: AsyncSession,
    lon: float,
    lat: float,
) -> Optional[Barangay]:
    """Return the Barangay (ph_barangays row) whose geometry contains the point.

    PostGIS function: ST_Within(geometry A, geometry B)
      Returns TRUE when A is completely inside B.
      Here A is the input point and B is the barangay boundary polygon.

    Args:
        session: Active async SQLAlchemy database session.
        lon: Longitude (EPSG:4326).
        lat: Latitude (EPSG:4326).

    Returns:
        A Barangay ORM instance if found, otherwise None.
    """
    point = _make_point_expr(lon, lat)
    stmt = (
        select(Barangay)
        .where(func.ST_Within(func.ST_SetSRID(func.ST_MakePoint(lon, lat), _SRID), Barangay.geometry))
        .limit(1)
    )
    result = await session.execute(stmt)
    return result.scalars().first()


async def get_hazards_near_point(
    session: AsyncSession,
    lon: float,
    lat: float,
    radius_m: float,
    hazard_type: Optional[str] = None,
) -> list[dict]:
    """Return all hazard records within radius_m metres — unified across all three tables.

    Queries combined_flood_hazards, combined_landslide_hazards, and
    combined_storm_surge_hazards concurrently (or filtered by hazard_type).

    PostGIS function: ST_DWithin(geography A, geography B, distance_metres)
      Geometry columns are cast to geography so the radius is in metres.

    Args:
        session: Active async SQLAlchemy database session.
        lon: Longitude (EPSG:4326).
        lat: Latitude (EPSG:4326).
        radius_m: Search radius in metres.
        hazard_type: Optional — one of "flood", "landslide", "storm_surge".
                     If None, all three tables are queried.

    Returns:
        A list of dicts; each dict includes "hazard_type" plus the row's columns.
    """
    point_geog = cast(
        func.ST_SetSRID(func.ST_MakePoint(lon, lat), _SRID),
        Geography,
    )

    results: list[dict] = []

    for model, label in [
        (FloodHazard,     "flood"),
        (LandslideHazard, "landslide"),
        (StormSurgeHazard, "storm_surge"),
    ]:
        if hazard_type and hazard_type != label:
            continue

        rows = await session.execute(
            select(model).where(
                func.ST_DWithin(
                    cast(model.geometry, Geography),
                    point_geog,
                    radius_m,
                )
            )
        )
        for row in rows.scalars():
            d = {k: v for k, v in row.__dict__.items() if not k.startswith("_")}
            d["hazard_type"] = label
            results.append(d)

    return results


async def get_buildings_near_point(
    session: AsyncSession,
    lon: float,
    lat: float,
    radius_m: float,
    amenity_filter: Optional[list[str]] = None,
) -> list:
    """Return building/POI records within radius_m metres from cebu_ and manila_buildings.

    Queries both city tables and combines results.  Filters by amenity to
    restrict results to food-service POIs by default.

    PostGIS function: ST_DWithin(geography A, geography B, distance_metres)
      geom columns are cast to geography so the radius is in metres.

    Args:
        session: Active async SQLAlchemy database session.
        lon: Longitude (EPSG:4326).
        lat: Latitude (EPSG:4326).
        radius_m: Search radius in metres.
        amenity_filter: List of OSM amenity strings to include.
                        Defaults to FOOD_AMENITIES if None.

    Returns:
        A combined list of CebuBuilding and ManilaBuilding ORM instances.
    """
    amenities = amenity_filter if amenity_filter is not None else FOOD_AMENITIES

    point_geog = cast(
        func.ST_SetSRID(func.ST_MakePoint(lon, lat), _SRID),
        Geography,
    )

    all_results: list = []

    for model in [CebuBuilding, ManilaBuilding]:
        rows = await session.execute(
            select(model).where(
                func.ST_DWithin(
                    cast(model.geom, Geography),
                    point_geog,
                    radius_m,
                ),
                model.amenity.in_(amenities),
            )
        )
        all_results.extend(rows.scalars().all())

    return all_results


async def get_traffic_near_point(
    session: AsyncSession,
    lon: float,
    lat: float,
    radius_m: float,
    time_window: Optional[str] = None,
) -> list:
    """Stub — traffic table does not exist in the current DB (Earl's schema).

    Returns an empty list.  The scoring engine uses 0.5 (neutral) when the
    traffic list is empty.

    TODO: implement when Earl adds traffic data tables.

    Args:
        session: Active async SQLAlchemy database session (unused).
        lon: Longitude (unused).
        lat: Latitude (unused).
        radius_m: Search radius in metres (unused).
        time_window: Optional time window filter (unused).

    Returns:
        [] always.
    """
    # Traffic table does not exist in current DB (Earl's schema).
    # Returns empty list. Scoring engine will use 0.5 neutral stub.
    # TODO: implement when Earl adds traffic data.
    return []


async def get_geometries_in_bbox(
    session: AsyncSession,
    model_class,
    xmin: float,
    ymin: float,
    xmax: float,
    ymax: float,
) -> list:
    """Return all rows of model_class whose geometry intersects the bounding box.

    Handles both `geometry` and `geom` column names transparently.

    PostGIS functions:
      ST_MakeEnvelope(xmin, ymin, xmax, ymax, srid) — builds a rectangle.
      ST_Intersects(A, B) — TRUE when geometries share any spatial dimension.

    Args:
        session: Active async SQLAlchemy database session.
        model_class: A SQLAlchemy ORM model class with a geometry or geom column.
        xmin: Western longitude bound (EPSG:4326).
        ymin: Southern latitude bound (EPSG:4326).
        xmax: Eastern longitude bound (EPSG:4326).
        ymax: Northern latitude bound (EPSG:4326).

    Returns:
        A list of ORM instances whose geometry intersects the bounding box.

    Raises:
        ValueError: If the model has neither a `geometry` nor a `geom` column.
    """
    # Detect which geometry column the model uses
    geom_col = getattr(model_class, "geometry", None) or getattr(model_class, "geom", None)
    if geom_col is None:
        raise ValueError(
            f"Model {model_class.__name__} has no `geometry` or `geom` column. "
            "Cannot perform bounding-box query."
        )

    envelope = func.ST_MakeEnvelope(xmin, ymin, xmax, ymax, _SRID)
    stmt = select(model_class).where(func.ST_Intersects(geom_col, envelope))
    result = await session.execute(stmt)
    return list(result.scalars().all())
