# GNE Backend — Folder Structure & Frontend Contract Mapping

---

## Part 1: Backend Folder Structure

```
backend/
│
├── main.py                        # FastAPI app init, middleware, router registration
├── BLUEPRINT.md                   # Living architecture document
├── OVERVIEW_PROMPT.md             # Antigravity regeneration prompt
├── requirements.txt               # Python dependencies (locked versions)
├── Dockerfile                     # Container build for backend
├── docker-compose.yml             # Orchestrates api + db services
├── .env.example                   # Environment variable template
├── .dockerignore
│
├── core/                          # App-wide configuration and infrastructure
│   ├── config.py                  # Pydantic BaseSettings (reads from .env)
│   ├── database.py                # SQLAlchemy async engine + session factory
│   └── security.py                # Token verification, get_current_user() dependency
│
├── models/                        # SQLAlchemy ORM models (1-to-1 with ERD)
│   ├── user.py                    # User entity
│   ├── business.py                # Business entity (PK = google_places_id)
│   ├── hazard.py                  # Hazards entity
│   ├── traffic.py                 # Traffic Data entity
│   ├── barangay.py                # Barangay entity (PK = PSGC code)
│   ├── location_history.py        # Location History entity
│   ├── location_recommendation.py # Location Recommendation entity
│   └── analysis.py                # Analysis entity
│
├── schemas/                       # Pydantic request/response models
│   ├── user.py
│   ├── business.py
│   ├── hazard.py
│   ├── traffic.py
│   ├── barangay.py
│   ├── location_history.py
│   ├── location_recommendation.py
│   └── analysis.py
│
├── routers/                       # FastAPI route handlers (thin — delegate to services)
│   ├── users.py                   # GET/POST /users/
│   ├── analysis.py                # POST/GET /analysis/
│   ├── hazards.py                 # GET /hazards/
│   ├── traffic.py                 # GET /traffic/
│   ├── businesses.py              # GET /businesses/
│   ├── barangays.py               # GET /barangays/
│   ├── history.py                 # GET/POST/DELETE /users/{id}/history
│   ├── recommendations.py         # POST/GET /recommendations/
│   └── ai.py                      # POST /ai/chat
│
├── services/                      # Business logic (called by routers)
│   ├── geo_queries.py             # PostGIS spatial query helpers
│   ├── scoring.py                 # Scoring engine (pure, stateless)
│   ├── analysis_service.py        # Orchestrates queries → scores → persist
│   └── recommendation.py          # Recommendation generation + persistence
│
├── ai/                            # AI assistant pipeline
│   ├── adapter.py                 # Provider-agnostic LLM caller (mock + real)
│   ├── prompt_builder.py          # Builds context-aware system + user prompts
│   └── chat_service.py            # End-to-end chat handler
│
├── ingestion/                     # Data ingestion scripts (consumes Earl's outputs)
│   ├── run.py                     # CLI: python -m ingestion.run --entity hazards --file path
│   ├── hazards_loader.py          # Loads hazards.geojson → Hazards table
│   ├── traffic_loader.py          # Loads traffic.geojson → Traffic Data table
│   ├── barangay_loader.py         # Loads barangays.geojson → Barangay table
│   └── business_loader.py         # Loads businesses.geojson → Business table
│
├── utils/                         # Shared utilities
│   ├── geojson_helpers.py         # GeoJSON ↔ WKT conversion, geometry validation
│   ├── pagination.py              # Shared pagination helper (page, page_size)
│   ├── response_formatter.py      # Consistent API response envelope
│   └── logger.py                  # Shared structured logger instance
│
└── tests/                         # QA test suite
    ├── conftest.py                # Pytest fixtures, test DB setup
    ├── test_analysis.py
    ├── test_scoring.py
    ├── test_geo_queries.py
    ├── test_recommendations.py
    ├── test_ai_chat.py
    └── test_ingestion.py
```

### Folder Responsibility Summary

| Folder | Responsibility | Who Reads It |
|---|---|---|
| `core/` | Config, DB session, security | All other layers |
| `models/` | DB table definitions (ORM) | Services, routers |
| `schemas/` | API request/response shapes | Routers, frontend |
| `routers/` | HTTP route definitions | FastAPI (registered in main.py) |
| `services/` | Business + spatial logic | Routers |
| `ai/` | LLM integration pipeline | Routers → ai router |
| `ingestion/` | Bulk data loading from Earl | Run manually / cron |
| `utils/` | Shared helpers | Everywhere |
| `tests/` | Automated QA | CI pipeline / dev |

---

## Part 2: Frontend Contract Mapping

> **Convention:** All geometry responses are GeoJSON. All IDs are UUID strings unless noted.
> Where frontend behavior is unclear, the contract is marked:
> **"Insufficient data to verify frontend contract"**

---

### POST `/api/v1/analysis/`

**Frontend Usage:** User clicks/draws on map → frontend sends point → receives site score for map pin display.

**Request:**
```json
{
  "longitude": -122.4194,
  "latitude": 37.7749,
  "name": "My Site",
  "user_id": "uuid-optional",
  "restaurant_type": "fast_food"
}
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "overall_score": 0.76,
  "traffic_score": 0.80,
  "foot_traffic_score": 0.72,
  "competing_business_score": 0.65,
  "landslide_hazard_score": 0.10,
  "flood_hazard_score": 0.20,
  "storm_surge_score": 0.05,
  "stars": 4,
  "pros": ["High foot traffic", "Low hazard exposure"],
  "cons": ["Moderate competitor density"],
  "analyzed_at": "2026-04-19T10:00:00Z",
  "barangay_id": "063014001",
  "barangay_name": "Barangay Poblacion"
}
```

**Frontend note:** `stars` drives the pin rating display (1–5). `pros`/`cons` populate the results panel. `analysis_id` is passed to `/ai/chat`.
> Weight behavior for `restaurant_type` filter: **Insufficient data to verify frontend contract**

---

### GET `/api/v1/analysis/{analysis_id}`

**Frontend Usage:** Re-fetch a cached analysis when user re-opens a saved pin.

**Response:** Same shape as POST response above.

---

### GET `/api/v1/users/{user_id}/history`

**Frontend Usage:** Populates the saved locations / search history panel.

**Response:**
```json
{
  "items": [
    {
      "hlocation_id": "uuid",
      "name": "Site A",
      "description": "Near mall",
      "geom": { "type": "Point", "coordinates": [lon, lat] },
      "created_at": "2026-04-19T10:00:00Z",
      "barangay_id": "063014001",
      "analysis_id": "uuid",
      "google_place_id": null
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 50
}
```

---

### POST `/api/v1/users/{user_id}/history`

**Frontend Usage:** Save a visited/analyzed location to history.

**Request:**
```json
{
  "name": "Site A",
  "description": "Near mall",
  "longitude": -122.4194,
  "latitude": 37.7749,
  "analysis_id": "uuid",
  "barangay_id": "063014001",
  "google_place_id": null
}
```

**Response:** Created LocationHistory object (same shape as list item above).

---

### DELETE `/api/v1/users/{user_id}/history/{hlocation_id}`

**Response:** `{ "deleted": true }`

---

### POST `/api/v1/recommendations/generate`

**Frontend Usage:** Generate and save a recommendation for a drawn area or clicked point.

**Request:**
```json
{
  "longitude": -122.4194,
  "latitude": 37.7749,
  "user_id": "uuid",
  "name": "Recommended Site B",
  "description": "Auto-generated recommendation"
}
```

**Response:**
```json
{
  "rlocation_id": "uuid",
  "name": "Recommended Site B",
  "barangay_name": "Barangay Poblacion",
  "created_at": "2026-04-19T10:00:00Z",
  "analysis": { /* full analysis object */ }
}
```

---

### GET `/api/v1/users/{user_id}/recommendations`

**Frontend Usage:** List user's saved recommendations in the results panel.

**Response:** Paginated list of LocationRecommendation objects with nested `analysis`.

---

### GET `/api/v1/hazards/`

**Frontend Usage:** Populate hazard overlay layer on the map (toggleable).

**Query params:** `xmin`, `ymin`, `xmax`, `ymax` (bounding box of current viewport), `hazard_type` (optional filter).

**Response:**
```json
{
  "items": [
    {
      "hazard_id": "uuid",
      "hazard_type": "flood",
      "severity": "high",
      "geom": { "type": "Polygon", "coordinates": [...] },
      "last_updated": "2026-01-01T00:00:00Z"
    }
  ]
}
```

> Hazard layer toggle behavior on frontend: **Insufficient data to verify frontend contract**

---

### GET `/api/v1/hazards/proximity`

**Query params:** `longitude`, `latitude`, `radius_m` (default 500).

**Response:** Same items shape as GET /hazards/ but filtered by proximity.

---

### GET `/api/v1/traffic/`

**Frontend Usage:** Populate traffic data overlay.

**Query params:** `xmin`, `ymin`, `xmax`, `ymax`, `time_window` (optional), `traffic_type` (optional).

**Response:**
```json
{
  "items": [
    {
      "traffic_id": "uuid",
      "traffic_score": 0.75,
      "traffic_type": "vehicle",
      "geom": { "type": "Point", "coordinates": [lon, lat] },
      "source": "GMP",
      "time_window": "morning_peak",
      "last_updated": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/v1/businesses/`

**Frontend Usage:** Show competitor business markers on map.

**Query params:** `xmin`, `ymin`, `xmax`, `ymax`, `category` (optional).

**Response:**
```json
{
  "items": [
    {
      "google_places_id": "ChIJ...",
      "name": "Jollibee",
      "category": "fast_food",
      "geom": { "type": "Point", "coordinates": [lon, lat] },
      "last_updated": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/v1/barangays/`

**Frontend Usage:** Background reference layer or filter dropdown.

**Response:** Paginated list of Barangay objects (boundary as GeoJSON Polygon).

---

### GET `/api/v1/barangays/{barangay_id}`

**Response:**
```json
{
  "barangay_id": "063014001",
  "name": "Barangay Poblacion",
  "population": 12000,
  "boundary": { "type": "Polygon", "coordinates": [...] },
  "municipality": "Cebu City",
  "last_updated": "2025-01-01T00:00:00Z"
}
```

---

### POST `/api/v1/ai/chat`

**Frontend Usage:** AI assistant chat panel (right-side panel per spec).

**Request:**
```json
{
  "message": "Why is this site rated 4 stars?",
  "analysis_id": "uuid",
  "barangay_id": "063014001",
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "reply": "This site scores well due to high foot traffic and low hazard exposure...",
  "context_used": true
}
```

> Streaming vs. single response for chat: **Insufficient data to verify frontend contract**

---

### GET `/health`

**Frontend Usage:** Health check / uptime monitor (not user-facing).

**Response:** `{ "status": "ok" }`
