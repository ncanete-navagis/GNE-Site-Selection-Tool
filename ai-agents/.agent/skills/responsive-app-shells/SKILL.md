---
name: responsive-app-shells
description: Ensures geospatial interfaces are responsive and performant across devices.
---

# Responsive App Shells Skill
Create the structural skeleton that houses the Antigravity viewport, ensuring navigation and sidebars are performant across all device types.

## 🎯 Steps
1. **Layout:** Build high-performance App Shells using CSS Grid and Flexbox.
2. **Audit:** Run `./scripts/check_breakpoints.sh` to validate responsive breakpoints.
3. **Adapt:** Implement collapsible sidebars and touch-optimized navigation for mobile.

## 📋 Requirements
* Map canvas must occupy a `100vh/100vw` container.
* Sidebar transitions must use `transform: translateX()` for 60fps performance.
* Sidebars and headers must use `pointer-events: auto;` while dead zones pass events through.
