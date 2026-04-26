# GNE Backend — Overview Prompt (Antigravity Regeneration)
> **Purpose:** Reusable Antigravity prompt. Run this at any time to regenerate
> `BLUEPRINT.md` in sync with the current backend implementation.
> **Agent:** `API_SPECIALIST` (primary) + `GIS_DATABASE_ENGINEER` (spatial sections)

---

## Reusable Prompt (copy-paste into Antigravity)

```
Initialize the API_SPECIALIST using the definitions in ai-agents/.agent/agents/API_SPECIALIST.md.
Also initialize the GIS_DATABASE_ENGINEER from ai-agents/.agent/agents/GIS_DATABASE_ENGINEER.md
for the geospatial sections.

Task: Read the current GNE backend folder and regenerate backend/BLUEPRINT.md to reflect
the actual implementation state.

Steps:
1. Read all files in:
   - backend/routers/         → extract current endpoint list
   - backend/models/          → extract current ORM fields
   - backend/services/        → extract current service logic
   - backend/ai/              → extract AI pipeline state
   - backend/ingestion/       → extract ingestion pipeline state
   - backend/core/            → extract config and security approach
   - backend/Dockerfile + docker-compose.yml → extract deployment config

2. For each section of BLUEPRINT.md, update to match the implementation:
   - System architecture diagram
   - API endpoint catalog (method, path, description, request/response)
   - Scoring engine structure (sub-scores and overall_score formula)
   - AI assistant pipeline (prompt structure, LLM adapter status)
   - Data ingestion pipeline
   - Backend folder structure (actual, not planned)
   - Build phases checklist (mark completed phases ✅)
   - Assumptions — update any that have been resolved; keep unresolved ones labeled
     "Insufficient data to verify"

3. Do NOT:
   - Invent or add schema fields not present in the actual model files
   - Modify any frontend assumptions
   - Create new agents or files outside BLUEPRINT.md

4. Output: Overwrite backend/BLUEPRINT.md with the updated content.
   Preserve the original section order and heading structure.

Authoritative ERD (do not override from code — flag any discrepancy as a warning):

User: user_id, email, full_name, created_at, last_login
Business: google_places_id (PK), name, category, geom, last_updated
Hazards: hazard_id (PK), hazard_type, severity, geom, last_updated
Traffic Data: traffic_id (PK), traffic_score, traffic_type, geom, source, time_window, last_updated
Location History: hlocation_id (PK), user_id (FK), barangay_id (FK), analysis_id (FK),
                  name, description, geom, created_at, google_place_id
Location Recommendation: rlocation_id (PK), user_id (FK), barangay_id (FK), analysis_id (FK),
                          name, description, geom, created_at, google_place_id
Barangay: barangay_id (PK/PSGC), name, population, boundary, municipality, last_updated
Analysis: analysis_id (PK), overall_score, traffic_score, foot_traffic_score,
          competing_business_score, landslide_hazard_score, flood_hazard_score,
          storm_surge_score, analyzed_at, analysis_details, last_updated

If any model file contains a field NOT in the ERD above, flag it as:
⚠️  SCHEMA DRIFT DETECTED: [model file] has field [field_name] not present in ERD.
    Confirm with Earl (GIS & Data Lead) before proceeding.
```

---

## When to Run This Prompt

| Trigger | Action |
|---|---|
| After completing any Prompt Sequence step | Run to update BLUEPRINT.md |
| Before a code review or team sync | Run to ensure docs match code |
| After Earl updates the DB schema | Run and check for ⚠️ SCHEMA DRIFT warnings |
| Before deployment | Run to produce final documentation snapshot |
