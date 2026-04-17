import sys
import os
import re

def validate_crs(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return False

    print(f"Checking CRS/SRID in: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Rules: EPSG:4326 or WGS 84
    # We look for common spatial keywords
    spatial_keywords = ["crs", "srid", "geometry", "geography", "projection"]
    found_spatial = any(kw in content.lower() for kw in spatial_keywords)
    
    if not found_spatial:
        print("Note: No obvious spatial keywords found in file.")
        return True

    # Search for SRID definitions
    # Regex for SRID:4326, EPSG:4326, "srid": 4326, etc.
    valid_patterns = [
        r"4326",
        r"WGS\s*84",
        r"EPSG:4326",
        r"SRID=4326"
    ]
    
    invalid_patterns = [
        r"SRID[:=]\s*(?!4326)\d+",
        r"EPSG[:=]\s*(?!4326)\d+",
        r"3857", # Web Mercator is common but forbidden as storage standard
    ]
    
    # Check for valid patterns
    is_valid = any(re.search(p, content, re.IGNORECASE) for p in valid_patterns)
    
    # Check for invalid projections
    invalid_matches = []
    for p in invalid_patterns:
        matches = re.findall(p, content, re.IGNORECASE)
        if matches:
            invalid_matches.extend(matches)
            
    if invalid_matches:
        print(f"FAILURE: Found non-WGS84 projections: {set(invalid_matches)}")
        return False
    
    if is_valid:
        print("SUCCESS: Data is correctly projected in EPSG:4326 (WGS 84).")
        return True
    else:
        print("WARNING: Spatial keywords found but no explicit WGS 84 / EPSG:4326 signature detected.")
        return True # Soft warning

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_crs.py <file_path>")
        sys.exit(1)
    
    if not validate_crs(sys.argv[1]):
        sys.exit(1)
