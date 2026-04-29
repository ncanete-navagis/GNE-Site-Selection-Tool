import React, { useState } from 'react';
import { MapDashboardLayout } from '../components/templates/MapDashboardLayout';
import { MapCanvas } from '../components/organisms/MapCanvas';
import { OverlayHUD } from '../components/organisms/OverlayHUD';

// Mock data for demonstration
const MOCK_SITES = [
  { id: '1', lat: 10.3157, lng: 123.8854, name: 'Cebu City Center' },
  { id: '2', lat: 10.3298, lng: 123.9039, name: 'Mabolo' },
  { id: '3', lat: 10.3111, lng: 123.9790, name: 'Lapu-Lapu' }
];

export const SiteSelectionHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState('3'); // Default selected to show pink pin

  const handleToggleMode = () => {
    setIsAIMode(!isAIMode);
  };

  const handleFabClick = () => {
    console.log("FAB clicked!");
  };

  const mapComponent = (
    <MapCanvas 
      sites={MOCK_SITES} 
      selectedSiteId={selectedSiteId} 
      onSiteSelect={setSelectedSiteId} 
    />
  );

  const hudComponent = (
    <OverlayHUD 
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isAIMode={isAIMode}
      onToggleMode={handleToggleMode}
      onFabClick={handleFabClick}
    />
  );

  return (
    <MapDashboardLayout 
      mapComponent={mapComponent} 
      hudComponent={hudComponent} 
    />
  );
};
