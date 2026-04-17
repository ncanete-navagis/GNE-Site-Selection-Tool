---
name: security-and-privacy
description: Ensures geospatial interfaces are inclusive and WCAG compliant.
---

# Security and Privacy Skill
Secure the Antigravity ecosystem using Defense in Depth and protecting geospatial privacy.

## 🎯 Steps
1. **Secure:** Implement JWT, OAuth2, and OIDC for identity orchestration.
2. **Audit:** Run `./scripts/audit_security.sh` to check for insecure patterns.
3. **Audit:** Monitor spatial queries for resource exhaustion and scraping attempts.

## 📋 Requirements
* Use RS256 (Asymmetric) signing for JWTs.
* Store JWTs in `HttpOnly` and `SameSite=Strict` cookies.
* Coordinate data in logs must be jittered or masked (PII protection).
