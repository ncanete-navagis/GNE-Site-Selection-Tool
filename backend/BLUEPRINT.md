# GNE Site Selection Tool — Backend Blueprint
> **Team:** Niles Cañete · Genald de Guia · Earl Gabriel Rondina
> **Version:** 2.0 | May 2026
> **Stack:** FastAPI · PostgreSQL 15+ / PostGIS 3.4 · SQLAlchemy 2.x · Docker
> **Current State:** Core infrastructure, ORM models, scoring engine, test suites, and major API routers are fully implemented. AI Chat is implemented as a placeholder. Data ingestion pipeline is pending.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                            FRONTEND                             │
│              React 18+ · Google Maps Platform · UI              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND — FastAPI                        │
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
│           PostgreSQL 15+ with PostGIS 3.4                       │
│  Users · Buildings · Hazards · Traffic · Barangays              │
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


## 2. API Endpoint Catalog

All endpoints are prefixed `/api/v1`. Authentication: **Google OAuth 2.0 (Bearer Token)**.

### 2.1 Users
| Method | Path | Description |
|---|---|---|
| `GET` | `/users/me` | Retrieve the authenticated user's profile |

### 2.2 Barangays (Optimized with 1h Cache)
| Method | Path | Description |
|---|---|---|
| `GET` | `/barangays/` | List all barangays (Paginated) |
| `GET` | `/barangays/{barangay_id}` | Get a single barangay by PSGC code |

### 2.3 Location History
| Method | Path | Description |
|---|---|---|
| `GET` | `/users/{user_id}/history` | List location history for a user |
| `POST` | `/users/{user_id}/history` | Add a new location history entry |
| `DELETE` | `/users/{user_id}/history` | Clear user's location history |

### 2.4 Recommendations & Analysis
| Method | Path | Description |
|---|---|---|
| `POST` | `/recommendations/generate` | Run analysis and save recommendation for a point |
| `GET` | `/users/{user_id}/recommendations` | List user's saved recommendations |
| `GET` | `/recommendations/{rlocation_id}` | Retrieve a specific recommendation |

### 2.5 AI Assistant
| Method | Path | Description |
|---|---|---|
| `POST` | `/ai/chat` | Interact with AI assistant (Placeholder) |

### 2.6 System
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | API health check |

---

## 3. Geospatial Query Strategy (PostGIS)

Backend uses **GeoAlchemy2** and **PostGIS 3.4**. All queries are asynchronous and use EPSG:4326.

| Use Case | Implementation | Performance |
|---|---|---|
| Containment | `ST_Within(point, boundary)` | GiST index on `boundary`/`geometry` |
| Proximity | `ST_DWithin(geom::geography, point::geography, radius)` | Radius in metres; GiST index |
| Bounding Box | `ST_Intersects(geom, ST_MakeEnvelope(...))` | Uses `&&` pre-filter |

*Note: Proximity queries for hazards, traffic, and buildings are executed in parallel via `asyncio.gather()`.*

---

## 4. Scoring Engine

Stateless implementation in `services/scoring.py` (v2.0).

### 4.1 Sub-score Normalization [0.0 - 1.0]
- **Hazards** (Flood, Landslide, Storm Surge): Count of specific hazard records, saturating at 5, then inverted (`1.0 - (count / 5)`).
- **Competitors**: Count of `CebuBuilding` / `ManilaBuilding` records, saturating at 20, then inverted (`1.0 - (count / 20)`).
- **Traffic / Foot Traffic**: STUBBED. `traffic_data` table not present in current schema. Defaults to neutral `0.5`.

### 4.2 Overall Score & Stars
- **Formula**: Weighted average of all sub-scores (currently equal weights).
- **Stars**:
    - [0.0, 0.2) → 1★
    - [0.2, 0.4) → 2★
    - [0.4, 0.6) → 3★
    - [0.6, 0.8) → 4★
    - [0.8, 1.0] → 5★

---

## 5. AI Assistant Pipeline

- **Status**: Implemented as Placeholder in `routers/ai.py`.
- **Rate Limit**: 20 requests per minute per user.
- **Integration**: Designed to accept `analysis_id` and `message` to provide context-aware insights (Logic pending).

---

## 6. Data Ingestion Pipeline

- **Status**: Pending.
- **Logic**: Planned for `ingestion/run.py` to upsert GeoJSON features into PostGIS tables. Test files exist in `tests/test_ingestion.py`.

---

## 7. Backend Folder Structure (Actual)

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
│   ├── logging_config.py    # Logging
│   └── rate_limit.py        # SlowAPI config
│
├── models/                  # ORM Models
│   ├── user.py, business.py, building.py, hazard.py, traffic.py,
│   ├── barangay.py, analysis.py, location_history.py,
│   └── location_recommendation.py
│
├── routers/                 # API Route Handlers
│   ├── users.py, recommendations.py, ai.py, 
│   ├── barangays.py, location_history.py
│
├── schemas/                 # Pydantic validation schemas
│   └── user.py
│
├── services/                # Business Logic
│   ├── scoring.py           # Scoring Engine (v2.0)
│   ├── geo_queries.py       # PostGIS helpers
│   ├── analysis_service.py  # Orchestration
│   └── recommendation.py    # Persistence logic
│
├── tests/                   # QA test suite
│   ├── conftest.py, test_ai_chat.py, test_analysis.py,
│   ├── test_geo_queries.py, test_ingestion.py, 
│   ├── test_recommendations.py, test_scoring.py
│
└── utils/                   # Shared Helpers
    └── logger.py            # Structured logging
```

---

## 8. Build Phases Checklist

| Phase | Task | Status |
|---|---|---|
| 1 | API contract design (OpenAPI spec) | ✅ |
| 2 | SQLAlchemy ORM models from updated schema | ✅ |
| 3 | PostGIS spatial query helpers | ✅ |
| 4 | Scoring engine implementation | ✅ |
| 5 | Analysis / Scoring orchestration | ✅ |
| 6 | Recommendations endpoints | ✅ |
| 7 | AI chat endpoint (Placeholder) | ✅ |
| 8 | Logging & Middleware | ✅ |
| 9 | Security (Google OAuth) | ✅ |
| 10 | Dockerization | ✅ |
| 11 | Cache & Performance optimization | ✅ |
| 12 | QA test suite | ✅ |

---

## 9. Assumptions and Uncertainties

| Item | Status |
|---|---|
| LLM Provider | **Resolved**: Adaptable interface, env vars provided. |
| Auth Method | **Resolved**: Google OAuth 2.0 Bearer tokens. |
| Scoring weights | **Resolved**: Default equal; custom weights supported in engine. |
| Ingestion logic | **Pending**: No scripts implemented yet, but tests mapped out. |
| Database Schema | **Resolved**: ORMs have been successfully aligned with Earl's updated database schema. |
