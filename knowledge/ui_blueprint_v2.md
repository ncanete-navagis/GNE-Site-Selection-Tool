# UI Blueprint: Geospatial Site Selection Dashboard (v2)

## 1. Overview
This document outlines the UI design for the new home screen of the Site Selection Dashboard. The design features a full-screen, dark-mode map canvas with floating control panels and buttons, maximizing the geospatial viewing area and minimizing chrome.

## 2. Layout Structure
The interface is entirely map-centric. There are no fixed sidebars, headers, or footers that span the entire width or height of the screen. Instead, all UI controls are modular, floating panels hovering over the base map layer.

## 3. Component Breakdown

### 3.1. Base Map Canvas
- **Style**: Dark mode map styling (charcoal/black background, dark grey landmasses, subdued road networks, and light grey typography for city labels).
- **Functionality**: Serves as the primary interactive area where data points, regions, and pins are visualized.

### 3.2. Top Navigation & Search Panel (Top-Center/Left)
A single, horizontally-oriented floating pill container located at the top of the screen. It seamlessly groups three primary controls:
1. **Filter Dropdown**: A button with a funnel/filter icon, "Filter" label, and a downward chevron.
2. **Layers Dropdown**: A button with a stacked-layers icon, "Layers" label, and a downward chevron.
3. **Search Bar**: A text input field with the placeholder "Search for a placee or address..." and a magnifying glass icon on the right.
- **Visuals**: The internal elements (Filter, Layers, Search) are dark grey, enclosed within a slightly larger, semi-transparent rounded container to group them visually.

### 3.3. User Profile Avatar (Top-Right)
- **Position**: Floating in the top right corner.
- **Visuals**: A circular profile image of the user. It is highlighted with a soft, glowing cyan/light-blue drop shadow or halo effect, indicating interactivity or active status.

### 3.4. Interaction Mode Toggle (Bottom-Left)
- **Position**: Floating in the bottom left corner.
- **Visuals**: A pill-shaped toggle switch with two distinct states: "Manual" and "AI".
- **State Indicator**: The active mode is highlighted by a bright blue background pill. In the design, "AI" mode is currently active, while "Manual" rests as plain text on the dark grey container background.

### 3.5. Action Button & Branding (Bottom-Right)
- **Primary Action Button (FAB)**: A bright blue circular Floating Action Button containing a white map pin icon, positioned in the lower right.
- **Branding**: The "NAVAGIS" logo, featuring the text alongside an isometric stacked-layer icon, positioned at the absolute bottom right, just below the FAB.

### 3.6. Map Markers
- **Visuals**: Markers are designed to stand out against the dark map. The design shows a prominent, bright pink teardrop pin with a white icon inside (resembling a crossed tool or umbrella). The high contrast ensures data points are the most visually salient elements on the screen.

## 4. User Interaction Flow
- **Data Discovery & Navigation**: Users initiate searches via the prominent top search bar or use the Filter and Layers dropdowns to toggle specific geospatial datasets and refine their criteria.
- **Mode Switching**: Users can seamlessly alternate between "Manual" and "AI" assisted analysis modes using the bottom-left toggle. This switch likely changes the behavior of the map, available tools, or the insights displayed.
- **Contextual Actions**: The blue floating action button (FAB) allows users to perform primary map actions, such as manually dropping a pin, creating a new site boundary, or activating a specific mapping tool.
- **Account Management**: Clicking the top-right user avatar provides access to account settings, profile preferences, or logout functions.

## 5. Visual Hierarchy & Aesthetics
- **Primary Focus**: The map base layer and the vibrant, high-contrast map markers (e.g., the pink pin).
- **Secondary Focus**: The top control panel (Search/Filter/Layers) acting as the main entry point for user intent.
- **Tertiary Elements**: The mode toggle, floating action button, and user avatar.
- **Color Palette**:
  - **Background Base**: Deep charcoal/black (Map dark mode).
  - **UI Containers**: Dark grey with varying opacities for subtle depth and glassmorphism effects.
  - **Accents**: Bright cyan/blue (used for the active mode toggle, the FAB, and the avatar glow) and vibrant pink (used for map markers) to provide excellent contrast against the dark UI.
  - **Typography**: Clean, modern sans-serif fonts in white and light grey.
