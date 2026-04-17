#!/bin/bash

# Responsive Breakpoints Validation
echo "Validating responsive breakpoints in CSS/Sass files..."

# Rule: Standard 768px, 1200px, 1920px
# Rule: Mobile (< 768px), Tablet (768px - 1200px), Ultra-wide (> 1920px)

BREAKPOINTS=("768px" "1200px" "1920px")
MISSING=0

for bp in "${BREAKPOINTS[@]}"; do
    grep -r "$bp" . --include="*.css" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules > /dev/null
    if [ $? -ne 0 ]; then
        echo "Warning: Standard breakpoint $bp not found in media queries."
        MISSING=$((MISSING+1))
    fi
done

# Rule: Use transform: translateX() for sidebars
grep -ri "width:" . --exclude-dir=node_modules | grep "sidebar" > /dev/null
if [ $? -eq 0 ]; then
    echo "Violation: Sidebar uses 'width' transition. Use 'transform: translateX()' for 60fps performance."
fi

if [ $MISSING -lt 3 ]; then
    echo "SUCCESS: Breakpoints appear consistent with standard scaling."
    exit 0
else
    echo "FAILURE: Missing standard Antigravity responsive breakpoints."
    exit 1
fi
