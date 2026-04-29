import React from 'react';
import { PillBase } from '../atoms/PillBase';
import { DropdownButton } from '../molecules/DropdownButton';
import { SearchField } from '../molecules/SearchField';

export const TopNavigationPanel = ({ searchQuery, onSearchChange }) => {
  const filterOptions = [
    { label: 'All' },
    { label: 'Buffet' },
    { label: 'Cafes and Coffee Shops' },
    { label: 'Casual' },
    { label: 'Concession Stands' },
    { label: 'Contemporary Casual' },
    { label: 'Fast Casual' },
    { label: 'Fast Food' },
    { label: 'Fine Dining' },
    { label: 'Food Trucks' },
    { label: 'Ghost Restaurants' },
    { label: 'Pop-Ups' },
    { label: 'Specialty Drinks' }
  ];

  const layerOptions = [
    { label: 'Traffic Layer' },
    { label: 'Foot Traffic Layer' },
    { label: 'Flood Hazard Layer' },
    { label: 'Storm Surge Hazard Layer' },
    { label: 'Earth Quake Hazard Layer' }
  ];

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    pointerEvents: 'auto',
    minWidth: '720px'
  };

  return (
    <PillBase style={containerStyle}>
      <DropdownButton iconName="filter" label="Filter" options={filterOptions} />
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
      <DropdownButton iconName="layers" label="Layers" options={layerOptions} />
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
      <SearchField value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
    </PillBase>
  );
};
