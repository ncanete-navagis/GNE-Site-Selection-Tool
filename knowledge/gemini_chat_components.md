# React Component Architecture: Gemini AI Chat Interface
## Atomic Design & State Management Plan

This document breaks down the Gemini-powered "Real Estate Agent" chat into a hierarchical component system, optimized for performance and modularity within the Navagis Site Selection Tool.

---

## 1. Atomic Component Breakdown

### Atoms (Level 1)
| Component Name | Description | Props |
| :--- | :--- | :--- |
| `ChatAvatar` | Circular image/icon for the Navagis AI agent. | `src`, `size` |
| `TextPrimitive` | Base text renderer for message content. | `children`, `variant` |
| `TypingDots` | Animated "..." indicator showing the AI is thinking. | `color` |
| `ActionIcon` | Functional icon button for Sending or Retrying. | `iconName`, `onClick`, `disabled` |
| `ScrollContainer` | Wrapper with managed scrollbars and auto-bottom logic. | `children`, `autoScroll` |

### Molecules (Level 2)
| Component Name | Description | Props |
| :--- | :--- | :--- |
| `UserBubble` | Message bubble styled for the user (Right-aligned). | `message`, `timestamp` |
| `AIBubble` | Message bubble styled for the AI (Left-aligned + Avatar). | `message`, `timestamp` |
| `AiLoadingBubble` | A message bubble placeholder with `TypingDots`. | `avatarSrc` |
| `ChatInputField` | A styled input area with integrated send button. | `value`, `onChange`, `onSend` |
| `ErrorMessage` | Inline error notification with a retry action. | `error`, `onRetry` |

### Organisms (Level 3)
| Component Name | Description | Props |
| :--- | :--- | :--- |
| `MessageList` | Manages the rendering loop of `UserBubble` and `AIBubble`. | `messages[]` |
| `GeminiChatPanel` | The complete chat module (History + Input + Header). | `poiId`, `context` |

---

## 2. State Management Design

### Custom Hook: `useGeminiChat`
A specialized hook to encapsulate API logic and state transitions.

**State Model:**
```typescript
interface ChatState {
  history: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    status: 'sending' | 'delivered' | 'error';
  }>;
  isProcessing: boolean;
  error: string | null;
}
```

**Exposed Methods:**
- `sendMessage(text: string)`: Optimistic update + API call.
- `retryLastMessage()`: Resends the failed message.
- `clearThread()`: Resets history for the current POI.

---

## 3. Communication Strategy

1. **Context Injection:** When initialized, the `GeminiChatPanel` receives the current `POI` data as context. This ensures the first AI greeting is context-aware (e.g., "Hi! I see you clicked on Ayala Center Cebu...").
2. **Optimistic Updates:** User messages are added to the `history` array immediately with a `sending` status to ensure zero-latency perception.
3. **Ref Management:** A `lastMessageRef` is used within `MessageList` to trigger `scrollIntoView()` whenever the history length changes.

---

## 4. Visual Implementation Patterns (CSS/Style)

- **Message Threading:** Small `4px` gap between messages from the same sender; `16px` gap between different senders.
- **Glassmorphism:** The `AIMessageBubble` uses a subtle backdrop-blur if it overlaps map elements (though usually contained in the dark popup).
- **Transitions:** Use `framer-motion` (or standard CSS transitions) for:
  - New message slide-up: `0.3s ease-out`.
  - Loading dots pulse: `1.5s infinite`.

---

## 5. Folder structure Recommendation
```text
src/components/
  ├── atoms/
  │   └── TypingDots/
  ├── molecules/
  │   ├── UserBubble/
  │   ├── AIBubble/
  │   └── ChatInputField/
  ├── organisms/
  │   └── MessageList/
  └── hooks/
      └── useGeminiChat.ts
```
