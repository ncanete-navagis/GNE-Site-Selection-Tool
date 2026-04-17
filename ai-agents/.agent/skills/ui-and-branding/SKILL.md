---
name: ui-and-branding
description: Translates brand identity into hard-coded system constants governing the visual language of geospatial interfaces.
---

# UI and Branding Skill
Translates brand identity into hard-coded system constants governing the visual language of geospatial interfaces.

## 🎯 Steps
1. **Standardize:** Maintain design tokens for colors, typography, and spacing.
2. **Audit:** Run `./scripts/check_design_tokens.py` to verify token usage.
3. **Align:** Implement responsive layouts that scale from mobile to ultrawide.

## 📋 Requirements
* No magic numbers; use `brand_constants.json` for all styles.
* Spacing must be a multiple of the base unit (4px or 8px).
* Floating panels must use `backdrop-filter: blur(8px)`.
