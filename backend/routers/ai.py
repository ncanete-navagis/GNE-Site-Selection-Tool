"""
routers/ai.py — FastAPI router for AI chat interactions.

Implemented by: API_SPECIALIST / SECURITY_SPECIALIST
Version: 2.0 | May 2026 (Prompt C — AI routing determination)

AI ROUTING DETERMINATION (Prompt C — Task 3D):
  The frontend calls the BACKEND as a proxy at http://localhost:5000/chat
  (see frontend/src/hooks/useGeminiChat.js line 9: BACKEND_URL).
  The frontend reads the "response" field from the JSON reply.

  This FastAPI app runs on port 8000.  The port 5000 proxy (Node.js / Express
  or similar) is a SEPARATE service that is NOT part of this FastAPI codebase.
  That proxy calls Gemini and returns {"response": "..."}.

  The /api/v1/ai/chat endpoint below is a BACKEND-ONLY UTILITY and is NOT
  called by the frontend directly.  It is preserved for internal tooling,
  admin scripts, and future direct integration.

  # Frontend handles AI via port-5000 Node.js proxy — this endpoint is
  # backend-only utility.
"""

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from models.user import User
from core.security import get_current_user
from core.rate_limit import limiter

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"]
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    # Field name matches what the frontend reads from the proxy response.
    # Frontend reads: data.response (see useGeminiChat.js line 71)
    response: str


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat_with_ai(
    request: Request,
    payload: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Interact with the AI assistant (backend-only utility endpoint).

    NOTE: The frontend calls the port-5000 Node.js proxy, NOT this endpoint.
    See module docstring for full routing explanation.

    Rate limited to 20 requests per minute.
    """
    # Placeholder for direct backend AI integration
    return {"response": f"AI response to: {payload.message}"}
