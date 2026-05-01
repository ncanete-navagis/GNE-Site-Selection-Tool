# React Component Architecture: Marker Information & AI Assistant Popup
## Atomic Design Breakdown

Following the Senior Frontend Engineer and Atomic Design specialist guidelines, the following architecture breaks down the marker popup into modular, high-granularity React components.

---

## 1. Component Hierarchy (Atomic Structure)

### Atoms (The Building Blocks)
Smallest, primitive functional units. Abstracted from business logic.

| Component Name | Description | Props |
| :--- | :--- | :--- |
| `Typography` | Unified text element for headings, labels, and body text. | `variant`, `color`, `weight`, `children` |
| `Icon` | SVG wrapper for Stars, Accessibility, and Send icons. | `name`, `size`, `color` |
| `Avatar` | Circular container for the AI assistant agent logo. | `src`, `size` |
| `Surface` | Base container with customizable elevation, corners, and padding. | `elevation`, `radius`, `backgroundColor`, `children` |
| `Input` | Raw text input field with placeholder handling. | `value`, `onChange`, `onKeyDown`, `placeholder` |
| `Button` | Primitive interaction element (used for Icon buttons). | `onClick`, `icon`, `disabled` |

### Molecules (Functional Groups)
Simple groups of atoms working together.

| Component Name | Description | Props |
| :--- | :--- | :--- |
| `RatingDisplay` | Combines numerical value, star icons, and review count. | `rating`, `reviewCount` |
| `CategoryTag` | Combines a category icon with metadata text. | `label`, `iconName` |
| `ChatBubble` | Displays a message with AI avatar and relative positioning. | `text`, `type ('ai'\|'user')`, `avatarSrc` |
| `SearchInput` | A styled input field with a docked action icon (Send). | `placeholder`, `onSend` |
| `ComparisonLabel` | Column header for Pros/Cons sections. | `title`, `isPositive` |

### Organisms (Feature Modules)
Complex components forming a distinct section of the interface.

| Component Name | Description | Props |
| :--- | :--- | :--- |
| `LocationHeaderCard` | The white elevated card containing primary location info. | `title`, `rating`, `count`, `category` |
| `ProsConsGrid` | Layout grid for displaying advantages and disadvantages. | `pros[]`, `cons[]` |
| `AIAssistantPanel` | The container for chat history and interactive input. | `messages[]`, `onSendMessage` |

### Templates / High-Level Component
The integration layer that creates the final "Marker Popup" organism.

| Component Name | Description | Role |
| :--- | :--- | :--- |
| `MarkerPopup` | The top-level feature component. | Coordinates data flow between Header, Pros/Cons, and Chat. |

---

## 2. Recommended Folder Structure

Organizing by atomic level inside the components directory ensures scalability and prevents "component soup."

```text
src/
└── components/
    ├── atoms/
    │   ├── Typography/
    │   ├── Icon/
    │   ├── Avatar/
    │   ├── Surface/
    │   └── Input/
    ├── molecules/
    │   ├── RatingDisplay/
    │   ├── CategoryTag/
    │   ├── ChatBubble/
    │   └── SearchInput/
    ├── organisms/
    │   ├── LocationHeaderCard/
    │   ├── ProsConsGrid/
    │   └── AIAssistantPanel/
    └── features/
        └── MarkerPopup/
            ├── MarkerPopup.tsx
            ├── MarkerPopup.module.css
            └── MarkerPopup.hooks.ts
```

---

## 3. Anticipated Prop Types & Data Schema

### `LocationData` Interface
```typescript
interface LocationData {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  hasAccessibility: boolean;
  pros: string[];
  cons: string[];
}
```

### `ChatMessage` Interface
```typescript
interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}
```

---

## 4. Visual Implementation Strategies (Tailored to UI Spec)

- **Color Tokens:** Use CSS variables (e.g., `--bg-primary: #2B2D31`, `--bg-header: #FFFFFF`) for consistency.
- **Micro-interactions:** 
  - `ChatBubble`: Slide-in animation for new AI messages.
  - `SearchInput`: Focus ring transition using `300ms` ease-in-out.
- **Portals:** The `MarkerPopup` should likely be rendered via a React Portal to ensure it sits atop the Google Maps overlay layers without Z-index conflicts.

---

## 5. Metadata & Versioning
- **Status:** Draft (Architecture Only)
- **Specialist:** React Atomic Design Specialist
- **Mapping Target:** Google Antigravity Overlay System
