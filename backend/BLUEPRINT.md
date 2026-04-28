# GNE Site Selection Tool — Backend Blueprint
> **Owner:** Niles Cañete (Backend Lead)
> **Version:** 1.2 | April 2026
> **Stack:** FastAPI · PostgreSQL 15+ / PostGIS 3.4 · SQLAlchemy 2.x · Docker
> **Current State:** Core infrastructure, ORM models, scoring engine, and major API routers are fully implemented. AI Chat is implemented as a placeholder. Data ingestion pipeline is pending.

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
│  │  /api/v1/   │→ │ Scoring Eng. │  │   (Placeholder)       │  │
│  │ (Registered)│  │ Geo Queries  │  │                       │  │
│  └─────────────┘  └──────────────┘  └───────────────────────┘  │
│          │                │                    │                │
│  ┌───────▼────────────────▼────────────────────▼─────────────┐  │
│  │              SQLAlchemy ORM + PostGIS                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           PostgreSQL 15+ with PostGIS 3.4 (Docker)              │
│  Users · Businesses · Hazards · Traffic · Barangays            │
│  LocationHistory · LocationRecommendation · Analysis            │
└───────────┬──────────────────────────────────────┬─────────────┘
            │                                      │
            ▼                                      ▼
┌───────────────────────┐              ┌────────────────────────┐
│  Earl's Data Outputs  │              │  External APIs         │
│  GeoJSON / Shapefile  │              │  Google Places API     │
│  (Pending Ingestion)  │              │  Google OAuth 2.0      │
└───────────────────────┘              └────────────────────────┘
```

---

## 2. Role Boundary Table

| Domain | Owner | Backend Touches? | Notes |
|---|---|---|---|
| DB Schema definition | **Earl** | ❌ Never | Niles consumes schema, never defines it |
| Data sourcing / cleaning | **Earl** | ❌ Never | Earl exports GeoJSON/Shapefile only |
| DB Migrations | **Earl** | ❌ Never | Backend reads migration output |
| ORM Models (SQLAlchemy) | **Niles** | ✅ Completed | 1-to-1 with ERD; zero drift detected |
| API Endpoints | **Niles** | ✅ Completed | FastAPI routers implemented and registered |
| Scoring Engine | **Niles** | ✅ Completed | Stateless engine with async spatial lookups |
| AI Assistant Logic | **Niles** | ✅ In Progress| Endpoint exists; logic is placeholder |
| Ingestion Scripts | **Niles** | ❌ Pending | Currently manual data loading |
| Docker / CI/CD | **Niles** | ✅ Completed | Dockerfile and docker-compose.yml ready |
| React Frontend | **Genald** | ❌ Never | Backend conforms to frontend contracts |
| Map Rendering / GMP setup | **Earl / Genald** | ❌ Never | Backend provides data; never renders |

---

## 3. API Endpoint Catalog

All endpoints are prefixed `/api/v1`. Authentication: **Google OAuth 2.0 (Bearer Token)**.

### 3.1 Users
| Method | Path | Description |
|---|---|---|
| `GET` | `/users/me` | Retrieve the authenticated user's profile |

### 3.2 Barangays (Optimized with 1h Cache)
| Method | Path | Description |
|---|---|---|
| `GET` | `/barangays/` | List all barangays (Paginated) |
| `GET` | `/barangays/{barangay_id}` | Get a single barangay by PSGC code |

### 3.3 Location History
| Method | Path | Description |
|---|---|---|
| `GET` | `/users/{user_id}/history` | List location history for a user |
| `POST` | `/users/{user_id}/history` | Add a new location history entry |
| `DELETE` | `/users/{user_id}/history` | Clear user's location history |

### 3.4 Recommendations & Analysis
| Method | Path | Description |
|---|---|---|
| `POST` | `/recommendations/generate` | Run analysis and save recommendation for a point |
| `GET` | `/users/{user_id}/recommendations` | List user's saved recommendations |
| `GET` | `/recommendations/{rlocation_id}` | Retrieve a specific recommendation |

### 3.5 AI Assistant
| Method | Path | Description |
|---|---|---|
| `POST` | `/ai/chat` | Interact with AI assistant (Placeholder) |

### 3.6 System
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | API health check |

---

## 4. Geospatial Query Strategy (PostGIS)

Backend uses **GeoAlchemy2** and **PostGIS 3.4**. All queries are asynchronous and use EPSG:4326.

| Use Case | Implementation | Performance |
|---|---|---|
| Containment | `ST_Within(point, boundary)` | GiST index on `boundary` |
| Proximity | `ST_DWithin(geom::geography, point::geography, radius)` | Radius in metres; GiST index |
| Bounding Box | `ST_Intersects(geom, ST_MakeEnvelope(...))` | Uses `&&` pre-filter |

*Note: Proximity queries for hazards, traffic, and businesses are executed in parallel via `asyncio.gather()`.*

---

## 5. Scoring Engine

Stateless implementation in `services/scoring.py`.

### 5.1 Sub-score Normalization [0.0 - 1.0]
- **Traffic**: Mean of nearby records, min-max scaled.
- **Competitors**: `1.0 - (count / 20)`, saturating at 20 businesses.
- **Hazards**: Max severity (`low`=0.25 to `extreme`=1.0), then inverted (`1.0 - risk`).

### 5.2 Overall Score & Stars
- **Formula**: Weighted average of all sub-scores (currently equal weights).
- **Stars**:
    - [0.0, 0.2) → 1★
    - [0.2, 0.4) → 2★
    - [0.4, 0.6) → 3★
    - [0.6, 0.8) → 4★
    - [0.8, 1.0] → 5★

---

## 6. AI Assistant Pipeline

- **Status**: Implemented as Placeholder in `routers/ai.py`.
- **Rate Limit**: 20 requests per minute per user.
- **Integration**: Designed to accept `analysis_id` and `message` to provide context-aware insights (Logic pending).

---

## 7. Data Ingestion Pipeline (Earl → Backend)

- **Status**: Pending.
- **Logic**: Planned for `ingestion/run.py` to upsert GeoJSON features into PostGIS tables.

---

## 8. Backend Folder Structure (Actual)

```
backend/
├── main.py                  # FastAPI Entry point & Middleware
├── Dockerfile               # Python 3.11-slim
├── docker-compose.yml       # PostGIS 15 container
├── requirements.txt
│
├── core/                    # Infrastructure
│   ├── database.py          # Async engine
│   ├── security.py          # Google OAuth 2.0
│   └── rate_limit.py        # SlowAPI config
│
├── models/                  # ORM Models (Verified 1-to-1 with ERD)
│   ├── user.py, business.py, hazard.py, traffic.py,
│   ├── barangay.py, analysis.py, location_history.py,
│   └── location_recommendation.py
│
├── routers/                 # API Route Handlers
│   ├── users.py, recommendations.py, ai.py, 
│   ├── barangays.py, location_history.py
│
├── services/                # Business Logic
│   ├── scoring.py           # Scoring Engine
│   ├── geo_queries.py       # PostGIS helpers
│   ├── analysis_service.py  # Orchestration
│   └── recommendation.py    # Persistence logic
│
└── utils/                   # Shared Helpers
    └── logger.py            # Structured logging
```

---

## 9. Build Phases Checklist

| Phase | Task | Status |
|---|---|---|
| 1 | API contract design (OpenAPI spec) | ✅ |
| 2 | SQLAlchemy ORM models from ERD | ✅ |
| 3 | PostGIS spatial query helpers | ✅ |
| 4 | Scoring engine implementation | ✅ |
| 5 | Analysis / Scoring orchestration | ✅ |
| 6 | Recommendations endpoints | ✅ |
| 7 | AI chat endpoint (Placeholder) | ✅ |
| 8 | Logging & Middleware | ✅ |
| 9 | Security (Google OAuth) | ✅ |
| 10 | Dockerization | ✅ |
| 11 | Cache & Performance optimization | ✅ |
| 12 | QA test suite | ❌ Pending |

---

## 10. What Backend Does NOT Touch

- PostgreSQL schema migrations (Earl owns)
- Raw GeoJSON source files (Earl owns)
- React Frontend (Genald owns)
- Any schema field not present in the Authoritative ERD.

> [!IMPORTANT]
> **Schema Audit:** `models/analysis.py` uses table name `analyses`. All fields in `TrafficData` and `Analysis` match the ERD types and names. Zero drift detected.

---

## 11. Assumptions and Uncertainties

| Item | Status |
|---|---|
| LLM Provider | **Resolved**: Adaptable interface, env vars provided. |
| Auth Method | **Resolved**: Google OAuth 2.0 Bearer tokens. |
| Scoring weights | **Resolved**: Default equal; custom weights supported in engine. |
| Ingestion logic | **Pending**: No scripts implemented yet. |
