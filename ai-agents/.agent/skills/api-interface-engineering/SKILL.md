---
name: api-interface-engineering
description: Defines and enforces communication protocols and request orchestration.
---

# API Interface Engineering Skill
Establishes rigid API specifications and ensures predictable data flows between clients and the Antigravity backend.

## 🎯 Steps
1. **Define:** Create OpenAPI/Swagger specifications for new endpoints.
2. **Validate:** Implement Zod or Pydantic schemas for input sanitization.
3. **Audit:** Run `./scripts/validate_contract.py` to ensure API contract compliance.

## 📋 Requirements
* All endpoints must be versioned.
* Zero-trust data ingestion: validate every coordinate and polygon closure.
* Return structured JSON error responses with meaningful status codes.
