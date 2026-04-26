"""
services/geo_queries.py — PostGIS spatial query helper functions.

Used by the scoring engine (services/scoring.py) and FastAPI route handlers.

Design rules (GIS_DATABASE_ENGINEER):
  - All geometry is stored and queried in EPSG:4326 (WGS 84).
  - Bounding-box pre-filter (&&) precedes expensive ST_Within / ST_Intersects.
  - ST_DWithin is called on the *geography* cast of the column so that the
    radius parameter is interpreted in **metres** without manual degree
    conversion (avoids per-latitude accuracy issues).
  - Inputs are constructed with geoalchemy2.WKTElement (SRID=4326) — never
    raw SQL strings.
  - Returns raw ORM instances; callers are responsible for serialisation.

Performance (OPTIMIZATION_ENGINEER — Phase 11):
  - All functions converted to async/await; callers must await them.
  - Session type upgraded to AsyncSession (sqlalchemy.ext.asyncio).
  - Legacy session.query() API replaced with SQLAlchemy 2.x select() API.
  - Three independent proximity queries (hazards, traffic, businesses) are
    now awaitable so analysis_service can run them concurrently via
    asyncio.gather().

# ---------------------------------------------------------------------------
# Expected indexes (Earl applies via migration — do NOT create here)
#
#   Table: barangays
#     boundary       — GiST  (ST_Within containment + implicit && pre-filter)
#                      CREATE INDEX idx_barangays_boundary_gist
#                        ON barangays USING GIST (boundary);
#
#   Table: hazards
#     geom           — GiST  (ST_DWithin geography proximity)
#                      CREATE INDEX idx_hazards_geom_gist
#                        ON hazards USING GIST (geom);
#     hazard_type    — btree (equality filter: WHERE hazard_type = '...')
#                      CREATE INDEX idx_hazards_hazard_type
#                        ON hazards (hazard_type);
#
#   Table: traffic_data
#     geom           — GiST  (ST_DWithin geography proximity)
#                      CREATE INDEX idx_traffic_data_geom_gist
#                        ON traffic_data USING GIST (geom);
#     time_window    — btree (equality filter: WHERE time_window = '...')
#                      CREATE INDEX idx_traffic_data_time_window
#                        ON traffic_data (time_window);
#
#   Table: businesses
#     geom           — GiST  (ST_DWithin geography proximity)
#                      CREATE INDEX idx_businesses_geom_gist
#                        ON businesses USING GIST (geom);
#     category       — btree (equality filter: WHERE category = '...')
#                      CREATE INDEX idx_businesses_category
#                        ON businesses (category);
# ---------------------------------------------------------------------------
"""

from __future__ import annotations

from typing import Optional

from geoalchemy2 import WKTElement
from geoalchemy2.functions import (
    ST_DWithin,
    ST_Intersects,
    ST_MakeEnvelope,
    ST_Within,
)
from sqlalchemy import cast, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.barangay import Barangay
from models.business import Business
from models.hazard import Hazard
from models.traffic import TrafficData

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_SRID = 4326


def _point_wkt(lon: float, lat: float) -> WKTElement:
    """Return a GeoAlchemy2 WKTElement for a lon/lat point in EPSG:4326.

    PostGIS function used: ST_GeomFromText (implicit — WKTElement carries SRID).
    """
    return WKTElement(f"POINT({lon} {lat})", srid=_SRID)


# ---------------------------------------------------------------------------
# Public query helpers
# ---------------------------------------------------------------------------


async def get_barangay_for_point(
    session: AsyncSession,
    lon: float,
    lat: float,
) -> Optional[Barangay]:
    """Return the Barangay whose boundary polygon contains the given point.

    PostGIS function used: **ST_Within(geometry A, geometry B)**
      Returns TRUE when geometry A is completely inside geometry B.
      Here A is the input point and B is the barangay boundary polygon.

    Performance note: a bounding-box pre-filter (&&) is applied automatically
    by PostGIS via the GiST index on ``barangays.boundary`` before the exact
    ST_Within predicate is evaluated.

    Args:
        session: Active async SQLAlchemy database session.
        lon: Longitude of the query point (EPSG:4326).
        lat: Latitude of the query point (EPSG:4326).

    Returns:
        A :class:`~models.barangay.Barangay` ORM instance if a containing
        barangay is found, otherwise ``None``.
    """
    point = _point_wkt(lon, lat)
    stmt = select(Barangay).where(ST_Within(point, Barangay.boundary))
    result = await session.execute(stmt)
    return result.scalars().first()


async def get_hazards_near_point(
    session: AsyncSession,
    lon: float,
    lat: float,
    radius_m: float,
    hazard_type: Optional[str] = None,
) -> list[Hazard]:
    """Return all Hazard records within *radius_m* metres of the given point.

    PostGIS function used: **ST_DWithin(geography A, geography B, distance)**
      Returns TRUE when the geometries are within *distance* metres of each
      other (when called on ``geography`` columns/casts).  Casting to
      ``geography`` ensures the radius is interpreted in metres on an
      ellipsoidal model, which is accurate regardless of latitude.

    Args:
        session: Active async SQLAlchemy database session.
        lon: Longitude of the query point (EPSG:4326).
        lat: Latitude of the query point (EPSG:4326).
        radius_m: Search radius in **metres**.
        hazard_type: Optional filter; when provided only hazards whose
            ``hazard_type`` column equals this value are returned.

    Returns:
        A list of :class:`~models.hazard.Hazard` ORM instances (may be empty).
    """
    point = _point_wkt(lon, lat)
    stmt = select(Hazard).where(
        ST_DWithin(
            cast(Hazard.geom, type_=None).cast("geography"),
            cast(point, type_=None).cast("geography"),
            radius_m,
        )
    )
    if hazard_type is not None:
        stmt = stmt.where(Hazard.hazard_type == hazard_type)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_traffic_near_point(
    session: AsyncSession,
    lon: float,
    lat: float,
    radius_m: float,
    time_window: Optional[str] = None,
) -> list[TrafficData]:
    """Return TrafficData records within *radius_m* metres of the given point.

    PostGIS function used: **ST_DWithin(geography A, geography B, distance)**
      Same metre-accurate geography approach as :func:`get_hazards_near_point`.

    Args:
        session: Active async SQLAlchemy database session.
        lon: Longitude of the query point (EPSG:4326).
        lat: Latitude of the query point (EPSG:4326).
        radius_m: Search radius in **metres**.
        time_window: Optional string filter matching
            :attr:`~models.traffic.TrafficData.time_window` (e.g.
            ``"morning_peak"``).

    Returns:
        A list of :class:`~models.traffic.TrafficData` ORM instances.
    """
    point = _point_wkt(lon, lat)
    stmt = select(TrafficData).where(
        ST_DWithin(
            cast(TrafficData.geom, type_=None).cast("geography"),
            cast(point, type_=None).cast("geography"),
            radius_m,
        )
    )
    if time_window is not None:
        stmt = stmt.where(TrafficData.time_window == time_window)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_businesses_near_point(
    session: AsyncSession,
    lon: float,
    lat: float,
    radius_m: float,
    category: Optional[str] = None,
) -> list[Business]:
    """Return Business records within *radius_m* metres of the given point.

    PostGIS function used: **ST_DWithin(geography A, geography B, distance)**
      Same metre-accurate geography approach as :func:`get_hazards_near_point`.

    Args:
        session: Active async SQLAlchemy database session.
        lon: Longitude of the query point (EPSG:4326).
        lat: Latitude of the query point (EPSG:4326).
        radius_m: Search radius in **metres**.
        category: Optional string filter matching
            :attr:`~models.business.Business.category` (e.g. ``"fast_food"``).

    Returns:
        A list of :class:`~models.business.Business` ORM instances.
    """
    point = _point_wkt(lon, lat)
    stmt = select(Business).where(
        ST_DWithin(
            cast(Business.geom, type_=None).cast("geography"),
            cast(point, type_=None).cast("geography"),
            radius_m,
        )
    )
    if category is not None:
        stmt = stmt.where(Business.category == category)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_geometries_in_bbox(
    session: AsyncSession,
    model_class,
    xmin: float,
    ymin: float,
    xmax: float,
    ymax: float,
) -> list:
    """Return all rows of *model_class* whose geometry intersects the bbox.

    PostGIS functions used:
      - **ST_MakeEnvelope(xmin, ymin, xmax, ymax, srid)**
          Constructs a rectangular polygon from the four bounding-box
          coordinates.
      - **ST_Intersects(geometry A, geometry B)**
          Returns TRUE when the geometries share any spatial dimension.
          Exploits the GiST index via the implicit ``&&`` bounding-box
          pre-filter before the exact intersection test.

    The model must expose a ``geom`` column (GeoAlchemy2 ``Geometry``).
    This function is generic and works for any geometry-bearing ORM model
    (``Hazard``, ``TrafficData``, ``Business``, ``Barangay``, …).

    Args:
        session: Active async SQLAlchemy database session.
        model_class: A SQLAlchemy ORM model class that has a ``geom`` column.
        xmin: Western longitude bound (EPSG:4326).
        ymin: Southern latitude bound (EPSG:4326).
        xmax: Eastern longitude bound (EPSG:4326).
        ymax: Northern latitude bound (EPSG:4326).

    Returns:
        A list of ORM instances whose geometry intersects the bounding box.
    """
    envelope = ST_MakeEnvelope(xmin, ymin, xmax, ymax, _SRID)
    stmt = select(model_class).where(ST_Intersects(model_class.geom, envelope))
    result = await session.execute(stmt)
    return list(result.scalars().all())
