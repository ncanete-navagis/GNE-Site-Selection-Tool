import React from 'react';
import { PillBase } from '../atoms/PillBase';
import { Typography } from '../atoms/Typography';

export const ModeToggle = ({ isAIMode, onToggle }) => {
  const toggleStyle = {
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
  };

  const optionStyle = (isActive) => ({
    padding: '8px 24px',
    borderRadius: 'var(--border-radius-pill)',
    backgroundColor: isActive ? 'var(--color-accent-blue)' : 'transparent',
    transition: 'var(--transition-fast)',
    zIndex: 1,
  });

  return (
    <PillBase style={toggleStyle} onClick={onToggle}>
      <div style={optionStyle(!isAIMode)}>
        <Typography variant="label" color={!isAIMode ? '#fff' : 'var(--color-text-secondary)'}>Manual</Typography>
      </div>
      <div style={optionStyle(isAIMode)}>
        <Typography variant="label" color={isAIMode ? '#fff' : 'var(--color-text-secondary)'}>AI</Typography>
      </div>
    </PillBase>
  );
};
