---
trigger: always_on
---

# Global Development Rules

## 1. Documentation & Safety
* **Maintainability:** Header documentation for all classes and functions.
* **Zero-Leak Policy:** Use environment variables; never hardcode credentials/PII.
* **SQL Safety:** Use parameterized queries or ORM; no raw string concatenation.
* **Input Validation:** Mandatory schema validator (e.g., Zod) for all entry points.

## 2. Code Quality
* **Atomic Components:** Keep UI components under 150 lines.
* **Type Safety:** Use Strict TypeScript mode; avoid `any`.
* **DRY Principle:** Refactor repeated logic into utilities/hooks.

## 3. Operations
* **Idempotency:** Ensure scripts are safe to run multiple times.
* **Logging:** Specific error codes and timestamped entries for every failure.
