import React, { useState, useEffect } from 'react';
import JoyrideModule, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
const JoyrideComponent = JoyrideModule.default || JoyrideModule;
import steps from './aiTutorialSteps';

/**
 * AIChatTutorial Component
 * Dedicated onboarding for the AI Chatbot features.
 * Automatically triggers when the user opens the AI panel for a site.
 */
const AIChatTutorial = ({ poi, isAIPanelOpen }) => {
    const [run, setRun] = useState(false);
    const localStorageKey = 'hasSeenAITutorial';

    const DEBUG_AI_TOUR = true;

    useEffect(() => {

        // FOR DEBUGGING:
        // Always replay AI tutorial when conditions are met
        if (DEBUG_AI_TOUR) {
            localStorage.removeItem(localStorageKey);

            if (poi && isAIPanelOpen) {
                const timer = setTimeout(() => {
                    setRun(true);
                }, 1000);

                return () => clearTimeout(timer);
            }

            return;
        }

        // Production behavior
        const hasSeenAITour = localStorage.getItem(localStorageKey);

        // Trigger condition: POI selected, AI panel is open, and user hasn't seen this tour
        if (poi && isAIPanelOpen && !hasSeenAITour) {
            const timer = setTimeout(() => {
                setRun(true);
            }, 1000);

            return () => clearTimeout(timer);
        }

    }, [poi, isAIPanelOpen]);

    // useEffect(() => {
    //     const hasSeenAITour = localStorage.getItem(localStorageKey);

    //     // Trigger condition: POI selected, AI panel is open, and user hasn't seen this tour
    //     if (poi && isAIPanelOpen && !hasSeenAITour) {
    //         // Small delay to ensure chatbot components are fully mounted
    //         const timer = setTimeout(() => {
    //             setRun(true);
    //         }, 1000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [poi, isAIPanelOpen]);

    const handleJoyrideCallback = (data) => {
        const { status, type, step } = data;

        // Defensive: Skip if target doesn't exist
        if (step && step.target) {
            const element = document.querySelector(step.target);
            if (!element && type === EVENTS.STEP_BEFORE) {
                console.warn(`AI Tutorial target not found: ${step.target}. Skipping step.`);
            }
        }

        // Handle tutorial completion or skip
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRun(false);
            localStorage.setItem(localStorageKey, 'true');
        }
    };

    if (!JoyrideComponent) return null;

    return (
        <JoyrideComponent
            steps={steps}
            run={run}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            scrollToFirstStep={true}
            disableOverlayClose={true}
            spotlightClicks={false}
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

export default AIChatTutorial;
