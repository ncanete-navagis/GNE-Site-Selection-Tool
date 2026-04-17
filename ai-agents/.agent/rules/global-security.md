---
trigger: always_on
---

# Rules for Security, Identity & Resource Protection

## 1. Authentication & JWT
* **Stateless Security:** Use RS256 for JWT signing.
* **Hygiene:** Store JWTs in `HttpOnly` and `SameSite=Strict` cookies.
* **Short-Lived Access:** 15m access tokens with secure refresh tokens.

## 2. Authorization & RBAC
* **Least Privilege:** Access limited to required spatial layers and endpoints.
* **Attribute-Based:** Implement geofenced access for high-security data.

## 3. Resource & Query Security
* **Rate Limiting:** Mandatory for all endpoints; weigh spatial queries heavier.
* **Complexity Scoring:** Reject queries exceeding defined complexity limits.

## 4. Sensitive Data
* **Hashing:** Use Argon2id for password hashing.
* **Privacy Masking:** Jitter or mask location data in logs.
* **OAuth2:** Strict redirect whitelisting and mandatory `state` parameter.
