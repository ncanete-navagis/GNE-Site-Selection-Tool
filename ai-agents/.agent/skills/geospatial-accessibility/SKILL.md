---
name: geospatial-accessibility
description: Ensures geospatial interfaces are inclusive and WCAG compliant.
---

# Geospatial Accessibility Skill
Ensure that the Google Antigravity web application is fully perceivable, operable, and understandable for users with visual, motor, auditory, or cognitive impairments.

## 🎯 Steps
1. **Audit:** Run `./scripts/check_contrast.sh` to verify color contrast compliance.
2. **Remediate:** Implement focus traps and ARIA attributes for interactive elements.
3. **Validate:** Verify announcements in screen readers (NVDA, JAWS, VoiceOver).

## 📋 Requirements
* Minimum contrast ratio 4.5:1 for normal text.
* All interactive elements must be keyboard accessible.
* Use `aria-live` for dynamic map updates.
