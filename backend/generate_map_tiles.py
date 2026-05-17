import os
import math
import time
import numpy as np
from scipy.ndimage import gaussian_filter
from PIL import Image

# Import the existing heatmap service
from services.HeatmapsService import HeatmapsService

FRONTEND_TILES_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "assets", "MapTiles")

def lat_lng_to_pixel(lat, lng, zoom):
    """Convert lat/lng to Slippy Map tile and pixel coordinates."""
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    x = ((lng + 180.0) / 360.0 * n)
    y = ((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    
    xtile = int(x)
    ytile = int(y)
    
    pixel_x = int((x - xtile) * 256)
    pixel_y = int((y - ytile) * 256)
    
    return xtile, ytile, pixel_x, pixel_y

def color_map(normalized_intensity):
    """
    Map a 0-1 intensity to an RGBA tuple.
    Blue -> Green -> Yellow -> Red
    0 intensity = fully transparent
    """
    if normalized_intensity <= 0.05:
        return (0, 0, 0, 0)
    
    # Simple segmented colormap (Transparent -> Yellow -> Orange -> Red)
    if normalized_intensity < 0.33:
        # Yellowish
        r, g, b = 255, 255, 0
        a = int(normalized_intensity * 3 * 255)
    elif normalized_intensity < 0.66:
        # Orangeish
        r, g, b = 255, 165, 0
        a = 255
    else:
        # Redish
        r, g, b = 255, 0, 0
        a = 255
        
    return (r, g, b, min(255, max(0, a)))

def generate_tiles():
    print("Fetching highest resolution data from Google Places (via HeatmapsService)...")
    # Fetch with high zoom level to get a dense grid of restaurants
    dataset = HeatmapsService.generate_heatmap(zoom_level=14)
    points = dataset.get("data", [])
    
    if not points:
        print("No data points found! Ensure your GOOGLE_API_KEY is correct.")
        return
        
    print(f"Acquired {len(points)} grid points. Starting tile generation...")

    # Define the zoom levels to pre-generate
    zooms = range(10, 19)

    for zoom in zooms:
        print(f"--- Processing Zoom Level {zoom} ---")
        tiles = {}
        
        # Accumulate weights into tile arrays
        for point in points:
            lat = point["lat"]
            lng = point["lng"]
            weight = point["weight"]
            
            xtile, ytile, px, py = lat_lng_to_pixel(lat, lng, zoom)
            tile_key = (xtile, ytile)
            
            if tile_key not in tiles:
                tiles[tile_key] = np.zeros((256, 256), dtype=float)
            
            # Add weight. We draw a small 3x3 block to give it initial mass before blur
            for dy in range(-1, 2):
                for dx in range(-1, 2):
                    ny, nx = py + dy, px + dx
                    if 0 <= ny < 256 and 0 <= nx < 256:
                        tiles[tile_key][ny, nx] += weight
        
        if not tiles:
            continue
            
        for (xtile, ytile), grid in tiles.items():
            # Apply Gaussian Blur (larger sigma for lower zooms to merge blobs)
            sigma = 8 if zoom <= 13 else 12
            blurred = gaussian_filter(grid, sigma=sigma)
            
            # Renormalize after blur
            local_max = np.max(blurred)
            if local_max > 0:
                blurred = blurred / local_max
                # Apply a non-linear scaling (e.g., square root) to boost lower intensities slightly
                blurred = np.sqrt(blurred)
            
            # Create RGBA image
            img_data = np.zeros((256, 256, 4), dtype=np.uint8)
            for y in range(256):
                for x in range(256):
                    intensity = blurred[y, x]
                    img_data[y, x] = color_map(intensity)
            
            img = Image.fromarray(img_data, 'RGBA')
            
            # Save
            tile_dir = os.path.join(FRONTEND_TILES_DIR, str(zoom), str(xtile))
            os.makedirs(tile_dir, exist_ok=True)
            
            tile_path = os.path.join(tile_dir, f"{ytile}.png")
            img.save(tile_path)
            
        print(f"Generated {len(tiles)} tiles for zoom {zoom}")

if __name__ == "__main__":
    generate_tiles()
    print("Tile generation complete!")
