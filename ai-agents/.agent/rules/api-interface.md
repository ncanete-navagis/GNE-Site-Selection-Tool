---
trigger: on_call
---

# Rules for API Communication & Request Mapping

## 1. Validation & Integrity
* **Schema Validation:** Mandatory for all requests before reaching controllers.
* **Spatial Integrity:** Validate coordinate ranges (Lat: ±90, Lon: ±180), polygon closure, and vertex limits.

## 2. Standards & Protocols
* **Decoupled Logic:** Separate mapping (URL -> Controller) from business logic.
* **DTOs:** Map incoming requests to Data Transfer Objects; never pass raw objects to the database.
* **Versioning:** All endpoints must be versioned (e.g., `/v1/...`).
* **HTTP Methods:** Use standard methods (GET for queries, POST for creation, etc.).

## 3. Status Codes & Errors
* **Status Codes:** Use meaningful codes: `400` (malformed), `422` (invalid spatial logic), `413` (payload too large).
* **Structured Errors:** Return JSON error responses; never leak stack traces or connection strings.
