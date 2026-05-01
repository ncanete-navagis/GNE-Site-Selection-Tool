# React Atomic Design Architecture (v2)

This document outlines the React component architecture based on the v2 UI Blueprint for the Geospatial Site Selection Dashboard. It follows Atomic Design principles, tailored for a map-centric application using the Google Antigravity SDK.

## 1. Folder Structure

```text
frontend/src/
├── components/
│   ├── atoms/          # Smallest building blocks (buttons, inputs, icons)
│   ├── molecules/      # Simple combinations of atoms (search fields, toggles)
│   ├── organisms/      # Complex UI sections (nav bars, map canvas, HUD)
│   └── templates/      # Page-level layouts without injected data
├── pages/              # Route-level components handling data fetching & state
├── hooks/              # Custom React hooks (e.g., useMapBounds, useSearch)
├── store/              # Global state management (Zustand/Redux)
└── styles/             # Global CSS, theme variables, and design tokens
```

## 2. Component Hierarchy & Responsibilities

### 2.1 Atoms
Atoms are pure, stateless presentational components. They rely entirely on props and do not connect to the global state.

*   **`Icon`**: A generic wrapper for SVG icons (Search, Filter, Layers, Chevron, MapPin).
*   **`Button`**: A base interactive element with variants (primary, secondary, ghost, floating).
*   **`Input`**: A base unstyled text input field.
*   **`AvatarImage`**: A simple circular image component.
*   **`Typography`**: Standardized text components (headers, body, labels).
*   **`PillBase`**: A reusable rounded rectangle container used as the background for floating elements.

### 2.2 Molecules
Molecules combine two or more atoms to form a functional unit. They may hold transient, local UI state (like hover or simple toggle states) but generally remain agnostic of business logic.

*   **`SearchField`**: Combines `Input` and `Icon` (magnifying glass).
*   **`DropdownButton`**: Combines `Button`, `Typography` (label), and two `Icon`s (e.g., Filter icon + Chevron). Manages its open/closed UI state.
*   **`ModeToggle`**: Combines `PillBase` and two text labels ("Manual", "AI"). Manages the animated active state indicator.
*   **`UserAvatar`**: Combines `AvatarImage` with a styled outer container that provides the cyan glowing effect.
*   **`FloatingActionButton` (FAB)**: Combines a circular `Button` variant with a specific `Icon`.
*   **`BrandLogo`**: Combines the Navagis isometric icon and the text "NAVAGIS".
*   **`MapMarker`**: The UI representation of a pin (e.g., the pink teardrop) containing an internal `Icon`.

### 2.3 Organisms
Organisms are complex, distinct sections of the UI. They often connect to global state or context to manage business logic and orchestrate their underlying molecules.

*   **`TopNavigationPanel`**: A horizontally scrolling or flex container (`PillBase` variant) that houses the `DropdownButton` (Filter), `DropdownButton` (Layers), and `SearchField`.
    *   *Responsibility*: Captures search input and filter selections; dispatches actions to the global store.
*   **`MapCanvas`**: The core component that initializes the map SDK.
    *   *Responsibility*: Manages the spatial state (zoom, pan, tilt), renders `MapMarker` molecules based on data arrays, and handles map click events.
*   **`OverlayHUD`**: A structural organism that manages the absolute positioning of all floating UI elements over the map.
    *   *Responsibility*: Ensures the `TopNavigationPanel`, `ModeToggle`, `FloatingActionButton`, and `UserAvatar` are correctly positioned according to the UI blueprint.

### 2.4 Templates
Templates define the underlying layout structure across pages.

*   **`MapDashboardLayout`**: A full-screen layout.
    *   *Responsibility*: Renders the `MapCanvas` at `z-index: 0` and the `OverlayHUD` at a higher `z-index`, establishing the base viewing context.

### 2.5 Pages
Pages represent specific routes and assemble organisms/templates. They fetch data, connect to the store, and pass props down.

*   **`SiteSelectionHome`**: The main entry point.
    *   *Responsibility*: Initializes the application, fetches initial site data (for markers), reads the user profile (for the avatar), and connects the "AI vs. Manual" mode state to the rest of the application.
