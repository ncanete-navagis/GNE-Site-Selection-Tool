import React from 'react';

export const PillBase = ({ children, className = '', style = {}, ...props }) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-surface)',
    backdropFilter: `blur(var(--blur-intensity))`,
    WebkitBackdropFilter: `blur(var(--blur-intensity))`,
    borderRadius: 'var(--border-radius-pill)',
    padding: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  };

  return (
    <div className={`pill-base ${className}`} style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </div>
  );
};
