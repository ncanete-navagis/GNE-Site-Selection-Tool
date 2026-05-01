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
    h1: { fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' },
    h2: { fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' },
    h3: { fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' },
    body: { fontSize: '14px', margin: '0 0 8px 0' },
    label: { fontSize: '14px', fontWeight: '500' },
    small: { fontSize: '12px', color: 'var(--color-text-secondary)' }
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
