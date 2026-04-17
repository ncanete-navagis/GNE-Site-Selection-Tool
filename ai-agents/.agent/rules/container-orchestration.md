---
trigger: on_call
---

# Rules for Containerization & Cloud Deployment

## 1. Build & Base Images
* **Multi-Stage Builds:** Separate build dependencies from runtime artifacts to keep images lean.
* **Distroless/Alpine:** Prefer minimal base images for production security.

## 2. Image Optimization
* **Layer Caching:** Order commands from least to most likely to change.
* **Cleanup:** Remove package manager caches in the same layer as installation.

## 3. Cloud Native Standards
* **Port 8080:** Default for Google Cloud Run compatibility.
* **Graceful Shutdown:** Handle `SIGTERM` signals correctly.
* **Statelessness:** No data storage on local disk; use GCS or Cloud SQL.

## 4. Security
* **Non-Root User:** Run applications as a dedicated limited user.
* **Secret Management:** Use environment variables mapped to Secret Manager; never hardcode credentials.
