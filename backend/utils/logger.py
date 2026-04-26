"""
utils/logger.py — Domain-specific logging helpers for the GNE backend.

Implemented by: LOGGING_SPECIALIST
"""

import logging
from typing import Optional, Dict, Any

# Ensure configuration is loaded
import core.logging_config

# Get the configured shared logger
_logger = logging.getLogger("gne")

def log_request(method: str, path: str, status_code: int, duration_ms: float, user_id: Optional[str] = None):
    """
    Log an incoming HTTP request.
    """
    _logger.info(
        f"{method} {path} - {status_code}",
        extra={"structured_data": {
            "event": "http_request",
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": duration_ms,
            "user_id": user_id
        }}
    )

def log_scoring_engine_call(lon: float, lat: float, sub_scores: Dict[str, float], duration_ms: float):
    """
    Log a call to the scoring engine.
    Ensures only the centroid (lon/lat) is logged.
    """
    _logger.info(
        "Scoring engine call completed",
        extra={"structured_data": {
            "event": "scoring_engine_call",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "sub_scores": sub_scores,
            "duration_ms": duration_ms
        }}
    )

def log_ai_chat_call(analysis_id: str, duration_ms: float, provider: str):
    """
    Log an AI chat interaction.
    Message content is deliberately excluded for privacy.
    """
    _logger.info(
        "AI chat call completed",
        extra={"structured_data": {
            "event": "ai_chat_call",
            "analysis_id": str(analysis_id),
            "duration_ms": duration_ms,
            "provider": provider
        }}
    )

def log_ingestion_run(entity_type: str, records_loaded: int, records_failed: int, duration_ms: float):
    """
    Log a data ingestion run.
    """
    _logger.info(
        f"Ingestion run completed for {entity_type}",
        extra={"structured_data": {
            "event": "ingestion_run",
            "entity_type": entity_type,
            "records_loaded": records_loaded,
            "records_failed": records_failed,
            "duration_ms": duration_ms
        }}
    )

def log_error(event: str, message: str, **kwargs):
    """
    Log an ERROR level event (e.g., DB connection failures, LLM API failures, ingestion errors).
    """
    structured_data = {"event": event}
    structured_data.update(kwargs)
    _logger.error(
        message,
        extra={"structured_data": structured_data}
    )

def get_logger() -> logging.Logger:
    """
    Return the base logger instance for generic logging needs.
    """
    return _logger
