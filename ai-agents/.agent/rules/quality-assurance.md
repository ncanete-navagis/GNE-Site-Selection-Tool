# Rules for QA Auditing & Test Execution

## 1. Spatial & API Testing
* **Edge Cases:** Test spatial APIs against extreme bounds (±90 Lat, ±180 Lon) and empty/null geometries.
* **Integrity:** Assert coordinate precision remains intact through backend processing.
* **API Validation:** Verify status codes, schema compliance, and response times (<200ms).

## 2. Test Hierarchy
* **Unit Tests:** Pure functions (e.g., calculations, formatting).
* **E2E Tests:** Simulate user behavior; markers, sidebar, and focus traps.
* **Regression:** Verify `dispose()` calls and pixel-match rendering consistency.

## 3. Standards & Reporting
* **Clear Assertions:** Every test must have a descriptive `it` block.
* **Failure Logs:** Output input data on failure to facilitate debugging.
