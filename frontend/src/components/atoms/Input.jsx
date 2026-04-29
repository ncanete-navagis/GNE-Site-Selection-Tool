import React from 'react';

export const Input = ({ className = '', ...props }) => {
  const styles = {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <input
      className={`input-field ${className}`}
      style={styles}
      {...props}
    />
  );
};
