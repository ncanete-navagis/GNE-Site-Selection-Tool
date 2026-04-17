---
trigger: on_call
---

# Rules for GIS Database Engineering & Spatial Schema

## 1. Spatial Indexing & Performance
* **Mandatory Indexing:** Table containing geometry column MUST have spatial index (e.g., GIST).
* **BBox Filtering:** Use bounding box operator (`&&`) before expensive `ST_Intersects`/`ST_Within`.
* **Clustering:** Periodically `CLUSTER` tables based on spatial indexes.

## 2. Coordinate Systems & Storage
* **WGS 84 Standard:** Store raw data in `EPSG:4326`.
* **Projected Calculations:** Use `Geography` or cast to SRID for high-precision local measurements.
* **Precision:** Limit to 9 decimal places unless scientific accuracy is required.

## 3. Schema & Migration
* **Versioned Migrations:** Handle schema changes via migration scripts (e.g., Liquibase).
* **ST_IsValid:** Ensure geometry validity before commit.
