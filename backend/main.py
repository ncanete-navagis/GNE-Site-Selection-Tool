"""
main.py — FastAPI application entry point.

Implemented by: LOGGING_SPECIALIST / API_SPECIALIST
Version: 2.0 | May 2026 (Prompt C — CORS from settings, barangays router added)
"""

import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError, DBAPIError
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from core.config import settings
from utils.logger import log_request
from core.rate_limit import limiter
from routers import recommendations, users, ai, location_history, barangays

app = FastAPI(
    title="GNE Site Selection Tool API",
    version="1.1",
    description="Backend API for the GNE platform."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # from core/config.py → ALLOWED_ORIGINS env var
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """
    Middleware to inject standard security headers.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(SQLAlchemyError)
@app.exception_handler(DBAPIError)
async def database_error_handler(request: Request, exc: Exception):
    """
    Global exception handler for database errors to prevent data leakage.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred."}
    )

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """
    Middleware to log every incoming HTTP request.
    Calculates duration and extracts user_id if present.
    """
    start_time = time.perf_counter()
    
    # Try to extract user_id from headers (e.g., X-User-Id) or fallback to None
    # Adjust this based on actual authentication mechanism implementation
    user_id = request.headers.get("x-user-id")
    
    response = await call_next(request)
    
    duration_ms = (time.perf_counter() - start_time) * 1000.0
    
    log_request(
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=duration_ms,
        user_id=user_id
    )
    
    return response

# Include routers
app.include_router(users.router)
app.include_router(recommendations.router)
app.include_router(ai.router)
app.include_router(location_history.router)
app.include_router(barangays.router)

@app.get("/health")
def health_check():
    """
    Simple health check endpoint.
    """
    return {"status": "ok"}
