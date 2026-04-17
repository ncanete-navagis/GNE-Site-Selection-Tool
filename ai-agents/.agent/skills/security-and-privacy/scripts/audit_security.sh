#!/bin/bash

# Security and Privacy Audit Script for Windows (PowerShell/Bash compatible via Git Bash)
echo "Auditing codebase for PII leaks and hardcoded credentials..."

VIOLATIONS=0

# Rule: No hardcoded secrets
SECRET_PATTERNS=("API_KEY =" "SECRET =" "PASSWORD =" "token =" "auth_key =")
for pattern in "${SECRET_PATTERNS[@]}"; do
    FOUND=$(grep -ri "$pattern" . --exclude-dir=.git --exclude-dir=node_modules | grep -v "scripts/")
    if [ ! -z "$FOUND" ]; then
        echo "Violation: Possible hardcoded secret found:"
        echo "$FOUND"
        VIOLATIONS=$((VIOLATIONS+1))
    fi
done

# Rule: No plain text http for sensitive data
HTTP_FOUND=$(grep -ri "http://" . --exclude-dir=.git --exclude-dir=node_modules | grep -v "scripts/")
if [ ! -z "$HTTP_FOUND" ]; then
    echo "Warning: Insecure http:// links found. Ensure this is not for sensitive APIs:"
    echo "$HTTP_FOUND"
fi

# Rule: Privacy Masking (Checking for raw coordinates in logs or code)
# Match common lat/lon decimal patterns to see if they are being output directly
# Pattern: [-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)
COORD_PATTERN="[0-9]\{1,3\}\.[0-9]\{7,15\}"
RAW_COORDS=$(grep -rE "$COORD_PATTERN" . --exclude-dir=.git --exclude-dir=node_modules | grep ".log\|.txt")
if [ ! -z "$RAW_COORDS" ]; then
    echo "Warning: Possible raw high-precision coordinates found in logs/text files. Check PII jittering rules."
    echo "$RAW_COORDS"
fi

if [ $VIOLATIONS -eq 0 ]; then
    echo "SUCCESS: No insecure patterns or exposed secrets detected (basic scan)."
    exit 0
else
    echo "FAILURE: Found $VIOLATIONS security violations."
    exit 1
fi
