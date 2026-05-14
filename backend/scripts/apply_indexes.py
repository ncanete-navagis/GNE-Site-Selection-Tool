import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment.")
    sys.exit(1)

INDEX_QUERIES = [
    # 1. ph_barangays (Uses ST_Within without casting, so standard GiST is fine)
    """
    CREATE INDEX IF NOT EXISTS idx_ph_barangays_geometry_gist
    ON ph_barangays USING GIST (geometry);
    """,
    # 2. Hazards (Needs functional index on Geography cast matching SQLAlchemy)
    """
    CREATE INDEX IF NOT EXISTS idx_combined_flood_hazards_geog_gist_2
    ON combined_flood_hazards USING GIST ( CAST(geometry AS geography(GEOMETRY,-1)) );
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_combined_landslide_hazards_geog_gist_2
    ON combined_landslide_hazards USING GIST ( CAST(geometry AS geography(GEOMETRY,-1)) );
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_combined_storm_surge_hazards_geog_gist_2
    ON combined_storm_surge_hazards USING GIST ( CAST(geometry AS geography(GEOMETRY,-1)) );
    """,
    # 3. Cebu Buildings
    """
    CREATE INDEX IF NOT EXISTS idx_cebu_buildings_geog_gist_2
    ON cebu_buildings USING GIST ( CAST(geom AS geography(GEOMETRY,-1)) );
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_cebu_buildings_amenity
    ON cebu_buildings USING btree (amenity);
    """,
    # 4. Manila Buildings
    """
    CREATE INDEX IF NOT EXISTS idx_manila_buildings_geog_gist_2
    ON manila_buildings USING GIST ( CAST(geom AS geography(GEOMETRY,-1)) );
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_manila_buildings_amenity
    ON manila_buildings USING btree (amenity);
    """
]

def apply_indexes():
    print("Connecting to database to apply functional indexes...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        for query in INDEX_QUERIES:
            try:
                print(f"Executing: {query.strip().splitlines()[0]}...")
                conn.execute(text(query))
                print("Success.")
            except Exception as e:
                print(f"Error executing query: {e}")

    print("Finished applying functional indexes.")

if __name__ == "__main__":
    apply_indexes()
