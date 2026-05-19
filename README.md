# GNE Site Selection Tool

Welcome to the **GNE Site Selection Tool** development repository. This project is a containerized, full-stack spatial intelligence application designed to analyze and recommend optimal business sites.

The infrastructure consists of three primary services orchestrated with Docker:
1. **Frontend**: React + Vite development server running on port `5173` (with Hot Module Replacement).
2. **Backend**: FastAPI (Python 3.11) + Uvicorn server running on port `8000` (with live reload).
3. **Database**: PostgreSQL 15 + PostGIS 3.4 running on port `5432` (with a persistent named volume).

---

## 🚀 Quick Start Guide

Follow these five steps to get the entire application up and running.

### Step 1: Clone & Navigate
Ensure you are in the root directory of the workspace:
```bash
cd GNE-Site-Selection-Tool
```

### Step 2: Set Up Environment Files
You must configure three separate `.env` files (one for each layer of the stack). Example files are provided in the repository.

1. **Root `.env`** (for Docker Compose variable interpolation):
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set `POSTGRES_PASSWORD`.*

2. **Backend `.env`** (`backend/.env`):
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Edit `backend/.env` and update the database passwords, Google API credentials, and Gemini API keys.*

3. **Frontend `.env`** (`frontend/.env`):
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   *Edit `frontend/.env` and verify the `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_CLIENT_ID`, and backend API base URL.*

---

### Step 3: Launch the Docker Stack
Build and run all services in the background using Docker Compose:

```bash
docker compose up -d --build
```

*This command automatically downloads the required base images, installs frontend (`npm ci`) and backend (`pip install`) dependencies, and boots up all three containers.*

---

### Step 4: Verify the Database Connection & Tables
Once the containers are running and healthy, check that PostgreSQL with PostGIS is fully operational and display the loaded tables.

Execute the following interactive SQL inspection command in the database container:

```bash
docker exec gne_db psql -U postgres -d gne_db -c "\dt"
```

#### What this command does:
- `docker exec gne_db`: Runs a command inside the running `gne_db` container.
- `psql -U postgres -d gne_db`: Connects to the `gne_db` database using the `postgres` superuser.
- `-c "\dt"`: Instructs `psql` to execute the command to list all database tables and then exit.

*If the table structure has been seeded, you should see a list of tables including `ph_barangays`, `cebu_buildings`, `manila_buildings`, `combined_flood_hazards`, `combined_landslide_hazards`, and `combined_storm_surge_hazards`.*

---

### Step 5: Run Database Optimization (Crucial for Spatial Queries)
To speed up the spatial query analysis from ~50 seconds down to sub-second (<500ms) times, run the built-in database optimization script. This simplifies massive hazard geometries and builds spatial GIST indexes.

Execute this script directly inside the backend container:

```bash
docker exec gne_backend python scripts/optimize_db.py
```

*This process runs the automated geometric simplification and re-indexes the tables, making future API query calculations nearly instantaneous.*

---

## 📋 Environment Configuration Reference

### 1. Root Workspace Configuration (`.env`)
Used by Docker Compose to provision credentials across containers:
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_db_password
POSTGRES_DB=gne_db
PGADMIN_PASSWORD=your_pgadmin_password_here
```

### 2. Backend Configuration (`backend/.env`)
FastAPI backend requirements (Google OAuth, Maps API, and Gemini AI):
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_db_password
POSTGRES_DB=gne_db

# Async Database URLs (Note the `db` hostname instead of `localhost` when inside Docker)
DATABASE_URL=postgresql+asyncpg://postgres:your_secure_db_password@db:5432/gne_db
ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:your_secure_db_password@db:5432/gne_db

# API Credentials
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_API_KEY=your_google_maps_api_key
GEMINI_API_KEY=your_gemini_api_key

# Settings
PORT=8000
SCORING_RADIUS_M=250
ALLOWED_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
LOG_DIR=/var/log/gne
```

### 3. Frontend Configuration (`frontend/.env`)
React environment variables (prefixed with `VITE_` to be bundled by Vite):
```ini
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🛠️ Docker Compose Cheat Sheet

Here are the most common Docker Compose commands used during development:

| Action | Command |
|---|---|
| **Start Services** (Background) | `docker compose up -d` |
| **Rebuild and Start** | `docker compose up -d --build` |
| **Stop Services** | `docker compose down` |
| **Stop and Wipe Volumes** (Hard reset) | `docker compose down -v` |
| **View Service Logs** | `docker compose logs -f` |
| **View Backend Logs** | `docker compose logs -f backend` |
| **View Frontend Logs** | `docker compose logs -f frontend` |
| **Check Container Status** | `docker compose ps` |

---

## 🌐 Service Access Ports

Once the Docker Compose stack is running, you can access the components at the following local addresses:

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend (API Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Database Connection (Host Machine)**: Host: `localhost` \| Port: `5432` \| User: `postgres`
