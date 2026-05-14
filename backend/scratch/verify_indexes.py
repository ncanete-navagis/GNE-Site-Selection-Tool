import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)

expected_indexes = [
    "idx_ph_barangays_geometry_gist",
    "idx_combined_flood_hazards_geometry_gist",
    "idx_combined_landslide_hazards_geometry_gist",
    "idx_combined_storm_surge_hazards_geometry_gist",
    "idx_cebu_buildings_geom_gist",
    "idx_cebu_buildings_amenity",
    "idx_manila_buildings_geom_gist",
    "idx_manila_buildings_amenity"
]

with engine.connect() as conn:
    res = conn.execute(text("SELECT indexname FROM pg_indexes;"))
    db_indexes = [row[0] for row in res]

print("Index Verification Report:")
print("-" * 30)
all_good = True
for idx in expected_indexes:
    if idx in db_indexes:
        print(f"[OK] {idx} exists.")
    else:
        print(f"[MISSING] {idx} is not found!")
        all_good = False

if all_good:
    print("\nAll expected indexes have been successfully created in the database.")
else:
    print("\nSome indexes are missing.")
