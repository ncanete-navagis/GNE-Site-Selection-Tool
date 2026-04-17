# UI Blueprint: Geospatial Site Locator (Home Screen)

This blueprint provides a technical breakdown of the layout and components observed in the `homescreendesign.jpg` reference. It is designed to guide a React engineer in implementing a high-performance, map-centric interface.

## 1. Architectural Strategy: "Map-First" Overlay
The application follows a **Spatial Overlay Pattern**. The map is the foundation, and all UI elements are floating layers (Z-indexed) to maximize geographical visibility.

### Layout Structure
- **Base Layer (z-index: 0):** Full-screen Google Maps instance.
- **Overlay Layer (z-index: 10):** Floating Header & Navigation.
- **Side Panel Layer (z-index: 20):** Contextual panels (Filters, History, Layers) - *inferred*.

---

## 2. Component Breakdown

### A. Floating Header (The "Control Hub")
A single, cohesive unit floating at the top of the viewport.
- **Styling:** 
  - Background: Semi-transparent dark gray/black (`rgba(30, 30, 30, 0.9)`).
  - Backdrop Filter: `blur(8px)` (Glassmorphism effect).
  - Border Radius: `12px` (rounded corners).
  - Shadow: Large elevation shadow to create separation from the map.

#### Sub-Components:
1.  **Brand Section:** 
    - **Logo:** Navagis Icon (Stacked layer symbol).
    - **Text:** "NAVAGIS" in bold, uppercase sans-serif (e.g., *Inter* or *Roboto*).
2.  **Global Search:**
    - Type: Input with inline icon.
    - Placeholder: "Search...".
    - Icon: Search (Magnifying glass) positioned at the trailing end.
    - Style: Darker fill than header, rounded pill shape.
3.  **User Profile:**
    - Component: Avatar circle.
    - Image: User's profile photo.
    - Placement: Right-aligned.

---

### B. Header Navigation Tabs
Integrated into the bottom section of the Floating Header. This serves as the primary mode-switcher.

| Tab | Type | Interaction |
| :--- | :--- | :--- |
| **Filter** | Dropdown/Toggle | Opens the site-filtering criteria panel. |
| **History** | Toggle | Displays a list of recently visited/searched locations. |
| **Layers** | Toggle | Opens the map layer selection (Satellite, Street, POI layers). |

- **UI Note:** Active states should be indicated by a subtle background shift or bottom border highlight.

---

## 3. Map Placement & Configuration
- **API:** Google Maps JavaScript API (or Maps SDK for React).
- **Placement:** Absolute position `top: 0, left: 0, right: 0, bottom: 0`.
- **UI Controls:** Disable default Google Maps UI (Zoom/MapType) and replace with custom floating controls if needed later.
- **Markers:** Custom pins for different POI categories (e.g., Hotels in pink, Malls in blue).

---

## 4. User Interaction Flow

1.  **Initialization:** Map loads centered on the user's default/saved location. Floating Header fades in.
2.  **Discovery:** User types in the search bar. Real-time suggestions appear in a dropdown below the search input.
3.  **Filtering:** User clicks **"Filter"**. A side panel slides from the left or a modal appears, allowing users to narrow down sites by attribute.
4.  **Context Switching:** User toggles **"Layers"** to switch to satellite view for better terrain analysis.
5.  **POIs:** Clicking a map marker opens an Information Card (not visible in design but required for flow).

---

## 5. Technical Requirements for React
- **Styling:** CSS Modules or Styled Components following the `brand_constants.json`.
- **State Management:** Context API or Redux to track current filters, layer visibility, and search state.
- **Map Integration:** Use `@react-google-maps/api` for seamless integration.

> [!TIP]
> Use a shared `GlobalStyles` manifest for the base color palette (#1A1A1A for panels, White for text) to ensure consistency across future modules.
