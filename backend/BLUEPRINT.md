# GNE Site Selection Tool — Backend Blueprint
> **Owner:** Niles Cañete (Backend Lead)
> **Version:** 1.1 | April 2026
> **Stack:** FastAPI · PostgreSQL 15+ / PostGIS 3.x · SQLAlchemy · Docker
> **Current State:** API Contracts (openapi.yaml), SQLAlchemy ORM Models (models/), PostGIS spatial query helpers (services/geo_queries.py), and Scoring Engine (services/scoring.py) implemented. Routers are pending.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Genald)                        │
│              React 18+ · Google Maps Platform · UI              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Niles) — FastAPI                   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │   Routers   │  │   Services   │  │    AI Assistant       │  │
│  │  (Pending)  │→ │  (Pending)   │  │    (Pending)          │  │
│  └─────────────┘  └──────────────┘  └───────────────────────┘  │
│          │                │                    │                │
│  ┌───────▼────────────────▼────────────────────▼─────────────┐  │
│  │         SQLAlchemy ORM + PostGIS (Implemented)             │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               PostgreSQL 15+ with PostGIS 3.x (DB)             │
│  Users · Businesses · Hazards · Traffic · Barangays            │
│  LocationHistory · LocationRecommendation · Analysis            │
└───────────┬──────────────────────────────────────┬─────────────┘
            │                                      │
            ▼                                      ▼
┌───────────────────────┐              ┌────────────────────────┐
│  Earl's Data Outputs  │              │  External APIs         │
│  GeoJSON / Shapefile  │              │  Google Places API     │
│  (Pending Ingestion)  │              │  LLM Provider (TBD)   │
└───────────────────────┘              └────────────────────────┘
```

---

## 2. Role Boundary Table

| Domain | Owner | Backend Touches? | Notes |
|---|---|---|---|
| DB Schema definition | **Earl** | ❌ Never | Niles consumes schema, never defines it |
| Data sourcing / cleaning | **Earl** | ❌ Never | Earl exports GeoJSON/Shapefile only |
| DB Migrations | **Earl** | ❌ Never | Backend reads migration output |
| ORM Models (SQLAlchemy) | **Niles** | ✅ Translates Earl's schema | **Implemented**: 1-to-1 with ERD; no invention |
| API Endpoints | **Niles** | ✅ Owns | FastAPI routers (**Pending**) |
| Scoring Engine | **Niles** | ✅ Owns | Based on Analysis entity fields only |
| AI Assistant Logic | **Niles** | ✅ Owns | Context-aware, no hallucinated scoring |
| Ingestion Scripts | **Niles** | ✅ Owns | Consumes Earl's outputs only |
| Docker / CI/CD | **Niles** | ✅ Owns | |
| React Frontend | **Genald** | ❌ Never | Backend must conform to existing frontend |
| Map Rendering / GMP setup | **Earl / Genald** | ❌ Never | Backend provides data; never renders |
| UI Components | **Genald** | ❌ Never | |

---

## 3. API Endpoint Catalog

*Current Implementation State: Endpoints are defined in `openapi.yaml`. Backend implementation is partially complete in `routers/`. Authentication method: **Google OAuth 2.0 (Bearer Token)**.*

### 3.1 Users
| Method | Path | Description |
|---|---|---|
| `POST` | `/users/` | Create a user |
| `GET` | `/users/{user_id}` | Retrieve a user profile |

### 3.2 Businesses
| Method | Path | Description |
|---|---|---|
| `GET` | `/businesses/` | List businesses (Paginated limit/offset) |

### 3.3 Hazards
| Method | Path | Description |
|---|---|---|
| `GET` | `/hazards/` | List hazards (Paginated limit/offset) |

### 3.4 Traffic
| Method | Path | Description |
|---|---|---|
| `GET` | `/traffic/` | List traffic data (Paginated limit/offset) |

### 3.5 Location History
| Method | Path | Description |
|---|---|---|
| `GET` | `/users/{user_id}/history` | Get user location history |
| `POST` | `/users/{user_id}/history` | Save location history |

### 3.6 Location Recommendations
| Method | Path | Description |
|---|---|---|
| `POST` | `/recommendations/generate` | Generate a location recommendation |

### 3.7 Barangays
| Method | Path | Description |
|---|---|---|
| `GET` | `/barangays/` | List Barangays (Paginated limit/offset) |

### 3.8 Analysis
| Method | Path | Description |
|---|---|---|
| `POST` | `/analysis/` | Generate site analysis (Scoring Engine output) |

---

## 4. Geospatial Query Strategy (PostGIS)

*Current Implementation State: Models use GeoAlchemy2 types (POINT, POLYGON). Spatial query helpers implemented in `services/geo_queries.py`.*

All geometry is stored and queried in **EPSG:4326**. Backend uses GeoAlchemy2 for ORM-level spatial operations.

| Use Case | PostGIS Function | Notes |
|---|---|---|
| Proximity search (hazards, traffic, businesses) | `ST_DWithin(geom, ST_SetSRID(ST_MakePoint(lon, lat), 4326), radius_deg)` | Radius in degrees or use `ST_Transform` for meters |
| Barangay boundary containment | `ST_Within(point_geom, barangay.boundary)` | Identify which barangay a point falls in |
| Bounding box filter | `ST_Intersects(geom, ST_MakeEnvelope(xmin, ymin, xmax, ymax, 4326))` | Used for map viewport queries |
| Geometry centroid | `ST_Centroid(geom)` | Compute center of drawn polygon |
| GeoJSON output | `ST_AsGeoJSON(geom)` | All API geometry responses in GeoJSON |
| Spatial index | `CREATE INDEX USING GIST(geom)` | Earl applies; backend assumes index exists |

---

## 5. Scoring Engine

*Current Implementation State: **Implemented** in `services/scoring.py`.*

Scoring is derived **exclusively** from the `Analysis` entity fields. No additional scoring dimensions are invented.

### 5.1 Analysis Fields
```
overall_score
traffic_score
foot_traffic_score
competing_business_score
landslide_hazard_score
flood_hazard_score
storm_surge_score
```

### 5.2 Scoring Pipeline (Planned)
```
Input: geometry (point or polygon from frontend)
  │
  ├─ 1. Identify containing barangay → barangay_id
  │
  ├─ 2. Spatial queries (parallel):
  │      ├─ traffic records within radius → traffic_score
  │      ├─ foot traffic proxy (traffic_type = 'foot') → foot_traffic_score
  │      ├─ competing businesses within radius → competing_business_score
  │      ├─ hazard records: landslide severity → landslide_hazard_score
  │      ├─ hazard records: flood severity → flood_hazard_score
  │      └─ hazard records: storm_surge → storm_surge_score
  │
  ├─ 3. Normalize each sub-score to [0.0 – 1.0]
  │
  ├─ 4. Apply weights (default equal; restaurant_type filter adjusts weights)
  │      overall_score = weighted_avg(all sub-scores)
  │
  ├─ 5. Map overall_score → 1–5 star display value
  │
  ├─ 6. Generate pros/cons list from sub-scores
  │
  └─ 7. Persist → Analysis table; link to LocationHistory or LocationRecommendation
```

> **Note:** Weight configuration per restaurant type is **"Insufficient data to verify"** — default equal weights are used until frontend filter contract is confirmed.

---

## 6. AI Assistant Pipeline

*Current Implementation State: Pending implementation in `ai/`.*

```
Frontend Input:
  { "message": "...", "context": { analysis_id, geom, barangay_id } }
  │
  ├─ 1. Fetch Analysis record by analysis_id
  ├─ 2. Fetch Barangay name by barangay_id
  ├─ 3. Build structured context block (scores + location name)
  ├─ 4. Construct LLM prompt:
  │      SYSTEM: "You are a site selection assistant..."
  │      CONTEXT: [scores, barangay, hazard summary, pros/cons]
  │      USER: [message]
  ├─ 5. Call LLM API (provider TBD — "Insufficient data to verify")
  └─ 6. Return { "reply": "..." } to frontend
```

---

## 7. Data Ingestion Pipeline (Earl → Backend)

*Current Implementation State: Pending implementation in `ingestion/`.*

```
Earl Outputs:
  ├─ hazards.geojson       → Hazards table
  ├─ traffic.geojson       → Traffic Data table
  ├─ barangays.geojson     → Barangay table
  └─ businesses.geojson    → Business table

Backend ingestion/run.py (Planned):
  1. Load GeoJSON file
  2. Validate required fields (no schema invention)
  3. Transform geometry → PostGIS WKT (EPSG:4326)
  4. Upsert records (PK-based conflict resolution)
  5. Log ingestion count and errors
```

---

## 8. Backend Folder Structure (Actual)

```
backend/
├── BLUEPRINT.md                        # This file (Updated v1.1)
├── FOLDER_STRUCTURE_AND_CONTRACTS.md   # Detailed contract mapping
├── openapi.yaml                        # API Contract
├── OVERVIEW_PROMPT.md                  # Regeneration prompt
│
├── models/                             # ORM Models (Implemented)
│   ├── __init__.py
│   ├── base.py
│   ├── analysis.py
│   ├── barangay.py
│   ├── business.py
│   ├── hazard.py
│   ├── location_history.py
│   ├── location_recommendation.py
│   ├── traffic.py
│   └── user.py
│
└── services/                           # Business Logic (Partially Implemented)
    ├── __init__.py
    ├── geo_queries.py                  # PostGIS spatial query helpers (Implemented)
    └── scoring.py                      # Site scoring engine (Implemented)
```

---

## 9. Build Phases Checklist

| Phase | Task | Agent | Status |
|---|---|---|---|
| 1 | API contract design (OpenAPI spec) | API_SPECIALIST | ✅ Completed |
| 2 | SQLAlchemy ORM models from ERD | API_SPECIALIST + GIS_DATABASE_ENGINEER | ✅ Completed |
| 3 | PostGIS spatial query helpers | GIS_DATABASE_ENGINEER | ✅ Completed |
| 4 | Scoring engine implementation | OPTIMIZATION_ENGINEER | ✅ Completed |
| 5 | `/analysis/` endpoint | API_SPECIALIST | Pending |
| 6 | `/recommendations/` endpoint | API_SPECIALIST | Pending |
| 7 | `/ai/chat` endpoint | API_SPECIALIST | Pending |
| 8 | Logging + monitoring setup | LOGGING_SPECIALIST | ✅ Completed |
| 9 | Security / session layer | SECURITY_SPECIALIST | ✅ Completed |
| 10 | Docker + docker-compose | DEVOPS_ENGINEER | ✅ Completed |
| 11 | Query performance optimization | OPTIMIZATION_ENGINEER | Pending |
| 12 | QA test suite | QA_AUDITOR | Pending |

---

## 10. What Backend Does NOT Touch

- PostgreSQL schema definitions or migrations (Earl owns these)
- Source GeoJSON/Shapefile datasets (Earl owns these)
- React components, frontend state, or UI logic (Genald owns these)
- Google Maps Platform configuration or rendering (Earl/Genald own these)
- Any schema field not present in the ERD above

> [!NOTE]
> **Schema Drift Audit (2026-04-19):** All implemented models in `backend/models/` have been verified against the Authoritative ERD. All fields match; no drift detected.

---

## 11. Assumptions and Uncertainties

| Item | Status |
|---|---|
| LLM provider and model for AI assistant | **Insufficient data to verify** |
| Authentication method (token vs session) | **Google OAuth 2.0 Bearer Token (Resolved)** |
| Restaurant type → scoring weight mapping | **Insufficient data to verify** |
| Frontend API response format for map pins | **Insufficient data to verify** |
| Supplier data source and schema | **Insufficient data to verify** (stretch goal) |
| CI/CD platform (GitHub Actions, Cloud Run, etc.) | **Insufficient data to verify** |
| Foot traffic data source (GMP vs third-party) | **Insufficient data to verify** |

---

## 12. Security Architecture Decisions (Phase 9)

**1. Authentication Method**: The backend leverages Google OAuth 2.0. The frontend obtains the ID token and sends it as a Bearer token. The backend verifies the token using the Google Auth library. The backend does not redirect or issue its own tokens, adhering strictly to a stateless API design.
**2. User Identification**: The `user_id` inside `RecommendationCreateRequest` and other DTOs has been intentionally removed or is overridden by the authenticated user's context. The `get_current_user` dependency automatically extracts the `user_id` (`sub` claim) to prevent privilege escalation and ID spoofing.
**3. Missing Routers**: `users.py`, `ai.py`, and `location_history.py` were dynamically created during Phase 9 to facilitate dependency injection of the new `get_current_user` function.
**4. Rate Limiting**: `POST /api/v1/ai/chat` is protected by a 20 requests/minute rate limit. A lightweight, in-memory implementation (`slowapi`) was chosen to avoid introducing a Redis dependency prematurely. Rate limiting keys on the extracted `sub` claim or client IP.

---

## 13. Logging Architecture Decisions (Phase 8)

**1. JSON Structured Logging**: Standard Python `logging` was configured with a custom `JSONFormatter` in `core/logging_config.py`. All application logs are output as JSON lines to facilitate ingestion by observability platforms.
**2. Data Privacy Constraints**: The `JSONFormatter` enforces strict privacy rules. Any field named `message_content` (e.g., raw AI chat messages) is scrubbed and replaced with `[REDACTED]`. Full geometry payloads are strictly prohibited; only Point geometries (centroids) are logged to protect proprietary location boundaries.
**3. File Management**: Logs are written to `/var/log/gne/gne_backend.log` utilizing `RotatingFileHandler` (10 MB max, 5 backups). If the directory cannot be created due to OS permission issues (common on Windows development environments), it gracefully falls back to `./logs/gne_backend.log`.
**4. Request & Telemetry Logging**: A global ASGI middleware in `main.py` records HTTP requests with exact `duration_ms`. Domain operations, such as scoring engine invocations in `analysis_service.py`, are explicitly timed and logged with detailed sub-score breakdowns using the helper methods in `utils/logger.py`.

---

## 14. Docker & Deployment Configuration (Phase 10)

**1. Containerization Strategy**: The backend is containerized using `python:3.11-slim` as the base image to minimize footprint while supporting necessary system libraries. The Dockerfile explicitly installs `gdal-bin`, `libgdal-dev`, and `libgeos-dev` to ensure compatibility with GeoAlchemy2 and PostGIS spatial operations.
**2. Local Orchestration**: A `docker-compose.yml` file defines the application stack, consisting of the FastAPI `api` service and a `db` service using `postgis/postgis:15-3.4-alpine`. It maps the `/var/log/gne` directory to a local `./logs` volume for persistent logging. 
**3. Configuration Management**: All sensitive credentials and environment-specific settings (e.g., `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `LLM_API_KEY`) are externalized to a `.env` file and passed into the containers via Docker Compose. A `.env.example` file is maintained as a template.
**4. Build Optimization**: A strict `.dockerignore` file prevents virtual environments, Python caches, logs, and Git metadata from being copied into the container context, reducing build times and image bloat.
