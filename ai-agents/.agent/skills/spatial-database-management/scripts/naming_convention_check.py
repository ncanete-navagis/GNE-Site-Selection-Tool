import sys
import os

def check_naming(sql_content):
    print("Checking SQL naming conventions and standards...")
    
    issues = []
    # Rule: SRID Enforcement
    if "SRID" not in sql_content.upper():
        issues.append("Violation: No SRID explicit definition found in SQL.")
    
    # Rule: Spatial Indexing (GIST)
    if "INDEX" in sql_content.upper() and "GIST" not in sql_content.upper():
        issues.append("Warning: Index found but GIST not detected. Use GIST for spatial indexes.")
        
    # Rule: Precision Casting (Avoid > 9 decimal places)
    if re.search(r'\.[0-9]{10,}', sql_content):
        issues.append("Violation: Excess coordinate precision detected (> 9 decimals).")

    if not issues:
        print("SUCCESS: Naming conventions and spatial standards followed.")
        return True
    else:
        for issue in issues:
            print(issue)
        return False

if __name__ == "__main__":
    import re
    if len(sys.argv) < 2:
        sys.exit(1)
    with open(sys.argv[1], 'r') as f:
        check_naming(f.read())