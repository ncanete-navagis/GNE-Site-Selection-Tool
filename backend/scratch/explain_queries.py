"""
scratch/explain_queries.py — EXPLAIN ANALYZE all slow spatial queries.
Run: python scratch/explain_queries.py
"""
import os, sys
import psycopg2
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL', '')
# Convert asyncpg URL to psycopg2 DSN
dsn = DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://')

conn = psycopg2.connect(dsn)
cur = conn.cursor()

LON, LAT, RADIUS = 123.9042, 10.3157, 500

queries = [
    ("cebu_buildings ST_DWithin (geography cast)", f"""
        EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
        SELECT COUNT(*) FROM cebu_buildings
        WHERE ST_DWithin(
            geom::geography,
            ST_SetSRID(ST_MakePoint({LON}, {LAT}), 4326)::geography,
            {RADIUS}
        ) AND amenity IN ('restaurant','cafe','fast_food','bar','pub','food_court','biergarten','ice_cream','juice_bar')
    """),
    ("combined_flood_hazards ST_DWithin (geography cast)", f"""
        EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
        SELECT COUNT(*) FROM combined_flood_hazards
        WHERE ST_DWithin(
            geometry::geography,
            ST_SetSRID(ST_MakePoint({LON}, {LAT}), 4326)::geography,
            {RADIUS}
        )
    """),
    ("combined_landslide_hazards ST_DWithin (geography cast)", f"""
        EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
        SELECT COUNT(*) FROM combined_landslide_hazards
        WHERE ST_DWithin(
            geometry::geography,
            ST_SetSRID(ST_MakePoint({LON}, {LAT}), 4326)::geography,
            {RADIUS}
        )
    """),
    ("combined_storm_surge_hazards ST_DWithin (geography cast)", f"""
        EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
        SELECT COUNT(*) FROM combined_storm_surge_hazards
        WHERE ST_DWithin(
            geometry::geography,
            ST_SetSRID(ST_MakePoint({LON}, {LAT}), 4326)::geography,
            {RADIUS}
        )
    """),
    ("ph_barangays ST_Within", f"""
        EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
        SELECT COUNT(*) FROM ph_barangays
        WHERE ST_Within(
            ST_SetSRID(ST_MakePoint({LON}, {LAT}), 4326),
            geometry
        )
    """),
    ("CHECK indexes on spatial tables", """
        SELECT
            t.relname AS table_name,
            i.relname AS index_name,
            ix.indisunique AS is_unique,
            am.amname AS index_type,
            pg_size_pretty(pg_relation_size(i.oid)) AS index_size
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_am am ON am.oid = i.relam
        WHERE t.relname IN (
            'cebu_buildings','manila_buildings',
            'combined_flood_hazards','combined_landslide_hazards','combined_storm_surge_hazards',
            'ph_barangays'
        )
        ORDER BY t.relname, i.relname
    """),
    ("CHECK functional geography indexes", """
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename IN (
            'cebu_buildings','manila_buildings',
            'combined_flood_hazards','combined_landslide_hazards','combined_storm_surge_hazards',
            'ph_barangays'
        )
        ORDER BY tablename, indexname
    """),
    ("ST_NPoints geometry complexity", """
        SELECT
            'combined_flood_hazards' AS tbl,
            COUNT(*) AS rows,
            AVG(ST_NPoints(geometry))::int AS avg_vertices,
            MAX(ST_NPoints(geometry)) AS max_vertices
        FROM combined_flood_hazards
        UNION ALL
        SELECT
            'combined_landslide_hazards',
            COUNT(*), AVG(ST_NPoints(geometry))::int, MAX(ST_NPoints(geometry))
        FROM combined_landslide_hazards
        UNION ALL
        SELECT
            'combined_storm_surge_hazards',
            COUNT(*), AVG(ST_NPoints(geometry))::int, MAX(ST_NPoints(geometry))
        FROM combined_storm_surge_hazards
    """),
]

for label, sql in queries:
    print(f"\n{'='*70}")
    print(f"QUERY: {label}")
    print('='*70)
    cur.execute(sql.strip())
    rows = cur.fetchall()
    for row in rows:
        print(row[0] if isinstance(row[0], str) and len(row) == 1 else "  |  ".join(str(c) for c in row))

cur.close()
conn.close()
