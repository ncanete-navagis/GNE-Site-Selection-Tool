# UI Specification: Marker Information & AI Assistant Popup

## Overview
This document details the visual and functional reverse-engineering of the marker popup panel as seen in `frontend/designinspire/Home-Marker-popup.jpg`. The interface is a sophisticated, dark-themed geospatial information panel that combines location details with an AI-driven chat interface.

---

## 1. General Container Layout
- **Shape:** Rounded rectangle with corner radius of `12px` to `16px`.
- **Background Color:** `#2B2D31` (Dark Charcoal).
- **Border:** `1px` solid `#3F4147` (Subtle boundary).
- **Shadow:** Medium drop shadow (`0 4px 20px rgba(0,0,0,0.5)`) to provide depth against the map.
- **Dimensions:**
  - Width: `340px` (standard) to `380px`.
  - Height: Fixed or Max-height of `500px`.
- **Positioning:** Anchored to the right of the selected Map Marker, vertically centered to the marker tip, with a `20px` horizontal offset.

---

## 2. Header Section (Location Details)
- **Structure:** A nested white card highlighting primary information.
- **Background:** `#FFFFFF` (Solid White).
- **Corner Radius:** `8px` at the top, bottom corners squared or slightly rounded to fit container.
- **Content Elements:**
  - **Title:** "Ayala Center Cebu"
    - Typography: Sans-serif (e.g., Inter or Roboto), Bold, `20px`, Color: `#202124`.
  - **Recommendation Level Label:**
    - Typography: Regular, `12px`, Color: `#5F6368`.
  - **Rating Bar:**
    - Numerical Value: "4.5" (Semi-bold, `14px`).
    - Stars: 5-star components (Gold/Yellow: `#FBBC04`).
    - Review Count: "(24,745)" (Regular, `14px`, Color: `#70757A`).
  - **Category Metadata:**
    - Text: "Shopping mall" (Color: `#70757A`).
    - Icon: Blue Accessibility Icon (Universal symbol) placed beside the text.

---

## 3. Comparative Section (Pros & Cons)
- **Layout:** Horizontal flexbox (split 50/50).
- **Labels:**
  - "Pros:" (Left)
  - "Cons:" (Right)
  - Typography: Semi-bold, `14px`, Color: `#FFFFFF`.
- **Spacing:** `16px` padding below the header card.
- **Placeholder:** Area below labels is reserved for bulleted lists or summarized highlights.

---

## 4. AI Assistant Interface (Chat Container)
- **Container Styling:**
  - Background: `#1E1F22` (Slightly darker than the main popup background).
  - Margin: `12px` (Top/Left/Right).
  - Corner Radius: `8px`.
  - Padding: `12px`.
- **Chat Elements:**
  - **AI Avatar:**
    - Shape: Circle.
    - Content: Navagis Logo (White background).
    - Alignment: Bottom-left of the first message bubble.
  - **Message Bubble:**
    - Background: `#3F4147` (Lighter charcoal).
    - Corner Radius: `12px` (Standard); `0px` on bottom-left near avatar.
    - Text: "Hello I am Navagis AI Real Estate Agent How can I help you today?"
    - Typography: Regular, `14px`, Color: `#E8EAED`.
    - Line Height: `1.4`.

---

## 5. Input Section
- **Position:** Docked at the bottom of the AI Chat Container.
- **Styling:**
  - Background: `#404249` (Distinguishable from chat background).
  - Placeholder: "Text Box..." (Color: `#9AA0A6`).
  - Corner Radius: `8px`.
  - Padding: `8px 12px`.
- **Action Icon:**
  - Type: "Send" (Paper plane icon).
  - Color: `#FFFFFF`.
  - Position: Far right of the input field.

---

## 6. Visual Hierarchy & Interaction
1. **Primary Focus:** The white header card (High contrast against dark theme).
2. **Secondary Focus:** AI Chat message (Actionable element).
3. **Tertiary Focus:** Pros/Cons labels (Informational structure).
4. **Interactive States:**
   - Input Box should highlight on focus.
   - Send icon should change opacity/color on hover.
   - The entire popup should close via a "close" icon (though not visible in current crop, standard for UX) or by clicking the map.

---

## 7. Responsive Considerations
- On mobile devices, the popup should transition to a bottom-sheet (sliding up from the bottom) rather than a floating side panel to preserve map visibility.
