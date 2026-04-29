import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    borderRadius: 'var(--border-radius-pill)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'var(--transition-fast)',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-accent-blue)',
      color: '#fff',
    },
    secondary: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1px solid rgba(255, 255, 255, 0.22)',
    },
    floating: {
      backgroundColor: 'var(--color-accent-blue)',
      color: '#fff',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      padding: '0',
      boxShadow: 'var(--shadow-floating), var(--shadow-glow-blue)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
    }
  };

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      style={{ ...baseStyles, ...variants[variant] }}
      {...props}
    >
      {children}
    </button>
  );
};
