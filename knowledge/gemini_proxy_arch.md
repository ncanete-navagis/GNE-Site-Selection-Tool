# Backend Architecture: Gemini API Proxy Server

To ensure the security of our Google AI credentials and resolve cross-origin (CORS) constraints for the Site Selection Tool, we are implementing a lightweight Node.js proxy server.

---

## 1. Technical Stack Selection

- **Runtime:** Node.js (LTS version)
- **Framework:** **Express.js** — Selected for its minimal footprint and robust middleware ecosystem, perfectly suited for simple request forwarding and transformation.
- **Protocol:** HTTP/JSON (REST)
- **Module System:** ES Modules (matching the Vite frontend).

---

## 2. Directory & Structure Design

Following clean code and DevOps best practices, the server is decoupled into specific responsibility layers:

```text
backend/
├── src/
│   ├── config/         # Server and SDK configurations
│   ├── controllers/    # Request handling logic
│   ├── routes/         # API endpoint definitions
│   ├── middleware/      # CORS and Validation logic
│   └── index.js         # Entry point (Server initialization)
├── .env                 # Sensitive environment variables
├── .gitignore           # Excluding node_modules and .env
├── package.json         # Backend dependencies
└── README.md
```

---

## 3. Required Dependencies

| Package | Purpose |
| :--- | :--- |
| `express` | Core web framework. |
| `@google/generative-ai` | Official SDK for Gemini interaction. |
| `cors` | To securely allow requests from the React dev server (localhost:5173). |
| `dotenv` | Processing secret variables from the `.env` file. |
| `helmet` | Setting security-centric HTTP headers. |
| `morgan` | Request logging for development debugging. |
| `joi` | (Optional) Schema validation for incoming chat payloads. |

---

## 4. Environment Variables Strategy

The **`.env`** file remains strictly on the server and is never committed to source control.

```env
PORT=5000
GEMINI_API_KEY=AIza... (Your Private Key)
ALLOWED_ORIGIN=http://localhost:5173
```

- **Security Benefit:** Moving the `GEMINI_API_KEY` from the frontend (`VITE_GEMINI_API_KEY`) to the backend environment variables prevents the key from being exposed in the browser's Network tab or source code.

---

## 5. Request & Data Flow

### Endpoint: `POST /api/generate-site-insights`

1. **Frontend Request:** React sends a JSON payload containing the `history` and `poiContext`.
2. **CORS Validation:** The `cors` middleware verifies the request origin.
3. **Payload Sanitization:** The controller validates that the message history is properly formatted.
4. **Proxy Dispatch:** The backend initializes the Gemini SDK with the **server-side** API Key and forwards the prompt.
5. **Masked Response:** The AI response is relayed back to the React client.

---

## 6. Frontend Integration Plan

Once the proxy is live, the frontend `useGeminiChat` hook will be refactored:

- **SDK Removal:** The `@google/generative-ai` dependency will be removed from the frontend.
- **Fetch Logic:** Replacing the direct SDK call with a standard `fetch()` or `axios` call to `http://localhost:5000/api/generate-site-insights`.
- **Bundle Optimization:** This reduces the client bundle size and centralizes logic for future model upgrades (e.g., switching to Vertex AI).
