import React from 'react';

export const PillBase = ({ children, className = '', style = {}, ...props }) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.03), transparent)',
    backdropFilter: 'blur(var(--blur-intensity))',
    WebkitBackdropFilter: 'blur(var(--blur-intensity))',
    borderRadius: 'var(--border-radius-pill)',
    padding: '6px',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-elevated)',
  };

  return (
    <div className={`pill-base ${className}`} style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </div>
  );
};
