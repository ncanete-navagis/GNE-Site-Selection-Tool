import sys
import os
import re
import json

def check_design_tokens(css_path, brand_tokens_path="brand_constants.json"):
    if not os.path.exists(css_path):
        print(f"Error: CSS file not found at {css_path}")
        return False

    print(f"Scanning for magic numbers in: {css_path}")
    
    tokens = {}
    if os.path.exists(brand_tokens_path):
        try:
            with open(brand_tokens_path, 'r') as f:
                tokens = json.load(f)
            print(f"Loaded tokens from {brand_tokens_path}")
        except Exception as e:
            print(f"Warning: Could not parse {brand_tokens_path}: {e}")
    else:
        print(f"Warning: {brand_tokens_path} not found. Script will flag all hardcoded values.")

    with open(css_path, 'r') as f:
        content = f.read()

    # Rule: No Magic Numbers (Hex codes, hardcoded pixels)
    # Regex for hex codes: #[a-fA-F0-9]{3,6}
    # Regex for px: \d+px
    
    hex_pattern = r'#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\b'
    px_pattern = r'\b\d+px\b'
    
    hex_matches = re.finditer(hex_pattern, content)
    px_matches = re.finditer(px_pattern, content)
    
    violations = 0
    
    # Check Hex Codes
    for match in hex_matches:
        hex_val = match.group(0).upper()
        # If we have tokens, check if this hex is allowed
        # (This is simplified; real tokens might map names to hexes)
        found = False
        for k, v in tokens.items():
            if str(v).upper() == hex_val:
                found = True
                break
        
        if not found:
            print(f"Violation: Hardcoded hex code found: {hex_val}")
            violations += 1

    # Check hardcoded pixels
    for match in px_matches:
        px_val = match.group(0)
        # Usually 0px is fine, or simple 1px borders sometimes, but rules say "No magic numbers"
        if px_val != "0px":
            print(f"Violation: Hardcoded pixel value found: {px_val}. Use SystemTokens instead.")
            violations += 1

    if violations == 0:
        print("SUCCESS: All styles correctly reference brand tokens.")
        return True
    else:
        print(f"FAILURE: Found {violations} design token violations.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_design_tokens.py <css_path> [brand_tokens_path]")
        sys.exit(1)
    
    css_file = sys.argv[1]
    tokens_file = sys.argv[2] if len(sys.argv) > 2 else "brand_constants.json"
    
    if not check_design_tokens(css_file, tokens_file):
        sys.exit(1)
