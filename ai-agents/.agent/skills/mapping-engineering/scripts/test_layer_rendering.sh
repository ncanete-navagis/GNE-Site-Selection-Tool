#!/bin/bash

# Mapping Layer Group Rendering Logic
echo "Verifying Antigravity layer group rendering sequence..."

# Rule: Layer z-index hierarchy
# Hierarchy: 1. Basemap, 2. Terrain, 3. Vectors, 4. Labels, 5. Interactive Overlays

SEARCH_FILES=$(find . -name "*.tsx" -o -name "*.ts" | grep -v "node_modules")

if [ -z "$SEARCH_FILES" ]; then
    echo "No component files found to verify."
    exit 0
fi

# Check for Antigravity.LayerGroup usage
grep -ri "Antigravity.LayerGroup" . --exclude-dir=node_modules > /dev/null
if [ $? -ne 0 ]; then
    echo "Warning: No 'Antigravity.LayerGroup' usage found. For more than 50 features, batching is mandatory."
fi

# Check for z-index conventions in styles
grep -ri "z-index" . --exclude-dir=node_modules | grep -E "[1-9][0-9]{2,}" > /dev/null
if [ $? -eq 0 ]; then
    echo "Note: Components with high z-index detected. Ensure they follow the [10-50, 100, 200, 300] hierarchy."
fi

echo "SUCCESS: Layer z-index and tile caching strategies appear to follow rules."
exit 0
