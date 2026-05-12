import React from 'react';

export const Typography = ({ variant = 'body', children, className = '', color, ...props }) => {
  const tags = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    label: 'span',
    small: 'small'
  };

  const Component = tags[variant] || 'p';

  const styles = {
    h1: { fontSize: '32px', fontWeight: '800', margin: '0 0 20px 0', letterSpacing: '-0.025em' },
    h2: { fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0', letterSpacing: '-0.02em' },
    h3: { fontSize: '20px', fontWeight: '600', margin: '0 0 12px 0', letterSpacing: '-0.01em' },
    body: { fontSize: '14px', lineHeight: '1.6', margin: '0' },
    label: { fontSize: '14px', fontWeight: '600', letterSpacing: '0.01em' },
    small: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }
  };

  return (
    <Component 
      className={`typography-${variant} ${className}`} 
      style={{ ...styles[variant], color: color || 'inherit' }}
      {...props}
    >
      {children}
    </Component>
  );
};
