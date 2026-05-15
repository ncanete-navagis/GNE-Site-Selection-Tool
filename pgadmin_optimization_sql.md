# pgAdmin SQL — Database Optimization
# Run each block ONE AT A TIME in pgAdmin's query tool.
# Wait for each block to finish before running the next.

---

## BLOCK 1 — Create All Spatial Indexes
# Safe to run even if some indexes already exist (uses IF NOT EXISTS)
# Estimated time: 1–5 minutes

```sql
-- ph_barangays
CREATE INDEX IF NOT EXISTS idx_ph_barangays_geometry_gist
    ON ph_barangays USING GIST (geometry);

-- combined_flood_hazards
CREATE INDEX IF NOT EXISTS idx_combined_flood_hazards_geometry_gist
    ON combined_flood_hazards USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_combined_flood_hazards_geog_gist
    ON combined_flood_hazards USING GIST ((geometry::geography));

-- combined_landslide_hazards
CREATE INDEX IF NOT EXISTS idx_combined_landslide_hazards_geometry_gist
    ON combined_landslide_hazards USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_combined_landslide_hazards_geog_gist
    ON combined_landslide_hazards USING GIST ((geometry::geography));

-- combined_storm_surge_hazards
CREATE INDEX IF NOT EXISTS idx_combined_storm_surge_hazards_geometry_gist
    ON combined_storm_surge_hazards USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_combined_storm_surge_hazards_geog_gist
    ON combined_storm_surge_hazards USING GIST ((geometry::geography));

-- cebu_buildings
CREATE INDEX IF NOT EXISTS idx_cebu_buildings_geom_gist
    ON cebu_buildings USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_cebu_buildings_geog_gist
    ON cebu_buildings USING GIST ((geom::geography));

CREATE INDEX IF NOT EXISTS idx_cebu_buildings_amenity
    ON cebu_buildings USING btree (amenity);

-- manila_buildings
CREATE INDEX IF NOT EXISTS idx_manila_buildings_geom_gist
    ON manila_buildings USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_manila_buildings_geog_gist
    ON manila_buildings USING GIST ((geom::geography));

CREATE INDEX IF NOT EXISTS idx_manila_buildings_amenity
    ON manila_buildings USING btree (amenity);
```

---

## BLOCK 2 — Drop Duplicate Indexes from Old Sessions
# These were created by previous optimization runs and waste disk space.
# Estimated time: < 30 seconds

```sql
DROP INDEX IF EXISTS cebu_buildings_geom_geom_idx;
DROP INDEX IF EXISTS idx_cebu_buildings_geog_gist_2;

DROP INDEX IF EXISTS manila_buildings_geom_geom_idx;
DROP INDEX IF EXISTS idx_manila_buildings_geog_gist_2;

DROP INDEX IF EXISTS idx_combined_flood_hazards_geometry;
DROP INDEX IF EXISTS idx_combined_flood_hazards_geog_gist_2;

DROP INDEX IF EXISTS idx_combined_landslide_hazards_geometry;
DROP INDEX IF EXISTS idx_combined_landslide_hazards_geog_gist_2;

DROP INDEX IF EXISTS idx_combined_storm_surge_hazards_geometry;
DROP INDEX IF EXISTS idx_combined_storm_surge_hazards_geog_gist_2;

DROP INDEX IF EXISTS idx_ph_barangays_geometry;
```

---

## BLOCK 3A — Simplify Flood Hazard Geometries
# THE MAIN PERFORMANCE FIX. Run each 3A/3B/3C separately so you can track
# progress per table. pgAdmin will show "Query returned successfully" when done.
#
# combined_flood_hazards: 12 rows, avg 571,000 vertices → target ~2,000
# Estimated time: 5–15 minutes

```sql
UPDATE combined_flood_hazards
SET geometry = ST_SimplifyPreserveTopology(geometry, 0.0001)
WHERE ST_NPoints(geometry) > 1000;
```

---

## BLOCK 3B — Simplify Storm Surge Hazard Geometries
# combined_storm_surge_hazards: 48 rows, avg 210,000 vertices → target ~2,000
# Estimated time: 5–20 minutes

```sql
UPDATE combined_storm_surge_hazards
SET geometry = ST_SimplifyPreserveTopology(geometry, 0.0001)
WHERE ST_NPoints(geometry) > 1000;
```

---

## BLOCK 3C — Simplify Landslide Hazard Geometries
# combined_landslide_hazards: 4,172 rows, avg 6,600 vertices → target ~200
# Estimated time: 10–30 minutes (most rows to process)

```sql
UPDATE combined_landslide_hazards
SET geometry = ST_SimplifyPreserveTopology(geometry, 0.00005)
WHERE ST_NPoints(geometry) > 500;
```

---

## BLOCK 4 — Rebuild Indexes + VACUUM
# Run AFTER all 3A/3B/3C blocks complete.
# Rebuilds indexes on the now-simplified geometry data.
# Estimated time: 2–5 minutes

```sql
REINDEX TABLE combined_flood_hazards;
REINDEX TABLE combined_landslide_hazards;
REINDEX TABLE combined_storm_surge_hazards;

VACUUM ANALYZE combined_flood_hazards;
VACUUM ANALYZE combined_landslide_hazards;
VACUUM ANALYZE combined_storm_surge_hazards;
VACUUM ANALYZE cebu_buildings;
VACUUM ANALYZE manila_buildings;
VACUUM ANALYZE ph_barangays;
```

---

## BLOCK 5 — Verify Results (run after everything above)

```sql
-- Check new vertex counts (should be dramatically lower)
SELECT
    'combined_flood_hazards'     AS tbl,
    COUNT(*)                     AS rows,
    AVG(ST_NPoints(geometry))::int AS avg_vertices,
    MAX(ST_NPoints(geometry))    AS max_vertices
FROM combined_flood_hazards
UNION ALL
SELECT
    'combined_storm_surge_hazards',
    COUNT(*), AVG(ST_NPoints(geometry))::int, MAX(ST_NPoints(geometry))
FROM combined_storm_surge_hazards
UNION ALL
SELECT
    'combined_landslide_hazards',
    COUNT(*), AVG(ST_NPoints(geometry))::int, MAX(ST_NPoints(geometry))
FROM combined_landslide_hazards;
```

---

## Notes for Groupmates (Starting From Scratch)
# They only need to run: BLOCK 1 → BLOCK 3A → BLOCK 3B → BLOCK 3C → BLOCK 4
# Block 2 (drop duplicates) is only needed if they ran the old apply_indexes.py
# before — if they haven't done any indexing yet, skip Block 2.
