---
name: container-orchestration
description: Manages cloud-native deployments and Docker optimization.
---

# Container Orchestration Skill
Wraps the Antigravity ecosystem into high-performance, secure, and lightweight Docker images optimized for cloud environments.

## 🎯 Steps
1. **Build:** Create multi-stage Dockerfiles and run `./scripts/validate_dockerfile.py`.
2. **Clean:** Execute `./scripts/cleanup_orphans.sh` for build environment hygiene.
3. **Deploy:** Configure GKE manifests or Cloud Run service definitions with proper health checks.

## 📋 Requirements
* Favor `distroless` or `alpine` images for production.
* Never run as `root`; use a specific non-privileged user.
* Clean up package manager caches in the same layer as installation.
