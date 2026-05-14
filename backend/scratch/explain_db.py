import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)

query = """
EXPLAIN ANALYZE
SELECT *
FROM combined_flood_hazards
WHERE ST_DWithin(
    CAST(combined_flood_hazards.geometry AS geography(GEOMETRY,-1)),
    CAST(ST_SetSRID(ST_MakePoint(123.922202522068, 10.3552359393416), 4326) AS geography(GEOMETRY,-1)),
    250.0
);
"""

print("Running EXPLAIN ANALYZE...")
with engine.connect() as conn:
    res = conn.execute(text(query))
    for row in res:
        print(row[0])
