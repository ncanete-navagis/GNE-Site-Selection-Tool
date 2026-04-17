---
name: quality-assurance-auditing
description: Ensures reliability and stability through automated testing and performance auditing.
---

# Quality Assurance Auditing Skill
Identify edge cases in coordinate transformations and ensure the stability of spatial APIs and UI components.

## 🎯 Steps
1. **Automate:** Build Unit, Integration, and E2E tests (Jest, Playwright, Cypress).
2. **Audit:** Execute `./scripts/run_suite.sh` to validate the geospatial test suite.
3. **Performance Audit:** Verify frame rates and API latency against standards.

## 📋 Requirements
* All failures must return a specific error code and timestamped log entry.
* Test for "it works everywhere" parity between dev and production.
* Maintain a robust regression suite for SDK updates.
