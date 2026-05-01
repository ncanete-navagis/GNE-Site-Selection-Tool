import React from 'react';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';

export const SearchField = ({ value, onChange, placeholder = "Search for a place or address...", className = '' }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    borderRadius: 'var(--border-radius-pill)',
    padding: '0 8px',
    flexGrow: 1,
  };

  return (
    <div className={`search-field ${className}`} style={containerStyle}>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <Icon name="search" color="var(--color-text-secondary)" className="ml-2" />
    </div>
  );
};
