import geopandas as gpd
import pandas as pd
from sqlalchemy import create_engine
import json
from shapely.geometry import shape
from geoalchemy2 import Geometry

# 1. Database connection
engine = create_engine('postgresql://postgres:123@localhost:5432/gne_db')

# 2. Load the data 
file_path = r"C:\Users\benso\Downloads\Props_Area_Matched_Polygons.xlsx"

try:
    df = pd.read_excel(file_path)

    # --- NEW ADDITION START ---
    # 3. Convert Polygon strings to actual Shapely Polygon geometries
    # This parses the GeoJSON string in the 'random_shape_polygon' column
    def parse_polygon(poly_str):
        if pd.isna(poly_str):
            return None
        try:
            # Parse the string as JSON and convert to a shapely shape
            return shape(json.loads(poly_str))
        except Exception:
            return None

    df['random_shape_polygon'] = df['random_shape_polygon'].apply(parse_polygon)
    # --- NEW ADDITION END ---

    # 4. Create a GeoDataFrame (Sets the Point as the primary active geometry)
    gdf = gpd.GeoDataFrame(
        df, 
        geometry=gpd.points_from_xy(df['long'], df['lat']),
        crs="EPSG:4326"
    )

    # 5. Clean up column names (PostgreSQL/PostGIS standard)
    gdf.columns = [c.lower().replace(' ', '_') for c in gdf.columns]

    # --- NEW ADDITION START ---
    # 6. Define spatial types for PostGIS
    # We must explicitly tell PostGIS that 'random_shape_polygon' is a Polygon geometry.
    # (The primary 'geometry' column created by points_from_xy is handled automatically)
    custom_dtypes = {
        'random_shape_polygon': Geometry('POLYGON', srid=4326)
    }
    # --- NEW ADDITION END ---

    # 7. Import into PostGIS
    # Notice the added dtype parameter
    gdf.to_postgis(
        "cebu_properties", 
        engine, 
        if_exists="replace", 
        index=False,
        dtype=custom_dtypes 
    )
    
    print("--------------------------------------------------")
    print("SUCCESS: Spatial data (Points and Polygons) imported into 'cebu_properties' table.")
    print("--------------------------------------------------")

except FileNotFoundError:
    print(f"Error: The file was not found at {file_path}. Check the path.")
except Exception as e:
    print(f"An error occurred: {e}")