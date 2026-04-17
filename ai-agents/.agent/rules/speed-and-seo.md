---
trigger: on_call
---

# Rules for Optimization, Speed & SEO

## 1. Performance & Budgeting
* **Lazy Loading:** Dynamically import SDK components not visible "above the fold".
* **Bundle Budget:** Max 200kB (compressed) per JS chunk; use tree-shaking.
* **Throttling:** Throttle background tasks when tab is inactive.

## 2. SEO & Metadata
* **SSR/Hydration:** Render essential map metadata on server for search bots.
* **Dynamic Meta:** Update `<title>` and OpenGraph tags per location/view.
* **Sitemaps:** Automatically generate for deep-linked geospatial entities.

## 3. Asset & UI Optimization
* **Data Pruning:** Implement Level of Detail (LoD) logic at API layer.
* **Modern Formats:** Use SVG or WebP for all UI icons and static assets.
* **Workers:** Offload coordinate calculations/parsing to Web Workers.
