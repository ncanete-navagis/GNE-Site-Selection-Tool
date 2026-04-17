---
name: speed-and-seo-optimization
description: Optimizes web applications for instant loading and search engine visibility.
---

# Speed and SEO Optimization Skill
Ensure that geospatial applications load instantly, run at 60 FPS, and are indexable by search bots.

## 🎯 Steps
1. **Minimize:** Optimize Critical Rendering Path and assets (Brotli, WebP).
2. **SSG/SSR:** Implement server-side rendering for essential map metadata.
3. **Audit:** Run `./scripts/measure_perf.py` to capture Core Web Vitals.

## 📋 Requirements
* No single JavaScript chunk should exceed 200kB (compressed).
* Lazy load Antigravity SDK components that are not visible "above the fold".
* Implement JSON-LD for location-based data indexing.
