import React, { useState, useEffect } from 'react';
import * as JoyrideModule from 'react-joyride';
const JoyrideComponent = JoyrideModule.default || JoyrideModule;
const { STATUS, ACTIONS, EVENTS } = JoyrideModule;
import steps from './tutorialSteps';

/**
 * TutorialTour Component
 * Manages the main guided onboarding process using React Joyride.
 */
const TutorialTour = ({ onSidePanelOpen }) => {
    const [run, setRun] = useState(false);
    const localStorageKey = 'hasSeenWebsiteTour';

    useEffect(() => {
        // FOR DEBUGGING:
        // Always replay tutorial on refresh
        localStorage.removeItem(localStorageKey);
        setRun(true);
    }, []);

    // useEffect(() => {
    //     // Auto-start only for first-time users
    //     const hasSeenTour = localStorage.getItem(localStorageKey);
    //     if (!hasSeenTour) {
    //         setRun(true);
    //     }
    // }, []);

    /**
     * Helper function to manually restart the tour.
     * Can be exposed to parent or used via window for debugging/future use.
     */
    const restartTour = () => {
        localStorage.removeItem(localStorageKey);
        setRun(true);
    };

    // Expose restart function globally for future use as requested
    useEffect(() => {
        window.restartTour = restartTour;
        return () => {
            delete window.restartTour;
        };
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status, type, step } = data;

        // Defensive: Skip if step is missing or target doesn't exist
        if (step && step.target) {
            const element = document.querySelector(step.target);
            if (!element && type === EVENTS.STEP_BEFORE) {
                console.warn(`Tutorial target not found: ${step.target}. Skipping step.`);
            }
        }

        // Handle auto-opening side panel for specific steps
        if (type === EVENTS.STEP_BEFORE) {
            const sidePanelTargets = [
                '#tutorial-analysis-section',
                '#tutorial-filters-section',
                '#tutorial-choropleth-toggle',
                '#tutorial-heatmap-toggle'
            ];

            if (sidePanelTargets.includes(step.target)) {
                if (onSidePanelOpen) {
                    onSidePanelOpen();
                }
            }
        }

        // Handle tutorial completion or skip
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRun(false);
            localStorage.setItem(localStorageKey, 'true');
        }
    };

    // Defensive: Ensure Joyride is defined before rendering
    if (!JoyrideComponent) {
        console.error('React Joyride component is undefined. Ensure react-joyride is installed correctly.');
        return null;
    }

    // Defensive: Validate steps exist
    const validSteps = steps && Array.isArray(steps) ? steps : [];
    if (validSteps.length === 0) return null;

    return (
        <JoyrideComponent
            steps={validSteps}
            run={run}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            scrollToFirstStep={true}
            disableOverlayClose={true}
            spotlightClicks={false}
            disableScrolling={false}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: 'var(--bg-card)',
                    backgroundColor: 'var(--bg-card)',
                    overlayColor: 'rgba(0, 0, 0, 0.75)',
                    primaryColor: 'var(--accent-primary)',
                    textColor: 'var(--text-primary)',
                    zIndex: 10000,
                },
                tooltipContainer: {
                    textAlign: 'left',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: 'var(--shadow-hard)',
                },
                buttonNext: {
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 16px',
                    outline: 'none',
                },
                buttonBack: {
                    color: 'var(--text-muted)',
                    marginRight: '10px',
                    outline: 'none',
                },
                buttonSkip: {
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    outline: 'none',
                },
                tooltipTitle: {
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--accent-primary)',
                    marginBottom: '10px',
                },
                tooltipContent: {
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: 'var(--text-secondary)',
                }
            }}
        />
    );
};

export default TutorialTour;
