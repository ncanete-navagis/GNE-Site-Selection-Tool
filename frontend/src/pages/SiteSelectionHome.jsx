import React, { useState, useEffect, useCallback } from 'react';
import { MapDashboardLayout } from '../components/templates/MapDashboardLayout';
import { MapCanvas } from '../components/organisms/MapCanvas';
import { OverlayHUD } from '../components/organisms/OverlayHUD';
import { SidePanel } from '../components/organisms/SidePanel';
import { PropertySidePanel } from '../components/organisms/PropertySidePanel';
import { useBackendAPI } from '../hooks/useBackendAPI';

export const SiteSelectionHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState(null);

  // Filter States
  const [activeHazardFilter, setActiveHazardFilter] = useState('None');

  // Left Side Panel State (Analysis/AI)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('features'); // 'features' | 'ai'
  const [hasAIAccess, setHasAIAccess] = useState(true);

  // Right Side Panel State (Property Details)
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Map Data State
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [geminiMarker, setGeminiMarker] = useState(null);
  const [hazardData, setHazardData] = useState(null);
  const [hazardVersion, setHazardVersion] = useState(0);
  const [trafficData, setTrafficData] = useState(null);
  const [buyingProperties, setBuyingProperties] = useState([]);
  const [competitorMarkers, setCompetitorMarkers] = useState([]);

  const { generateRecommendation, getHazards, getTraffic, getBuyingProperties } = useBackendAPI();

  // Handle Layer Toggles (Global Callback)
  useEffect(() => {
    window.onLayerToggleGlobal = async (layers) => {
      // Use current bounds or default
      const bounds = { xmin: 123.8, ymin: 10.2, xmax: 124.0, ymax: 10.4 };
      if (layers.includes('Flood Hazard') || layers.includes('Earthquake Risk')) {
        const data = await getHazards(bounds);
        setHazardData(data);
        setHazardVersion(v => v + 1);
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

  // Handle Map Bounds Changed - Fetch Properties & Hazards
  const handleBoundsChanged = useCallback(async (bounds) => {
    try {
      // Fetch properties
      const properties = await getBuyingProperties(bounds);
      setBuyingProperties(properties);

      // Dynamically fetch hazards based on zoom/viewport if a layer is active
      if (activeHazardFilter && activeHazardFilter !== 'None' && activeHazardFilter !== 'Traffic') {
        let hazardType = null;
        let expectedSeverity = null;

        if (activeHazardFilter === 'Flood') hazardType = 'flood';
        else if (activeHazardFilter === 'Landslide') hazardType = 'landslide';
        else if (activeHazardFilter.startsWith('Storm Surge')) {
          hazardType = 'storm_surge';
          const level = activeHazardFilter.replace('Storm Surge ', '');
          expectedSeverity = `Level ${level}`;
        }

        const data = await getHazards(bounds, hazardType, bounds.zoom || 12);
        if (expectedSeverity && data && data.features) {
          data.features = data.features.filter(f => f.properties.severity === expectedSeverity);
        }
        setHazardData(data);
        setHazardVersion(v => v + 1);
      }
    } catch (err) {
      console.error("Failed to fetch on bounds change:", err);
    }
  }, [getBuyingProperties, getHazards, activeHazardFilter]);

  const handleFilterChange = async (filterLabel) => {
    setActiveHazardFilter(filterLabel);
    
    if (filterLabel === 'None') {
      setHazardData(null);
      setTrafficData(null);
      return;
    }

    // Traffic layer — handled separately from hazards
    if (filterLabel === 'Traffic') {
      const bounds = { xmin: 123.8, ymin: 10.2, xmax: 124.0, ymax: 10.4 };
      try {
        const data = await getTraffic(bounds);
        setTrafficData(data);
        setHazardData(null); // clear hazard when traffic is shown
      } catch (err) {
        console.error("Failed to fetch traffic:", err);
      }
      return;
    }

    // Hazard layers
    const bounds = { xmin: 123.8, ymin: 10.2, xmax: 124.0, ymax: 10.4 };
    
    let hazardType = null;
    let expectedSeverity = null;

    if (filterLabel === 'Flood') hazardType = 'flood';
    else if (filterLabel === 'Landslide') hazardType = 'landslide';
    else if (filterLabel.startsWith('Storm Surge')) {
      hazardType = 'storm_surge';
      const level = filterLabel.replace('Storm Surge ', '');
      expectedSeverity = `Level ${level}`;
    }

    try {
      const data = await getHazards(bounds, hazardType);
      
      if (expectedSeverity && data && data.features) {
        data.features = data.features.filter(f => f.properties.severity === expectedSeverity);
      }
      
      setTrafficData(null); // clear traffic when hazard is shown
      setHazardData(data);
      setHazardVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to fetch hazards:", err);
    }
  };

  const handleToggleMode = () => {
    setIsAIMode(!isAIMode);
  };

  const handleFabClick = () => {
    if (geminiMarker) {
      // Clear current analysis
      setGeminiMarker(null);
      setIsPanelOpen(false);
      return;
    }
    
    setIsPlacingMarker((prev) => {
      const nextState = !prev;
      if (nextState) {
        setIsPanelOpen(false);
        setIsPropertyPanelOpen(false);
      }
      return nextState;
    });
  };

  const handleOpenFeatures = () => {
    setPanelMode('features');
    setIsPanelOpen(true);
    setIsPropertyPanelOpen(false);
  };

  const handleMarkerPlaced = async (coords) => {
    setGeminiMarker(coords);
    setIsPlacingMarker(false);
    
    try { 
      const result = await generateRecommendation(coords.lat, coords.lng, 'New Site'); 
      if (result && result.analysis && result.analysis.competitors) {
        setCompetitorMarkers(result.analysis.competitors);
      }
      setPanelMode('ai');
      setIsPanelOpen(true);
    } catch (e) {
      console.error("Analysis failed:", e);
    }
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setIsPropertyPanelOpen(true);
    setIsPanelOpen(false); // Close analysis if property info is open
  };

  const handleChooseLocation = async (property) => {
    setIsPropertyPanelOpen(false);
    const coords = { lat: property.lat, lng: property.long };
    setGeminiMarker(coords);
    
    try {
      const result = await generateRecommendation(coords.lat, coords.lng, property.title);
      if (result && result.analysis && result.analysis.competitors) {
        setCompetitorMarkers(result.analysis.competitors);
      }
      setPanelMode('ai');
      setIsPanelOpen(true);
    } catch (e) {
      console.error("Analysis failed:", e);
    }
  };

  // Exit modes via Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPlacingMarker) setIsPlacingMarker(false);
        if (isPanelOpen) setIsPanelOpen(false);
        if (isPropertyPanelOpen) setIsPropertyPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlacingMarker, isPanelOpen, isPropertyPanelOpen]);

  const mapComponent = (
    <MapCanvas
      selectedSiteId={selectedSiteId}
      onSiteSelect={setSelectedSiteId}
      isPlacingMarker={isPlacingMarker}
      setIsPlacingMarker={setIsPlacingMarker}
      onMarkerPlaced={handleMarkerPlaced}
      geminiMarker={geminiMarker}
      hazardData={hazardData}
      hazardVersion={hazardVersion}
      trafficData={trafficData}
      buyingProperties={buyingProperties}
      onPropertySelect={handlePropertySelect}
      competitorMarkers={competitorMarkers}
      onBoundsChanged={handleBoundsChanged}
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
      onOpenFeatures={handleOpenFeatures}
      geminiMarker={geminiMarker}
      onFilterChange={handleFilterChange}
      onRegionChange={(region) => console.log("Region changed to:", region)}
    />
  );

  const sidePanelComponent = (
    <>
      <SidePanel
        isOpen={isPanelOpen}
        mode={panelMode}
        setMode={setPanelMode}
        hasAIAccess={hasAIAccess}
        poi={geminiMarker ? {
          id: `new-site-${geminiMarker.lat}-${geminiMarker.lng}`,
          title: selectedProperty ? selectedProperty.title : 'Selected Site',
          type: 'Target Location',
          rating: 4.8
        } : null}
        onClose={() => setIsPanelOpen(false)}
      />
      
      <PropertySidePanel
        isOpen={isPropertyPanelOpen}
        property={selectedProperty}
        onClose={() => setIsPropertyPanelOpen(false)}
        onChooseLocation={handleChooseLocation}
      />
    </>
  );

  return (
    <MapDashboardLayout
      mapComponent={mapComponent}
      hudComponent={hudComponent}
      sidePanelComponent={sidePanelComponent}
    />
  );
};
