import sys
import json
import re

def validate_contract(openapi_path):
    print(f"Validating API contract: {openapi_path}")
    
    try:
        with open(openapi_path, 'r') as f:
            spec = json.load(f)
    except Exception as e:
        print(f"Error: Could not parse OpenAPI spec: {e}")
        return False

    errors = 0
    
    # Rule: Versioned Endpoints (/v1, /v2, etc.)
    paths = spec.get("paths", {})
    if not paths:
        print("Warning: No paths found in OpenAPI spec.")
    
    for path in paths:
        if not re.match(r'^/v\d+/', path):
            print(f"Violation: Path '{path}' is not versioned (e.g., /v1/...).")
            errors += 1
            
    # Rule: Appropriate Methods (Check for common spatial endpoints)
    # Rule: Status Codes (400, 422, 413)
    for path, methods in paths.items():
        for method, details in methods.items():
            responses = details.get("responses", {})
            required_codes = ["400", "422", "413"]
            for code in required_codes:
                if code not in responses:
                    print(f"Violation: Path {path} ({method}) missing required status code: {code}")
                    errors += 1
                    
            # Check for spatial parameters
            parameters = details.get("parameters", [])
            for param in parameters:
                name = param.get("name", "").lower()
                if name in ["lat", "lon", "latitude", "longitude"]:
                    description = param.get("description", "").lower()
                    if "4326" not in description and "wgs" not in description:
                        print(f"Warning: Spatial parameter '{name}' in path {path} does not explicitly mention EPSG:4326/WGS84.")

    if errors == 0:
        print("SUCCESS: Contract follows Antigravity versioning and DTO standards.")
        return True
    else:
        print(f"FAILURE: Found {errors} contract violations.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_contract.py <openapi_json_path>")
        sys.exit(1)
    
    if not validate_contract(sys.argv[1]):
        sys.exit(1)
