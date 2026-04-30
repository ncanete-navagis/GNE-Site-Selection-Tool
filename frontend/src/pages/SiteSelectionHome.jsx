import React, { useState } from 'react';
import { MapDashboardLayout } from '../components/templates/MapDashboardLayout';
import { MapCanvas } from '../components/organisms/MapCanvas';
import { OverlayHUD } from '../components/organisms/OverlayHUD';
import { GeminiSidePanel } from '../components/organisms/GeminiSidePanel';

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
  
  // New state for map interaction
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [geminiMarker, setGeminiMarker] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleMode = () => {
    setIsAIMode(!isAIMode);
  };

  const handleFabClick = () => {
    console.log("FAB clicked! Enabling marker placement mode...");
    setIsPlacingMarker(true);
    // Hide chat while placing a new marker
    setIsChatOpen(false);
  };

  const handleMarkerPlaced = (coords) => {
    console.log("Marker placed at", coords);
    setGeminiMarker(coords);
    setIsChatOpen(true);
  };

  const mapComponent = (
    <MapCanvas 
      sites={MOCK_SITES} 
      selectedSiteId={selectedSiteId} 
      onSiteSelect={setSelectedSiteId}
      isPlacingMarker={isPlacingMarker}
      setIsPlacingMarker={setIsPlacingMarker}
      onMarkerPlaced={handleMarkerPlaced}
      geminiMarker={geminiMarker}
    />
  );

  const hudComponent = (
    <OverlayHUD 
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isAIMode={isAIMode}
      onToggleMode={handleToggleMode}
      onFabClick={handleFabClick}
      isPlacingMarker={isPlacingMarker}
    />
  );

  // We always render the side panel, but control its visibility via isOpen prop for CSS transitions
  const sidePanelComponent = (
    <GeminiSidePanel 
      isOpen={isChatOpen}
      poi={geminiMarker ? {
        id: 'new-site',
        title: 'New Target Location',
        type: 'Selected Site',
        rating: 4.5
      } : null} 
      onClose={() => setIsChatOpen(false)} 
    />
  );

  return (
    <MapDashboardLayout 
      mapComponent={mapComponent} 
      hudComponent={hudComponent} 
      sidePanelComponent={sidePanelComponent}
    />
  );
};
