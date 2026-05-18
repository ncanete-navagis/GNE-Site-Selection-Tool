# ─────────────────────────────────────────────────────────────────────────────
# Backend Dockerfile — FastAPI + Uvicorn (Python 3.11)
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

WORKDIR /app

# System dependencies:
#   gcc, libpq-dev   → required to compile psycopg2
#   gdal-bin         → GDAL CLI tools (used by generate_map_tiles.py)
#   libgdal-dev      → GeoAlchemy2 / PostGIS geometry operations
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        gdal-bin \
        libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies before copying source for better layer caching.
# When only source changes (not requirements), this layer is reused.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create log directory (LOG_DIR=/app/logs, set by docker-compose)
RUN mkdir -p /app/logs

# Source code is volume-mounted at runtime (docker-compose.yml):
#   ./backend:/app
# so we intentionally do NOT COPY . . here — keeps the image lean
# and ensures the live-mount is the single source of truth.

EXPOSE 8000

# --reload watches for file changes in the volume-mounted source.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
