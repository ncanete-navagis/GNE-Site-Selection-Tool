# Website Tutorial System

The application uses two separate, contextual tutorials to ensure a smooth onboarding experience without overwhelming the user.

## 1. Main Website Tour
**Component**: `src/tutorial/TutorialTour.jsx`
**Steps**: `src/tutorial/tutorialSteps.js`
**LocalStorage Key**: `hasSeenWebsiteTour`
**Trigger**: Automatically starts on the first visit to the application.

### Coverage
- **User Profile**: Access via Avatar
- **Navigation**: Search, Regions, and Hazard Layer toggles
- **Map Tools**: Pin drop and drawing tools
- **Side Panel**: Analysis breakdown and Discovery filters
- **Map Visuals**: Choropleth and Heatmap toggles

## 2. AI Chatbot Tour
**Component**: `src/tutorial/AIChatTutorial.jsx`
**Steps**: `src/tutorial/aiTutorialSteps.js`
**LocalStorage Key**: `hasSeenAITutorial`
**Trigger**: Automatically starts when a site (POI) is selected AND the SidePanel is switched to 'AI' mode for the first time.

### Coverage
- **Contextual FAQs**: AI-suggested follow-up questions
- **Custom Queries**: Text input for direct Gemini interaction

---

## Technical Integration

### State-Based Triggers
The `AIChatTutorial` component watches the following props in `SiteSelectionHome.jsx`:
- `poi`: Ensures a site is actually selected (providing context for the AI).
- `isAIPanelOpen`: Ensures the AI tab is active so targets are visible.

### Implementation Notes
- **Namespace Imports**: Both tutorials use `import * as JoyrideModule` to ensure compatibility with Vite's dependency optimization.
- **Defensive Handling**: Both components check for DOM targets before advancing to prevent runtime crashes if a component is hidden.
- **Persistence**: Completion state is stored in `localStorage` to ensure each tour only runs once per user.

## Global IDs

| Component          | ID                         | File Location                                                                 |
| ------------------ | -------------------------- | ----------------------------------------------------------------------------- |
| UserAvatar         | tutorial-user-avatar       | src/components/molecules/UserAvatar.jsx                                       |
| MapToolsPanel      | tutorial-map-tools         | src/components/organisms/MapToolsPanel.jsx                                    |
| TopNavigationPanel | tutorial-top-navigation    | src/components/organisms/TopNavigationPanel.jsx                               |
| SidePanel          | tutorial-side-panel         | src/components/organisms/SidePanel.jsx                                               |
| FeaturesPanel Analysis   | tutorial-analysis-section   | src/components/organisms/features-panel/FeaturesPanelAnalysis.jsx                    |
| FeaturesPanel Filters    | tutorial-filters-section    | src/components/organisms/features-panel/FeaturesPanelFilters.jsx                     |
| Choropleth map toggle    | tutorial-choropleth-toggle  | src/components/organisms/features-panel/FeaturesPanelMapControls.jsx                 |
| Heat map toggle          | tutorial-heatmap-toggle     | src/components/organisms/features-panel/FeaturesPanelMapControls.jsx                 |
| AIChatPanel FAQ          | tutorial-ai-faq             | src/components/molecules/AIChatPanel.jsx                                             |
| AIChatPanel User Inputs  | tutorial-ai-user-inputs     | src/components/molecules/AIChatPanel.jsx                                             |
