# API Integration Design: Gemini AI & React Frontend

This document details the secure communication protocol and request orchestration for integrating the Google Gemini API into the Navagis Site Selection Tool.

---

## 1. Security & Authentication

### API Key Management
- **Local Development:** The API key is stored in the root `.env` file as `VITE_GEMINI_API_KEY`.
- **Frontend Access:** The `VITE_` prefix allows the Vite build tool to inject the key into `import.meta.env`.
- **Security Caution:** While direct client-side calls are acceptable for this interactive demo, a production environment **must** use a backend proxy (Node.js/Express) to mask the API key and prevent unauthorized quota consumption.

---

## 2. Request Orchestration

### Model Configuration
- **Target Model:** `gemini-1.5-flash` (Optimized for low-latency interactive chat).
- **Library:** `@google/generative-ai` (Official Google AI JavaScript SDK).

### Payload Structure
Requests to the Gemini API will follow the Chat Session schema:
```json
{
  "contents": [
    {
       "role": "user",
       "parts": [{ "text": "Hi, what can you tell me about this location?" }]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 400,
    "temperature": 0.7
  }
}
```

---

## 3. Personality & Context Injection

### The "Real Estate Agent" Persona
Personality is enforced using **System Instructions**. This primary directive is set during model initialization and persists across the thread.

**System Prompt Template:**
> "You are the Navagis AI Real Estate Agent, a sophisticated geospatial advisor. Your tone is professional, analytical, and data-driven. You provide insights into commercial real estate development, zoning, and site selection. You are helping a developer analyze locations in Cebu City."

### Dynamic Grounding (POI Context)
To ensure the AI is aware of the specific marker selected, the system instruction is dynamically extended whenever a new popup is opened:
> "Context: You are currently discussing [POI_NAME], a [CATEGORY] with a rating of [RATING]/5. Access information: [ACCESSIBILITY_STATUS]."

---

## 4. Conversation History Management

### Context Windowing
To maintain meaningful dialogue without exceeding token limits or increasing costs:
- **History Retention:** The SDK's `startChat({ history: [...] })` method is used.
- **Pruning:** If the conversation exceeds 10 messages, older messages are pruned from the history sent to the API, while remaining visible in the local UI list for the user.

---

## 5. Integration Workflow

1. **Initialization:** The React `useGeminiChat` hook initializes the `GoogleGenerativeAI` instance.
2. **Preprocessing:** When the user hits send, the hook retrieves the latest 5-10 messages from state.
3. **Dispatch:** The hook calls `model.startChat().sendMessage()`.
4. **Stream Handling:** The UI listens for the completion of the generative task (or handles streams for a "typing" effect).
5. **Post-processing:** The response is validated and appended to the local `history` state.

---

## 6. Error & Boundary Cases
- **Quota Exceeded (429):** The UI will display a "Service Busy" message.
- **Safety Filtering:** The SDK's built-in safety settings are configured to `BLOCK_MEDIUM_AND_ABOVE` for harassment and hate speech to ensure professional conduct.
