---
name: geospatial-data-modeling
description: Designs scalable schemas and infrastructure for spatial data.
---

# Geospatial Data Modeling Skill
Designs robust architectural patterns for multi-dimensional spatial data and high-frequency streams.

## 🎯 Steps
1. **Model:** Define vector and raster storage strategies based on use case.
2. **Project:** Run `./scripts/validate_crs.py` to verify coordinate reference systems.
3. **Pipeline:** Orchestrate data ingestion flows from raw sensors to interactive maps.

## 📋 Requirements
* Ensure coordinate precision (6 decimal places minimum for JS, 9 for DB).
* Maintain topological integrity across transformations.
* Document SRID/CRS for all spatial collections.
