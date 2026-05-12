import React from 'react';

export const PillBase = ({ children, className = '', style = {}, ...props }) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-pill)',
    padding: '6px',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-soft)',
  };

  return (
    <div className={`pill-base ${className}`} style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </div>
  );
};
