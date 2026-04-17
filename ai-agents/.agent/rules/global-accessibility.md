---
trigger: always_on
---

# Rules for Accessibility & WCAG Compliance

## 1. Keyboard & Focus Management
* **Focus Traps:** Implement focus traps for all modals/panels.
* **Focus Visible:** Provide custom high-contrast `:focus-visible` state.
* **Skip Links:** "Skip to Map/Content" must be the first focusable element.

## 2. ARIA & Semantics
* **Semantic HTML:** Use `<nav>`, `<main>`, `<header>`, etc., over `<div>`.
* **Labels:** Provide `aria-label`/`aria-describedby` for maps and icon-only buttons.

## 3. Contrast & Motion
* **Contrast Ratio:** Maintain 4.5:1 (Normal) or 3:1 (Large text/UI).
* **Motion Reduction:** Detect `prefers-reduced-motion` to dampen transitions.

## 4. Forms & Status Alerts
* **Accessible Errors:** Link validation errors to inputs via `aria-invalid` and `aria-describedby`.
* **Live Regions:** Use `aria-live` for non-essential (`polite`) and critical (`assertive`) updates.
