---
trigger: on_call
---

# Rules for Atomic Design & React Development

## 1. Atomic Hierarchy
* **Atoms:** Stateless; no internal side effects or SDK calls.
* **Molecules:** Manage local state; combine Atoms.
* **Organisms:** Data-aware; interact directly with SDK/Map instances.

## 2. Component Structure
* **Folders:** Enforce `index.tsx`, `styles.ts`, `test.tsx`, and `stories.tsx`.
* **Naming:** Use PascalCase for all component files.
* **Type Safety:** Strict TS interfaces mandatory for all Props.

## 3. SDK & Styling
* **Portals:** Use `React.createPortal` for map-anchored UI to avoid CSS conflicts.
* **Events:** Throttle SDK/Map event listeners to 60fps.
* **Tokens:** Use `brand_constants.json` only; no hardcoded styling values.
