import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)

tables = [
    "ph_barangays",
    "combined_flood_hazards",
    "combined_landslide_hazards",
    "combined_storm_surge_hazards",
    "cebu_buildings",
    "manila_buildings"
]

print("Running ANALYZE on spatial tables...")
# ANALYZE cannot run in a transaction block, need autocommit
with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
    for table in tables:
        print(f"Analyzing {table}...")
        conn.execute(text(f"ANALYZE {table};"))
print("Done.")
