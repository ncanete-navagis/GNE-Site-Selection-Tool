# Behavioral Design: Gemini-Powered "Real Estate Agent" Chat Interface

This document defines the UX/UI behavior and interaction flow for the AI Chat interface within the Marker Popup. This design ensures a premium, responsive, and "intelligent" feel that aligns with the Navagis brand identity.

---

## 1. Chat UI Behavior & Interactions

### Dynamic Scrolling
- The chat container automatically scrolls to the **bottom** upon receipt of a new message (User or AI).
- **Manual Override:** If the user manually scrolls up to read history, auto-scroll is paused until they reach the bottom again or click a "New Message" indicator.

### Input Interaction
- **Trigger:** Pressing `Enter` sends the message. `Shift + Enter` creates a manual line break.
- **Empty State:** The "Send" icon remains at 30% opacity and is non-functional if the input is empty or contains only whitespace.
- **Auto-resize:** The text input maintains a fixed height as per design, but supports horizontal scrolling for long queries to keep the UI compact.

---

## 2. Message Flow (User ↔ AI)

1. **User Action:** Types query (e.g., "Tell me about the foot traffic here") and hits Send.
2. **Local Echo (Optimistic UI):** The user's message is instantly added to the chat history with a "Sending..." status indicator.
3. **API Invocation:** A request is dispatched to the Gemini API (via backend proxy or direct SDK).
4. **AI Stream/Block:** As Gemini generates the response, the UI displays message bubbles. *Streamed responses are preferred to reduce perceived latency.*
5. **Completion:** Once the response is fully received, the "Sending..." indicator on the user's message disappears, and the AI message is finalized.

---

## 3. Loading, Success, and Error States

### Loading (The "Thinking" Phase)
- **Visual:** A dedicated message bubble appears with a "typing pulse" (three dots animation) or a subtle glowing border around the AI Avatar.
- **State:** The input field remains active for further typing, but the "Send" button is disabled until the current response is complete.

### Error Handling
- **System Level:** "Unable to connect to the Navagis Agent. Please check your connection."
- **Contextual Level:** If the API fails, an error bubble appears with a red-tinted background and a **"Retry"** button.
- **Validation:** If the user enters an invalid query, the AI responds with a helpful clarification rather than a generic error.

---

## 4. Conversation History Handling

- **Session Persistence:** Conversations are stored in the local React component state. 
- **Reload Continuity:** To prevent data loss during accidental accidental refreshes, history is serialized to `sessionStorage`.
- **Concurrency:** Each marker (POI) has its own unique conversation thread. Switching markers preserves the history for the previous marker in memory for the duration of the browser session.
- **Reset:** A "Reset Conversation" action is hidden behind a sub-menu to allow users to start fresh.

---

## 5. AI Personality & User Experience

### Character Definition: "The Insightful Advisor"
- **Tone:** Professional, analytical, and courteous.
- **Vocabulary:** Uses industry-standard terms like "Demographics," "Zoning," "Accessibility," and "Retention."
- **Identity:** Always introduces itself (if asked) as the *Navagis Interactive Real Estate Assistant*.

### Behavioral Rules
- **Data-Driven:** The AI should prioritize using the data visible in the popup (Ratings, Pros/Cons, Accessibility) in its answers.
- **Concise:** Responses should be limited to 2-3 short paragraphs to fit the vertical constraints of the popup panel.
- **Proactive:** If the AI notices a recurring theme (e.g., questions about parking), it may suggest a related insight (e.g., "Would you like to see the nearby transit scores?").

---

## 6. Visual Summary of Hierarchy
1. **Latest Insight:** The bottom-most message is always the primary focus.
2. **Context:** The message bubbles are grouped closely by sender to maintain visual connection.
3. **Action:** The Input bar is always docked at the bottom, providing a consistent "next step" for the user.
