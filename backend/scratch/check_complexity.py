import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)

tables = [
    "combined_flood_hazards",
    "combined_landslide_hazards",
    "combined_storm_surge_hazards"
]

print(f"{'Table':<30} {'Rows':>10} {'Avg Vertices':>15}")
print("-" * 60)

with engine.connect() as conn:
    for table in tables:
        # Count rows
        count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
        
        # Average number of points in geometry
        avg_points = conn.execute(text(f"SELECT AVG(ST_NPoints(geometry)) FROM {table}")).scalar()
        
        print(f"{table:<30} {count:>10} {avg_points:>15.2f}")
