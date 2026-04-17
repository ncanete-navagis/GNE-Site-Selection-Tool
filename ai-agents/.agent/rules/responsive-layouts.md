---
trigger: on_call
---

# Rules for App Shell & Responsive Layouts

## 1. Layout & Pointer Events
* **Map first:** Engine canvas must occupy stable grid/container to prevent recalculations.
* **Pointer Events:** sidebars/headers `auto`; transparent zones `none` to pass events.

## 2. Responsive Standards
* **Breakpoints:** Mobile (Bottom Sheets), Tablet (Collapsible), Ultra-wide (Multi-column/Pinned).
* **Architecture:** CSS Grid for shell layout; Flexbox for internal alignment.
* **GPU Thread:** Use `transform: translateX()` for sidebar transitions to stay at 60fps.

## 3. Dimensions & Hierarchy
* **Safe Areas:** Account for notches using `env(safe-area-inset-top)`.
* **Z-Index:** Header (1000), Sidebars (900), Overlays (800), Canvas (0).
