---
name: react-component-engineering
description: Translates spatial queries into performant, interactive, and visually stunning web maps.
---

# React Component Engineering Skill
Deconstruct complex geospatial interfaces into a hierarchical structure of Atoms, Molecules, and Organisms optimized for React.

## 🎯 Steps
1. **Decompose:** Breakdown UI into reusable Atoms and Molecules.
2. **Audit:** Run `./scripts/lint_architecture.py` to verify Atomic Design hierarchy.
3. **Optimize:** Use `React.memo` and `useMemo` to prevent re-renders during zoom/pan.

## 📋 Requirements
* Atoms must be stateless and free of side effects.
* Use `React.createPortal` for map-anchored UI (popups, tooltips).
* Folders must contain `index.tsx`, `.styles.ts`, `.test.tsx`, and `.stories.tsx`.
