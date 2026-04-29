import React from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

export const FloatingActionButton = ({ iconName = "mapPin", onClick }) => {
  return (
    <Button variant="floating" onClick={onClick}>
      <Icon name={iconName} color="#fff" />
    </Button>
  );
};
