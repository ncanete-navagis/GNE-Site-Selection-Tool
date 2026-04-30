import React from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

export const FloatingActionButton = ({ iconName = "mapPin", onClick, isActive }) => {
  return (
    <Button 
      variant="floating" 
      onClick={onClick}
      style={{
        backgroundColor: isActive ? 'var(--color-accent-pink)' : undefined,
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isActive ? 'var(--shadow-glow-pink)' : undefined,
        transition: 'all 0.3s ease'
      }}
    >
      <Icon name={iconName} color="#fff" />
    </Button>
  );
};
