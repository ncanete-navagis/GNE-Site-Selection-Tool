import os
import sys

def lint_architecture(src_path):
    if not os.path.exists(src_path):
        print(f"Error: src path not found at {src_path}")
        return False

    print(f"Linting Atomic Design architecture in: {src_path}")
    
    # Rule: Atomic Hierarchy Standards (Atoms, Molecules, Organisms)
    required_folders = ["Atoms", "Molecules", "Organisms"]
    found_folders = []
    
    for root, dirs, files in os.walk(src_path):
        for d in dirs:
            if d in required_folders:
                found_folders.append(d)
                
    missing = set(required_folders) - set(found_folders)
    if missing:
        print(f"Warning: Missing standard Atomic Design directories: {missing}")
    
    # Rule: Component Implementation (Each component has its own folder)
    # Check for folders containing index.tsx but missing styles or tests
    errors = 0
    for root, dirs, files in os.walk(src_path):
        if "index.tsx" in files:
            # Check for styles
            styles_found = any(f.endswith(".styles.ts") or f.endswith(".styles.tsx") for f in files)
            if not styles_found:
                print(f"Violation: Component at {root} is missing a .styles.ts file.")
                errors += 1
            
            # Check for tests (Strict rule: Each component must have its own folder containing index, styles, test)
            test_found = any(".test." in f for f in files)
            if not test_found:
                print(f"Violation: Component at {root} is missing a .test file.")
                errors += 1

    if errors == 0:
        print("SUCCESS: Component hierarchy follows Reactor Atomic Design standards.")
        return True
    else:
        print(f"FAILURE: Found {errors} architectural violations.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Default to src directory if exists
        src_path = "src" if os.path.exists("src") else "."
    else:
        src_path = sys.argv[1]
    
    if not lint_architecture(src_path):
        sys.exit(1)
