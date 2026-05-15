"""
scripts/optimize_db.py — Full database optimization script.

Run this ONCE to:
  1. Create all spatial indexes (safe — uses IF NOT EXISTS)
  2. Drop duplicate/redundant indexes from previous sessions
  3. Simplify massive hazard geometries (the main bottleneck)
  4. VACUUM ANALYZE all affected tables

Expected speedup: ~50–200x on the analysis pipeline
  Before:  30–58 seconds per analysis
  After:   ~500ms per analysis (DB portion)

Usage:
    cd backend/
    python scripts/optimize_db.py

Requirements:
    - DATABASE_URL set in backend/.env
    - psycopg2-binary installed (pip install psycopg2-binary)
    - PostGIS enabled on the database
    - ~5–15 minutes to run (geometry simplification is slow once,
      but makes every future query fast)
"""

import os
import sys
import time
import psycopg2
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    print("❌  ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

# Convert asyncpg URL to plain psycopg2 DSN
DSN = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


# ---------------------------------------------------------------------------
# Step definitions
# ---------------------------------------------------------------------------

STEP_1_INDEXES = [
    # ── ph_barangays ─────────────────────────────────────────────────────────
    ("idx_ph_barangays_geometry_gist",
     "CREATE INDEX IF NOT EXISTS idx_ph_barangays_geometry_gist "
     "ON ph_barangays USING GIST (geometry);"),

    # ── combined_flood_hazards ───────────────────────────────────────────────
    ("idx_combined_flood_hazards_geometry_gist",
     "CREATE INDEX IF NOT EXISTS idx_combined_flood_hazards_geometry_gist "
     "ON combined_flood_hazards USING GIST (geometry);"),
    ("idx_combined_flood_hazards_geog_gist",
     "CREATE INDEX IF NOT EXISTS idx_combined_flood_hazards_geog_gist "
     "ON combined_flood_hazards USING GIST ((geometry::geography));"),

    # ── combined_landslide_hazards ───────────────────────────────────────────
    ("idx_combined_landslide_hazards_geometry_gist",
     "CREATE INDEX IF NOT EXISTS idx_combined_landslide_hazards_geometry_gist "
     "ON combined_landslide_hazards USING GIST (geometry);"),
    ("idx_combined_landslide_hazards_geog_gist",
     "CREATE INDEX IF NOT EXISTS idx_combined_landslide_hazards_geog_gist "
     "ON combined_landslide_hazards USING GIST ((geometry::geography));"),

    # ── combined_storm_surge_hazards ─────────────────────────────────────────
    ("idx_combined_storm_surge_hazards_geometry_gist",
     "CREATE INDEX IF NOT EXISTS idx_combined_storm_surge_hazards_geometry_gist "
     "ON combined_storm_surge_hazards USING GIST (geometry);"),
    ("idx_combined_storm_surge_hazards_geog_gist",
     "CREATE INDEX IF NOT EXISTS idx_combined_storm_surge_hazards_geog_gist "
     "ON combined_storm_surge_hazards USING GIST ((geometry::geography));"),

    # ── cebu_buildings ───────────────────────────────────────────────────────
    ("idx_cebu_buildings_geom_gist",
     "CREATE INDEX IF NOT EXISTS idx_cebu_buildings_geom_gist "
     "ON cebu_buildings USING GIST (geom);"),
    ("idx_cebu_buildings_geog_gist",
     "CREATE INDEX IF NOT EXISTS idx_cebu_buildings_geog_gist "
     "ON cebu_buildings USING GIST ((geom::geography));"),
    ("idx_cebu_buildings_amenity",
     "CREATE INDEX IF NOT EXISTS idx_cebu_buildings_amenity "
     "ON cebu_buildings USING btree (amenity);"),

    # ── manila_buildings ─────────────────────────────────────────────────────
    ("idx_manila_buildings_geom_gist",
     "CREATE INDEX IF NOT EXISTS idx_manila_buildings_geom_gist "
     "ON manila_buildings USING GIST (geom);"),
    ("idx_manila_buildings_geog_gist",
     "CREATE INDEX IF NOT EXISTS idx_manila_buildings_geog_gist "
     "ON manila_buildings USING GIST ((geom::geography));"),
    ("idx_manila_buildings_amenity",
     "CREATE INDEX IF NOT EXISTS idx_manila_buildings_amenity "
     "ON manila_buildings USING btree (amenity);"),
]

# Indexes that were created by old/duplicate optimization sessions.
# We keep ONE geometry index + ONE geography index per table.
STEP_2_DROP_DUPLICATES = [
    # cebu_buildings — keep idx_cebu_buildings_geog_gist + idx_cebu_buildings_geom_gist
    "DROP INDEX IF EXISTS cebu_buildings_geom_geom_idx;",
    "DROP INDEX IF EXISTS idx_cebu_buildings_geog_gist_2;",

    # manila_buildings — keep idx_manila_buildings_geog_gist + idx_manila_buildings_geom_gist
    "DROP INDEX IF EXISTS manila_buildings_geom_geom_idx;",
    "DROP INDEX IF EXISTS idx_manila_buildings_geog_gist_2;",

    # combined_flood_hazards — keep _geometry_gist + _geog_gist
    "DROP INDEX IF EXISTS idx_combined_flood_hazards_geometry;",
    "DROP INDEX IF EXISTS idx_combined_flood_hazards_geog_gist_2;",

    # combined_landslide_hazards — keep _geometry_gist + _geog_gist
    "DROP INDEX IF EXISTS idx_combined_landslide_hazards_geometry;",
    "DROP INDEX IF EXISTS idx_combined_landslide_hazards_geog_gist_2;",

    # combined_storm_surge_hazards — keep _geometry_gist + _geog_gist
    "DROP INDEX IF EXISTS idx_combined_storm_surge_hazards_geometry;",
    "DROP INDEX IF EXISTS idx_combined_storm_surge_hazards_geog_gist_2;",

    # ph_barangays — keep idx_ph_barangays_geometry_gist
    "DROP INDEX IF EXISTS idx_ph_barangays_geometry;",
]

# Geometry simplification — the main performance fix.
# ST_SimplifyPreserveTopology reduces vertex counts by 95-99% at tolerances
# that are imperceptible at the 500m search radius used by the analysis.
STEP_3_SIMPLIFY = [
    # Flood: 12 rows, avg 571k vertices → target ~2k vertices
    ("combined_flood_hazards",
     """UPDATE combined_flood_hazards
        SET geometry = ST_SimplifyPreserveTopology(geometry, 0.0001)
        WHERE ST_NPoints(geometry) > 1000;"""),

    # Storm surge: 48 rows, avg 210k vertices → target ~2k vertices
    ("combined_storm_surge_hazards",
     """UPDATE combined_storm_surge_hazards
        SET geometry = ST_SimplifyPreserveTopology(geometry, 0.0001)
        WHERE ST_NPoints(geometry) > 1000;"""),

    # Landslide: 4172 rows, avg 6.6k vertices → target ~200 vertices
    ("combined_landslide_hazards",
     """UPDATE combined_landslide_hazards
        SET geometry = ST_SimplifyPreserveTopology(geometry, 0.00005)
        WHERE ST_NPoints(geometry) > 500;"""),
]

STEP_4_REINDEX_VACUUM = [
    "REINDEX TABLE combined_flood_hazards;",
    "REINDEX TABLE combined_landslide_hazards;",
    "REINDEX TABLE combined_storm_surge_hazards;",
    "VACUUM ANALYZE combined_flood_hazards;",
    "VACUUM ANALYZE combined_landslide_hazards;",
    "VACUUM ANALYZE combined_storm_surge_hazards;",
    "VACUUM ANALYZE cebu_buildings;",
    "VACUUM ANALYZE manila_buildings;",
    "VACUUM ANALYZE ph_barangays;",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def section(title: str):
    print(f"\n{'─'*60}")
    print(f"  {title}")
    print(f"{'─'*60}")


def run_sql(cur, sql: str, label: str = ""):
    t0 = time.perf_counter()
    cur.execute(sql)
    elapsed = time.perf_counter() - t0
    tag = f"[{label}] " if label else ""
    print(f"  ✅  {tag}done in {elapsed:.1f}s")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("\n🚀  GNE Database Optimization Script")
    print(f"    DSN: {DSN[:40]}...")
    print("\n⚠️   This script modifies geometry data. It is safe to re-run.")
    print("    Estimated time: 5–15 minutes depending on server speed.\n")

    conn = psycopg2.connect(DSN)
    conn.autocommit = True      # DDL + VACUUM need autocommit
    cur = conn.cursor()

    # ── STEP 1: Create indexes ────────────────────────────────────────────
    section("STEP 1 / 4 — Creating spatial indexes (IF NOT EXISTS)")
    for name, sql in STEP_1_INDEXES:
        print(f"  ⏳  {name}")
        run_sql(cur, sql, name)

    # ── STEP 2: Drop duplicate indexes ───────────────────────────────────
    section("STEP 2 / 4 — Dropping duplicate indexes from old sessions")
    for sql in STEP_2_DROP_DUPLICATES:
        idx_name = sql.split("IF EXISTS ")[-1].rstrip(";")
        print(f"  ⏳  {idx_name}")
        run_sql(cur, sql, idx_name)

    # ── STEP 3: Simplify geometries ───────────────────────────────────────
    section("STEP 3 / 4 — Simplifying hazard geometries (MAIN FIX)")
    print("  ⚠️   This is the slowest step. Expect 2–10 min per table.\n")
    for table, sql in STEP_3_SIMPLIFY:
        print(f"  ⏳  Simplifying {table} ...")
        t0 = time.perf_counter()
        cur.execute(sql)
        elapsed = time.perf_counter() - t0
        # Report new vertex counts
        cur.execute(
            f"SELECT COUNT(*), AVG(ST_NPoints(geometry))::int, MAX(ST_NPoints(geometry)) "
            f"FROM {table};"
        )
        rows, avg_v, max_v = cur.fetchone()
        print(f"  ✅  {table} done in {elapsed:.1f}s")
        print(f"      Rows={rows} | Avg vertices={avg_v:,} | Max vertices={max_v:,}")

    # ── STEP 4: Rebuild indexes + VACUUM ─────────────────────────────────
    section("STEP 4 / 4 — Rebuilding indexes + VACUUM ANALYZE")
    for sql in STEP_4_REINDEX_VACUUM:
        label = sql.split()[-1].rstrip(";")
        print(f"  ⏳  {sql.strip()[:55]}")
        run_sql(cur, sql, label)

    cur.close()
    conn.close()

    print("\n" + "═"*60)
    print("  ✅  OPTIMIZATION COMPLETE")
    print("═"*60)
    print("\n  Expected results:")
    print("    • Analysis pipeline: 30–58s  →  ~0.5–2s")
    print("    • Hazard queries:    3–16s   →  <100ms each")
    print("    • Index count per table: cleaned up to 2 (geom + geog)")
    print("\n  Run scratch/verify_indexes.py to confirm index state.")
    print()


if __name__ == "__main__":
    main()
