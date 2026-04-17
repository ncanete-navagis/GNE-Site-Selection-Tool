---
name: spatial-database-management
description: Optimizes spatial queries and manages data lifecycle.
---

# Spatial Database Management Skill
Design, implement, and optimize the data layer that powers Google Antigravity applications.

## 🎯 Steps
1. **Index:** Implement GIST/SP-GIST indexes for geospatial tables.
2. **Audit:** Run `./scripts/check_db_health.sh` and `./scripts/sql_linter.py` to verify environment and schema.
3. **Analyze:** Execute `./scripts/run_query.py` or `./scripts/naming_convention_check.py` to optimize or validate SQL.

## 📋 Requirements
* Store raw data in `EPSG:4326` (WGS 84).
* Bounding box filtering (`&&`) must precede expensive operations like `ST_Intersects`.
* Implement `ST_IsValid` checks for all incoming geometries.
