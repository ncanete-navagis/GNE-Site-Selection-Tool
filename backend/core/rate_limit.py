"""
core/rate_limit.py — Rate limiter setup for FastAPI.
"""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import json
import base64

def get_user_id_from_request(request: Request) -> str:
    """
    Extracts the user_id (sub) from the Bearer token for rate limiting.
    Falls back to the client IP address if token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            # Basic JWT decode without verification (just to extract 'sub' for the key)
            # Security: The actual endpoint will still verify the token.
            parts = token.split(".")
            if len(parts) == 3:
                payload_padding = len(parts[1]) % 4
                padded_payload = parts[1] + ("=" * payload_padding)
                payload_json = base64.urlsafe_b64decode(padded_payload).decode('utf-8')
                payload = json.loads(payload_json)
                if "sub" in payload:
                    return payload["sub"]
        except Exception:
            pass
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_id_from_request)
