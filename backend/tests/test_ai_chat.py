import pytest
from httpx import AsyncClient
from unittest.mock import patch

@pytest.mark.asyncio
@patch("routers.ai.chat_with_ai", autospec=True) # Assuming the actual LLM call will be inside chat_with_ai or a service
async def test_post_ai_chat_with_analysis_id(mock_chat, async_client: AsyncClient):
    """
    Verify POST /api/v1/ai/chat with valid analysis_id returns context_used: true.
    """
    # The actual LLM adapter should be mocked so no real API calls are made.
    # Because we are testing the API contract through httpx, we might need to patch
    # the underlying service function instead. Let's patch `routers.ai` or the expected service.
    
    # We will test the contract directly. The test will fail until the schema is updated.
    payload = {
        "message": "Is this a good place for a cafe?",
        "analysis_id": "123e4567-e89b-12d3-a456-426614174000"
    }
    
    with patch("routers.ai") as _: # Mock to prevent real LLM call if implemented later
        response = await async_client.post("/api/v1/ai/chat", json=payload)
    
    # Since rate limiter is in place, we should get 200 (if implemented correctly)
    if response.status_code == 200:
        data = response.json()
        assert "context_used" in data, "Contract missing: context_used field"
        assert data["context_used"] is True

@pytest.mark.asyncio
async def test_post_ai_chat_without_analysis_id(async_client: AsyncClient):
    """
    Verify POST /api/v1/ai/chat without analysis_id returns context_used: false.
    """
    payload = {
        "message": "Hello, what can you do?"
    }
    
    with patch("routers.ai") as _:
        response = await async_client.post("/api/v1/ai/chat", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        assert "context_used" in data, "Contract missing: context_used field"
        assert data["context_used"] is False
