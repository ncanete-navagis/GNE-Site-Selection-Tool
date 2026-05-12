import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';

// Import modular prompts
import { footTrafficPrompts } from '../../ai-prompts/footTraffic.prompts';
import { demographicsPrompts } from '../../ai-prompts/demographics.prompts';
import { competitionPrompts } from '../../ai-prompts/competition.prompts';
import { accessibilityPrompts } from '../../ai-prompts/accessibility.prompts';
import { risksPrompts } from '../../ai-prompts/risks.prompts';
import { spacePrompts } from '../../ai-prompts/space.prompts';
import { businessFitPrompts } from '../../ai-prompts/businessFit.prompts';

export const MiniFAQAccordion = ({ onSendPrompt }) => {
  const sections = [
    { title: "Foot Traffic & Visibility", prompts: footTrafficPrompts },
    { title: "Demographics & Community", prompts: demographicsPrompts },
    { title: "Competition & Complementary Businesses", prompts: competitionPrompts },
    { title: "Accessibility & Parking", prompts: accessibilityPrompts },
    { title: "Risks & Environment", prompts: risksPrompts },
    { title: "Space & Suitability", prompts: spacePrompts },
    { title: "Business Fit (AI Insight)", prompts: businessFitPrompts },
  ];

  const containerStyle = {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    opacity: 0.9
  };

  const headerStyle = {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '2px',
    paddingLeft: '12px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>Refine Analysis</div>
      {sections.map((section, sIdx) => (
        <CollapsibleSection
          key={sIdx}
          title={section.title}
          style={{ padding: '8px 12px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
            {Object.keys(section.prompts).map((qText, qIdx) => (
              <button
                key={qIdx}
                onClick={() => onSendPrompt(qText, section.prompts)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  width: '100%',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                {qText}
              </button>
            ))}
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
};
