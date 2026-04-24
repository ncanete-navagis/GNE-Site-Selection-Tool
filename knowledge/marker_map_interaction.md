# Interaction Design: Map Marker Drop & Reactive Popup

This document outlines the bridge between the **Google Maps JS SDK** (imperative) and the **React** frontend (declarative) to enable interactive marker creation and detail display.

---

## 1. Mapping Interaction Flow

### Phase A: Marker Provisioning (The "Drop")
1. **User Interaction:** User clicks on any empty area of the map canvas.
2. **SDK Event:** Listen to the `click` event on the `google.maps.Map` instance.
3. **React State Update:**
   - Capture `event.latLng`.
   - Generate a temporary UUID for the marker.
   - Update `activeMarkers` state array by appending the new coordinate and id.
4. **Rendering:** React re-renders, triggered by the state change. A `MapMarkers` component iterates through the state and renders Google Maps marker instances corresponding to each coordinate.

### Phase B: Selection & Highlighting (The "Click")
1. **User Interaction:** User clicks an existing marker icon on the map.
2. **SDK Event:** Listen to the `click` event on the specific `google.maps.marker.AdvancedMarkerElement` instance.
3. **React State Update:**
   - Update `selectedMarkerId` state with the marker's UUID.
4. **Visibility Logic:** The UI layer detects `selectedMarkerId` is no longer null and initiates the `MarkerPopup` component entrance animation.

---

## 2. State & Reference Management

### React State Model
| Variable | Type | Description |
| :--- | :--- | :--- |
| `markers` | `Array<MarkerInfo>` | Source of truth for all temporary markers on the map. |
| `selectedId` | `string \| null` | The ID of the currently active/focused marker. |
| `isPopupVisible` | `boolean` | Derived from `selectedId !== null`. |

### Reference Management (`useRef`)
To bridge the gap between React's render cycle and the Google Maps instance lifecycle:
- **`mapRef`**: Holds the raw `google.maps.Map` instance.
- **`markerInstancesRef`**: A `Map<string, google.maps.Marker>` to store references to active SDK marker objects. This allows React to trigger SDK-specific methods (like `setAnimation` or `setZIndex`) without a full re-render of the map.

---

## 3. Position & Projection Logic

To ensure the React-based `MarkerPopup` aligns perfectly with the geospatial `AdvancedMarkerElement`:

1. **Projection Conversion:** In a `bounds_changed` listener, use `map.getProjection().fromLatLngToPoint()` to convert the marker's Lat/Lng into pixel coordinates.
2. **Anchor Offset:** Apply the `20px` horizontal offset specified in the UI spec at the CSS level using `transform: translate()`.
3. **Map Drift Compensation:** The popup must remain "locked" to the marker during pans. This is achieved by listening to the `center_changed` event and updating the absolute CSS `top/left` values of the popup container.

---

## 4. Lifecycle & Performance

- **Cleanup:** When a marker is removed from state, the SDK instance must be explicitly destroyed (`marker.setMap(null)` and listeners cleared) to prevent memory leaks in the browser.
- **Optimized Picking:** Use the **Google Maps Advanced Marker SDK** to allow the marker icon to be a standard HTML element, making z-index Management and CSS styling for the "selected" state significantly simpler.
- **Batching:** When dropping multiple markers (if supported in future), ensure state updates are batched to avoid multiple map re-initializations.

---

## 5. Interaction Checklist for React Developers
- [ ] Initialize `google.maps.Map` inside a `useEffect` with an empty dependency array.
- [ ] Use `map.addListener('click', ...)` once at startup.
- [ ] Ensure `MarkerPopup` is rendered at the top level of the React tree (via `Portal`) to avoid clipping.
- [ ] Implement a "Close" handler that resets `selectedMarkerId` to `null`.
