# Google Maps Integration Design (v2)

This document defines how the Google Antigravity Web SDK integrates into the v2 React Atomic Design architecture, focusing on the new map-centric, floating-panel layout.

## 1. Map Component Placement (`MapCanvas`)

- **Location**: The map acts as the foundational layer of the application. The `MapCanvas` organism lives at the lowest level of the z-index stack (`z-index: 0`) within the `MapDashboardLayout` template.
- **Sizing**: It occupies the entire viewport (`width: 100vw`, `height: 100vh`) with no margins or padding.
- **Styling**: It is configured immediately upon initialization to use the custom dark-mode styling defined in the design system (charcoal/black background, subdued roads, light text).

## 2. Marker Interactions & "Side Panels"

- **No Fixed Sidebars**: In accordance with the v2 UI Blueprint, there are no traditional, fixed-width sidebars pushing the map. All detailed information views must float above the map canvas.
- **Interaction Flow**: 
  - When a user clicks a `CustomMapMarker`, the `MapCanvas` fires an event to the global state containing the `selectedSiteId`.
  - The map will smoothly pan and zoom to center the selected marker.
  - Instead of sliding out a sidebar, a specialized **Floating Detail Card** (part of the `OverlayHUD` organism) will animate into view. This card will be absolutely positioned, likely anchored to one side of the screen but still allowing the map to be visible beneath its blurred glassmorphic background.

## 3. Popup Integration

- **Custom HTML Overlays**: Standard Google Maps InfoWindows are replaced with custom React-rendered HTML overlays (using an approach similar to `@react-google-maps/api` `OverlayView` or native Antigravity equivalent).
- **Behavior**: Hovering over a marker triggers a lightweight, transient tooltip directly attached to the marker's geographic coordinates.
- **Selection**: Clicking a marker will close any tooltip and either launch the **Floating Detail Card** mentioned above or expand the marker itself into a larger, actionable contextual popup dialog. 

## 4. State Flow Between Map and UI

The application utilizes a unidirectional data flow to ensure synchronization between the React UI state and the imperative Google Maps SDK state.

### UI to Map Flow (Filtering & Searching)
1. User types in the `SearchField` or selects a toggle in the `TopNavigationPanel`.
2. The UI component dispatches an action to the **Global Store** (e.g., `updateSearchQuery`, `setFilters`).
3. The `MapCanvas` component, which subscribes to these store slices, receives the new data array or viewport coordinates.
4. `MapCanvas` imperatively calls the SDK methods (e.g., `map.panTo()`, `map.setZoom()`, or re-rendering markers).

### Map to UI Flow (Panning, Zooming, Clicking)
1. User drags the map, changes zoom level, or clicks a point of interest.
2. The Google Maps SDK fires native events (e.g., `idle`, `bounds_changed`, `click`).
3. Event listeners within `MapCanvas` capture these events and dispatch updates to the **Global Store** (e.g., `setMapBounds`, `setSelectedMarker`).
4. Floating UI components (like the `TopNavigationPanel` or a `Floating Detail Card`) re-render to display the new spatial context or data payload.

## 5. Performance Considerations
- **Marker Clustering**: Large datasets will utilize GPU-accelerated layers or clustering to maintain high FPS when zooming out.
- **Debounced State**: High-frequency map events (like `mousemove` or continuous `bounds_changed` during panning) will be debounced before updating the global React state to prevent render thrashing in the UI overlay.
