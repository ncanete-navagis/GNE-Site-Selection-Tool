# Google Maps Platform Integration Design

This document outlines the technical integration of Google Maps Platform (GMP) into the React Atomic architecture. It focuses on the bridge between the high-performance map canvas and the React-driven UI modules.

## 1. Core Map Component (`MapViewer`)
The `MapViewer` organism acts as the exclusive host for the GMP instance.

- **Initialization:** Uses the `@react-google-maps/api` library or standard `google.maps` SDK via a custom `useMapInstance` hook.
- **Placement:** Positioned as a `fixed` or `absolute` background with `z-index: 0`.
- **Reference:** The `map` object is stored in a `useRef` to allow imperative actions (pan, zoom, fitBounds) without triggering React re-renders of the map container.

---

## 2. Marker Management Strategy
- **Performance:** For high-density site selection, markers are managed via `@googlemaps/markerclusterer`.
- **Data Flow:**
  - `selectedSites` (array) is passed as a prop from the `GlobalContext` to the `MapViewer`.
  - The `MapViewer` iterates through the array and creates `google.maps.Marker` or `google.maps.marker.AdvancedMarkerElement` instances.
- **Customization:** Uses the `MarkerPin` molecule definition to render SVG-based markers with dynamic colors based on site attributes.

---

## 3. Map Event-to-UI Pipeline
Interaction with the map updates the React application state through an event-forwarding pattern.

| Event | Action | UI Impact |
| :--- | :--- | :--- |
| **`click` (Marker)** | Dispatch `SET_SELECTED_POI` | Side panel slides in with site metadata. |
| **`idle` (Map)** | Fetch POIs within current `getBounds()` | Map refreshes with new sites as the user pans/zooms. |
| **`rightclick`** | Open Context Menu (Molecule) | Allows "Drop Pin" or "Analyze Here" actions. |

---

## 4. Filter & Search Synchronization
Filters are decoupled from the map rendering logic to ensure UI responsiveness.

1.  **Filter Application:** User adjusts "Distance" or "Category" in the `FilterPanel`.
2.  **State Update:** `UIStateContext` computes a new `filteredSites` list.
3.  **Sync:** `MapViewer` receives the updated list. It performs a "Diff and Patch" on map markers (adding new ones, removing excluded ones) instead of a full re-initialization.
4.  **Spatial Alignment:** If searching for a specific address, the `SearchBar` triggers a `geocoder` service. Once successful, it calls `map.fitBounds()` to focus on the target area.

---

## 5. State Management Strategy
We use a **Hybrid State Model**:

- **React State (Context API):** Stores metadata (site IDs, filter strings, visibility toggles).
- **Map State (Imperative Class):** The map's internal state (center, zoom, current projection) is managed by GMP.
- **The Bridge:**
  - **Downstream (React -> Map):** `useEffect` hooks in `MapViewer` watch for context changes (e.g., `selectedPOIID`) and trigger imperative map actions (e.g., `map.panTo()`).
  - **Upstream (Map -> React):** Map listeners wrap native GMP events in React state setters (e.g., `onCenterChanged(() => setCoords(map.getCenter()))`).

---

## 6. Performance & Rendering Rules
- **Rule 1:** Never store the full POI object in the map event listener; pass only the `siteID`.
- **Rule 2:** Use `AdvancedMarkerElement` for better GPU performance and CSS styling support.
- **Rule 3:** Implement a "Map Freeze" during complex filter transitions to prevent flickering during rapid state updates.

> [!TIP]
> Use the **Antigravity SDK**'s specialized camera controls to implement smooth "Fly-to" animations when a user clicks a result in the SearchBar.
