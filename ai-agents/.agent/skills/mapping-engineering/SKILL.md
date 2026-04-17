---
name: mapping-engineering
description: Translates spatial queries into performant, interactive, and visually stunning web maps.
---

# Mapping Engineering Skill
Translates spatial queries into performant, interactive, and visually stunning web maps.

## 🎯 Steps
1. **Render:** Batch updates using `Antigravity.LayerGroup` for complex scenes.
2. **Interact:** Run `./scripts/test_layer_rendering.sh` to verify visual layering.
3. **Optimize:** Throttle canvas rendering and offload heavy calculations to Web Workers.

## 📋 Requirements
* Normalize all external GeoJSON to `EPSG:4326` before projection.
* Maintain 6 decimal places for coordinate precision to prevent jitter.
* Explicitly `.dispose()` of unused textures or custom icon sets.
