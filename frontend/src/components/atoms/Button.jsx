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
    fontWeight: '600',
    transition: 'var(--transition-fast)',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: '#fff',
      boxShadow: 'var(--shadow-soft)',
    },
    secondary: {
      backgroundColor: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
    },
    floating: {
      backgroundColor: 'var(--accent-primary)',
      color: '#fff',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      padding: '0',
      boxShadow: 'var(--shadow-elevated)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#ffffff',
    }
  };

  const hoverStyles = {
    ghost: {
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    primary: {
      backgroundColor: 'var(--button-primary-hover)',
      transform: 'translateY(-1px)',
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        ...baseStyles, 
        ...variants[variant], 
        ...(isHovered ? hoverStyles[variant] : {}) 
      }}
      {...props}
    >
      {children}
    </button>
  );
};
