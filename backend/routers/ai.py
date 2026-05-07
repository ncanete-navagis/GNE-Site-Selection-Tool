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

import os
from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from google import genai

from models.user import User
from core.security import get_current_user
from core.rate_limit import limiter
from core.config import settings

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"]
)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = None
    poiContext: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str

SYSTEM_INSTRUCTION = """Identity:
You are the "Navagis Real Estate Agent," an advanced AI geospatial consultant specialized in commercial site selection and property evaluation. You are a core component of the Navagis Site Selection Tool.

Core Mission:
Your goal is to provide deep, analytical, and actionable insights about a specific map coordinate or Point of Interest (POI). You must evaluate whether a location is a "Strong Match," "Viable," or "High Risk" for a restaurant venture based on geospatial data.

Knowledge Domains:
1. Foot Traffic Analysis
2. Competitive Landscape
3. Universal Accessibility
4. Demographics & Target Audience
5. Spatial Reasoning

Tone: Professional, data-driven, approachable, and precise.

Constraints:
- Focus on Cebu City area.
- Keep responses concise (max 3 paragraphs).
- Always end with a clarifying question about the user's restaurant plans."""

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat_with_ai(
    request: Request,
    payload: ChatRequest,
    # current_user: User = Depends(get_current_user) # Optionally uncomment if you require auth
):
    """
    Interact with the AI assistant.
    Proxies requests to Gemini just like the old Node.js proxy.
    """
    if not payload.message:
        raise HTTPException(status_code=400, detail="Message is required")

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set in backend")

    system_prompt = SYSTEM_INSTRUCTION
    if payload.poiContext:
        title = payload.poiContext.get('title', 'Unknown')
        poi_type = payload.poiContext.get('type', 'Unknown')
        rating = payload.poiContext.get('rating', 'N/A')
        system_prompt += f"\n\nContext: Analyzing {title} ({poi_type}) with rating {rating}."

    try:
        client = genai.Client(api_key=api_key)
        
        contents = payload.history or []
        contents.append({"role": "user", "parts": [{"text": payload.message}]})
        
        # We need to restructure contents format depending on SDK expectations, but genai usually handles dicts fine.
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=contents,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        
        return {"response": response.text}
    except Exception as e:
        print("Gemini API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to communicate with Gemini API")
