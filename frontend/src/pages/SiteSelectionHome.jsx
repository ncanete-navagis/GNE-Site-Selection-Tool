import React, { useState, useEffect } from 'react';
import { MapDashboardLayout } from '../components/templates/MapDashboardLayout';
import { MapCanvas } from '../components/organisms/MapCanvas';
import { OverlayHUD } from '../components/organisms/OverlayHUD';
import { SidePanel } from '../components/organisms/SidePanel';\nimport { useBackendAPI } from '../hooks/useBackendAPI';

// Mock data for demonstration
const MOCK_SITES = [
  { id: '1', lat: 10.3157, lng: 123.8854, name: 'Cebu City Center' },
  { id: '2', lat: 10.3298, lng: 123.9039, name: 'Mabolo' },
  { id: '3', lat: 10.3111, lng: 123.9790, name: 'Lapu-Lapu' }
];

export const SiteSelectionHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState('3');

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('features'); // 'features' | 'ai'
  const [hasAIAccess, setHasAIAccess] = useState(true); // PIN system integration point

  // Map interaction state
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [geminiMarker, setGeminiMarker] = useState(null);
  const [hazardData, setHazardData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const { generateRecommendation, getHazards, getTraffic } = useBackendAPI();

  useEffect(() => {
    window.onLayerToggleGlobal = async (layers) => {
      const bounds = { xmin: 123.8, ymin: 10.2, xmax: 124.0, ymax: 10.4 };
      if (layers.includes('Flood Hazard') || layers.includes('Earthquake Risk')) {
        const data = await getHazards(bounds);
        setHazardData(data);
      } else {
        setHazardData(null);
      }
      if (layers.includes('Traffic Layer')) {
        const data = await getTraffic(bounds);
        setTrafficData(data);
      } else {
        setTrafficData(null);
      }
    };
    return () => { delete window.onLayerToggleGlobal; };
  }, [getHazards, getTraffic]);

  const handleToggleMode = () => {
    setIsAIMode(!isAIMode);
  };

  const handleFabClick = () => {
    console.log("FAB clicked! Toggling marker placement mode...");
    setIsPlacingMarker((prev) => {
      const nextState = !prev;
      if (nextState) {
        setIsPanelOpen(false);
      }
      return nextState;
    });
  };

  const handleOpenFeatures = () => {
    setPanelMode('features');
    setIsPanelOpen(true);
  };

  // Allow exiting placement mode via Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPlacingMarker) setIsPlacingMarker(false);
        if (isPanelOpen) setIsPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlacingMarker, isPanelOpen]);

  const handleMarkerPlaced = async (coords) => {\n    try { await generateRecommendation(coords.lat, coords.lng, 'New Site'); } catch(e) {}
    console.log("Marker placed at", coords);
    setGeminiMarker(coords);
    setPanelMode('ai');
    setIsPanelOpen(true);
  };

  const mapComponent = (
    <MapCanvas
      sites={MOCK_SITES}
      selectedSiteId={selectedSiteId}
      onSiteSelect={setSelectedSiteId}
      isPlacingMarker={isPlacingMarker}
      setIsPlacingMarker={setIsPlacingMarker}
      onMarkerPlaced={handleMarkerPlaced}
      geminiMarker={geminiMarker}\n      hazardData={hazardData}\n      trafficData={trafficData}
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
      onOpenFeatures={handleOpenFeatures} // New handler
    />
  );

  const sidePanelComponent = (
    <SidePanel
      isOpen={isPanelOpen}
      mode={panelMode}
      setMode={setPanelMode}
      hasAIAccess={hasAIAccess}
      poi={geminiMarker ? {
        id: `new-site-${geminiMarker.lat}-${geminiMarker.lng}`,
        title: 'New Target Location',
        type: 'Selected Site',
        rating: 4.5
      } : null}
      onClose={() => setIsPanelOpen(false)}
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
