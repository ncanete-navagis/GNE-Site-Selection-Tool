import React from 'react';
import { PillBase } from '../atoms/PillBase';
import { DropdownButton } from '../molecules/DropdownButton';
import { SearchField } from '../molecules/SearchField';

export const TopNavigationPanel = ({ searchQuery, onSearchChange, onFilterChange, onRegionChange }) => {
  const [selectedFilter, setSelectedFilter] = React.useState('None');
  const [selectedRegion, setSelectedRegion] = React.useState('Cebu');
  const [selectedLayer, setSelectedLayer] = React.useState(null);

  // Map layer option labels to filter values the parent understands
  const layerFilterMap = {
    'Flood Hazard Layer':       'Flood',
    'Storm Surge Hazard Layer': 'Storm Surge 2',
    'Earthquake Hazard Layer':  'Landslide',
    'Traffic Layer':            'Traffic',
    'Foot Traffic Layer':       'Traffic',
  };

  const filterOptions = [
    { label: 'None' },
    { label: 'Flood' },
    { label: 'Landslide' },
    { label: 'Storm Surge 1' },
    { label: 'Storm Surge 2' },
    { label: 'Storm Surge 3' },
    { label: 'Storm Surge 4' }
  ];

  const layerOptions = [
    { label: 'Traffic Layer' },
    { label: 'Foot Traffic Layer' },
    { label: 'Flood Hazard Layer' },
    { label: 'Storm Surge Hazard Layer' },
    { label: 'Earthquake Hazard Layer' }
  ];

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    pointerEvents: 'auto',
    minWidth: '720px'
  };

  const regionOptions = [
    { label: 'Cebu' },
    { label: 'Manila' },
  ];

  return (
    <PillBase id="tutorial-top-navigation" style={containerStyle}>
      <DropdownButton 
        iconName="filter" 
        label={selectedFilter === 'None' ? 'Hazards' : selectedFilter} 
        options={filterOptions} 
        onSelect={(opt) => {
          setSelectedFilter(opt.label);
          if (onFilterChange) onFilterChange(opt.label);
        }} 
      />
      <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)' }}></div>
      <DropdownButton 
        iconName="mapPin" 
        label={selectedRegion} 
        options={regionOptions} 
        onSelect={(opt) => {
          setSelectedRegion(opt.label);
          if (onRegionChange) onRegionChange(opt.label);
        }} 
      />
      <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)' }}></div>
      <DropdownButton iconName="layers" label={selectedLayer || 'Layers'} options={layerOptions} onSelect={(opt) => {
        const isSame = selectedLayer === opt.label;
        const next = isSame ? null : opt.label;
        setSelectedLayer(next);
        const filterValue = next ? (layerFilterMap[next] || 'None') : 'None';
        if (onFilterChange) onFilterChange(filterValue);
      }} />
      <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)' }}></div>
      <SearchField value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
    </PillBase>
  );
};
