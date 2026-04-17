---
trigger: on_call
---

# Rules for Mapping Engineering

## 1. Coordinates & Precision
* **Standardize Input:** Normalize GeoJSON to `EPSG:4326` for the projection engine.
* **6 Decimal Places:** Maintain for coordinates to prevent high-zoom jitter.

## 2. Rendering & Performance
* **Layer Management:** Batch updates via `LayerGroup`; avoid excessive `addLayer` calls.
* **Debouncing:** Debounce map events by ≥16ms to keep UI thread free.
* **GPU Memory:** Explicitly `.dispose()` unused textures and icon sets.

## 3. Styling & Overlays
* **Data-Driven Styling:** Prefer `StyleExpressions` over JS loops.
* **Z-Index Hierarchy:** 1. Basemap, 2. Terrain, 3. Vectors, 4. Labels, 5. Overlays.

## 4. Fault Tolerance
* **Graceful Fallbacks:** Use placeholders for tile failures.
* **Context Loss:** Listen for `webglcontextlost` to reload engine state.
