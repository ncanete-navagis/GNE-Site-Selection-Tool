# ─────────────────────────────────────────────────────────────────────────────
# Frontend Dockerfile — React + Vite (Dev Mode with HMR)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Install dependencies first — this layer is cached unless package.json changes.
# Source code is volume-mounted at runtime (docker-compose.yml):
#   ./frontend:/app  +  /app/node_modules (anonymous volume preserves container's node_modules)
# so we intentionally do NOT COPY src/ here.
COPY package*.json ./
RUN npm ci

EXPOSE 5173

# --host 0.0.0.0  → exposes Vite's dev server outside the container
# --port 5173     → explicit (matches docker-compose port mapping)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
