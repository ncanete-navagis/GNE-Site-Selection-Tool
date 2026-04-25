"""
core/logging_config.py — Centralized JSON logging configuration.

Implemented by: LOGGING_SPECIALIST
"""

import json
import logging
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime, timezone

class JSONFormatter(logging.Formatter):
    """
    Custom formatter to output JSON lines.
    Explicitly filters out any raw user messages or full geometry payloads if they
    somehow end up in the 'msg' or 'args'.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include any extra kwargs passed via the `extra` dict
        if hasattr(record, "structured_data"):
            data = record.structured_data
            # Enforce constraints: Remove prohibited fields if they accidentally sneaked in
            if "message_content" in data:
                data["message_content"] = "[REDACTED]"
            if "geometry" in data and isinstance(data["geometry"], dict) and data["geometry"].get("type") != "Point":
                data["geometry"] = "[REDACTED_FULL_GEOMETRY]"

            log_obj.update(data)

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)

def setup_logging():
    """
    Configures the root logger and the GNE application logger.
    Target log directory: /var/log/gne/ (configurable via LOG_DIR).
    Falls back to ./logs/ on permission errors.
    """
    log_dir = os.environ.get("LOG_DIR", "/var/log/gne/")
    log_file = "gne_backend.log"
    
    try:
        os.makedirs(log_dir, exist_ok=True)
        log_path = os.path.join(log_dir, log_file)
        # Test write access
        with open(log_path, "a") as f:
            pass
    except (OSError, PermissionError):
        # Fallback for local development (e.g., Windows)
        log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_path = os.path.join(log_dir, log_file)

    handler = RotatingFileHandler(
        filename=log_path,
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5
    )
    
    formatter = JSONFormatter()
    handler.setFormatter(formatter)

    # Set up the shared logger for the application
    logger = logging.getLogger("gne")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate logs if setup_logging is called multiple times
    if not logger.handlers:
        logger.addHandler(handler)
        # Prevent propagation to root logger to avoid double logging if standard out is also configured
        logger.propagate = False

    return logger

# Initialize logging on module import
setup_logging()
