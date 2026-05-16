# services/choroplethRadiusService.py

from __future__ import annotations

import json
from typing import Optional
import sqlalchemy as sa
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from models.barangay import Barangay


RADIUS_METERS = 10_000  # 10km


async def get_population_choropleth_within_radius(
    session: AsyncSession,
    lat: float,
    lng: float,
) -> dict:
    """
    Returns barangays within 10km of a given lat/lng as a GeoJSON FeatureCollection.
    Uses PostGIS ST_DWithin for spatial filtering.
    """

    # Create PostGIS point from lat/lng
    point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)

    # Spatial filter: only barangays within 10km (~0.09 degrees)
    RADIUS_DEGREES = RADIUS_METERS / 111320.0
    
    stmt = select(
        Barangay.ADM4_EN,
        Barangay.ADM4_PCODE,
        Barangay.ADM3_EN,
        Barangay.AREA_SQKM,
        func.ST_AsGeoJSON(
            func.ST_SimplifyPreserveTopology(Barangay.geometry, 0.001)
        ).label("geojson"),
    ).where(
        func.ST_DWithin(
            Barangay.geometry,
            point,
            RADIUS_DEGREES
        )
    )

    res = await session.execute(stmt)
    barangays = res.all()

    if not barangays:
        return {"type": "FeatureCollection", "features": []}

    # --- SAME LOGIC AS YOUR ORIGINAL FILE BELOW ---

    pop_stmt = text('SELECT "unnamed:_0", "unnamed:_1" FROM total_population_region_city')
    pop_res = await session.execute(pop_stmt)
    pop_rows = pop_res.all()

    city_pop_map = {}
    for name, pop_str in pop_rows:
        if not name or not pop_str:
            continue
        clean_name = name.replace(".", "").strip().lower()
        try:
            clean_pop = int(pop_str.replace(",", ""))
            city_pop_map[clean_name] = clean_pop
        except ValueError:
            continue

    city_areas = {}
    for b in barangays:
        city_name = b.ADM3_EN.lower().strip()
        city_areas[city_name] = city_areas.get(city_name, 0) + (b.AREA_SQKM or 0)

    features = []
    max_density = 0
    temp_features = []

    for b in barangays:
        city_name = b.ADM3_EN.lower().strip()
        total_city_pop = city_pop_map.get(city_name)

        if total_city_pop is None:
            for key in city_pop_map:
                if city_name in key or key in city_name:
                    total_city_pop = city_pop_map[key]
                    break

        if total_city_pop:
            total_city_area = city_areas.get(city_name, 1.0)
            pop = int((total_city_pop / total_city_area) * (b.AREA_SQKM or 0))
            density = pop / (b.AREA_SQKM or 1.0)
        else:
            jitter = (hash(b.ADM4_PCODE) % 2000) - 1000
            density = 5000 + jitter
            pop = int(density * (b.AREA_SQKM or 0))

        max_density = max(max_density, density)
        temp_features.append({
            "b": b,
            "pop": pop,
            "density": density
        })

    for item in temp_features:
        b = item["b"]
        density_score = item["density"] / max_density if max_density > 0 else 0

        features.append({
            "type": "Feature",
            "properties": {
                "barangay": b.ADM4_EN,
                "population": item["pop"],
                "densityScore": round(density_score, 4)
            },
            "geometry": json.loads(b.geojson)
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }