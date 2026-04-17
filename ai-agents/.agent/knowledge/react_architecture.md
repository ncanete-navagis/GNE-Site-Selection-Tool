# React Atomic Design Architecture: Geospatial Site Locator

This document defines the frontend architecture using Atomic Design principles. This structure ensures scalability, reusability, and clean separation of concerns for the "Map-First" interface.

## 1. Atomic Hierarchy

### Atoms (The smallest functional units)
- **`Icon`**: Adaptive SVG wrapper for Navagis Logo, Search, Chevron, and Action icons.
- **`InputBase`**: A styled HTML input with theme-aware colors and typography.
- **`Label`**: Typography component for tab names (Filter, History, Layers) and UI text.
- **`IconButton`**: A wrapper for icons with hover/active states.
- **`Avatar`**: Circular container for the user profile image.
- **`StatusBadge`**: Small dot or chip used in map markers to indicate POI status.

### Molecules (Simple groups of atoms)
- **`SearchBar`**: Combines `Icon` (Search) + `InputBase`. Handles local input state and "Clear" functionality.
- **`NavTab`**: Combines `Label` + `Icon` (Chevron) to create an interactive button.
- **`BrandIdentity`**: Combines the Navagis `Icon` (Layers) + "NAVAGIS" `Label`.
- **`ProfileMenu`**: Combines `Avatar` + optional status indicator.
- **`MarkerPin`**: Combines `Icon` + `StatusBadge` for custom Google Maps markers.

### Organisms (Complex components forming discrete sections)
- **`HeaderControlBar`**: The top-level bar containing `BrandIdentity`, `SearchBar`, and `ProfileMenu`.
- **`NavigationHub`**: A horizontal group of `NavTab` components (Filter, History, Layers).
- **`MapOverlayController`**: The floating "Control Hub" container. It wraps the `HeaderControlBar` and `NavigationHub` with glassmorphism styling (`backdrop-filter`).
- **`MapViewer`**: A wrapper for the Google Maps JS SDK instance. Responsible for marker clustering and event propagation.

### Templates (Page-level layout structures)
- **`SpatialFocusTemplate`**: A template that forces a 100vh/100vw map background with a central floating overlay slot at the top and side-panel slots for expansion.

---

## 2. Folder Structure (React/Vite)

```text
src/
├── assets/             # SVGs, Fonts, Brand Colors
├── components/
│   ├── atoms/          # Icon, Button, Avatar
│   ├── molecules/      # SearchBar, NavTab
│   ├── organisms/      # MapOverlayController, MapViewer
│   └── templates/      # SpatialFocusTemplate
├── hooks/
│   ├── useMapInstance.js   # Manages Google Maps lifecycle
│   └── useSearch.js        # Logic for debounced POI searching
├── pages/
│   └── SiteSelectionPage.jsx
├── services/           # API calls to PostGIS/Geospatial layers
├── store/              # Context API for Global UI state (Active Layer, Filter Query)
└── styles/
    └── theme.js        # Centralized constants from brand_constants.json
```

---

## 3. Component Responsibilities

| Component | Responsibility | Performance Note |
| :--- | :--- | :--- |
| **`MapViewer`** | Rendering markers and handling pan/zoom events. | Memoized to prevent re-renders on UI overlay changes. |
| **`MapOverlayController`** | Provides visual grounding and glassmorphism styling. | Uses `z-index: 10` and `pointer-events: none` on the container, `auto` on children. |
| **`SearchBar`** | Captures user intent for site discovery. | Implements 300ms debounce to limit API calls. |
| **`NavigationHub`** | Updates the global state when a user toggles "History" or "Layers". | Purely presentational; delegates state to a Context Provider. |

---

## 4. Interaction Workflow (Data Flow)

1.  **Mounting:** `SiteSelectionPage` initializes the `MapViewer` through the `useMapInstance` hook.
2.  **Navigation:** User clicks `NavTab` (Filter). The `NavigationHub` updates the `UIStateContext`.
3.  **UI Shift:** The `SpatialFocusTemplate` detects the active state and slides in a (future) SidePanel organism without reloading the map.
4.  **Spatial Update:** Search query results are passed to `MapViewer` as props, triggering a marker refresh.

> [!IMPORTANT]
> All overlay components MUST use `backdrop-filter: blur()` to maintain the "premium geospatial" aesthetic defined in the Design Specialist's instructions.
