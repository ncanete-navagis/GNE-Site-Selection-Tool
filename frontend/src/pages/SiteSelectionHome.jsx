import React, { useState, useEffect, useCallback } from 'react';
import { MapDashboardLayout } from '../components/templates/MapDashboardLayout';
import { MapCanvas } from '../components/organisms/MapCanvas';
import { OverlayHUD } from '../components/organisms/OverlayHUD';
import { SidePanel } from '../components/organisms/SidePanel';
import { PropertySidePanel } from '../components/organisms/PropertySidePanel';
import { MapToolsPanel } from '../components/organisms/MapToolsPanel';
import { DefaultHUD } from '../components/organisms/DefaultHUD';
import { DrawingResultPopup } from '../components/molecules/DrawingResultPopup';
import { useBackendAPI } from '../hooks/useBackendAPI';
import TutorialTour from '../tutorial/TutorialTour';

export const SiteSelectionHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState(null);

  // Filter States
  const [activeHazardFilter, setActiveHazardFilter] = useState('None');
  const [currentMapBounds, setCurrentMapBounds] = useState({ xmin: 123.8, ymin: 10.2, xmax: 124.0, ymax: 10.4 });

  // Left Side Panel State (Analysis/AI)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('features'); // 'features' | 'ai'
  const [hasAIAccess, setHasAIAccess] = useState(true);

  // Right Side Panel State (Property Details)
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Map Data State
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiMarker, setGeminiMarker] = useState(null);
  
  // Analysis Criteria States
  const [analysisRadius, setAnalysisRadius] = useState(1000);
  const [targetPopulation, setTargetPopulation] = useState(5000);
  const [targetTrafficKmh, setTargetTrafficKmh] = useState(30);
  const [targetLotArea, setTargetLotArea] = useState(500);
  const [selectedSectors, setSelectedSectors] = useState([]);

  const [hazardData, setHazardData] = useState(null);
  const [hazardVersion, setHazardVersion] = useState(0);
  const [trafficData, setTrafficData] = useState(null);
  const [buyingProperties, setBuyingProperties] = useState([]);
  const [competitorMarkers, setCompetitorMarkers] = useState([]);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [selectedPropertyPolygon, setSelectedPropertyPolygon] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('Cebu');
  const [restaurantFilters, setRestaurantFilters] = useState([]);
  const [restaurantMarkers, setRestaurantMarkers] = useState([]);

  // Drawing Feature States
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingResult, setDrawingResult] = useState(null);
  const [isDrawingResultVisible, setIsDrawingResultVisible] = useState(false);

  const { 
    generateRecommendation, 
    getHazards, 
    getTraffic, 
    getBuyingProperties,
    searchRestaurants,
    getPOIs,
    getBuildings,
    getChoropleth,
    getChoroplethRadius
  } = useBackendAPI();

  const [isChoroplethOn, setIsChoroplethOn] = useState(false);
  const [choroplethData, setChoroplethData] = useState(null);

  const isHeatMapOn = activeHazardFilter === 'Heat Map';

  // Fetch Choropleth Data when enabled or region changes
  const isDropdownChoropleth = activeHazardFilter === 'Choropleth';

  useEffect(() => {
    const fetchChoropleth = async () => {
      if (isChoroplethOn && geminiMarker) {
        // Toggle is ON -> Radius mode
        try {
          const data = await getChoroplethRadius(geminiMarker.lat, geminiMarker.lng);
          setChoroplethData(data);
        } catch (err) {
          console.error("Failed to fetch radius choropleth data:", err);
        }
      } else if (!isChoroplethOn && isDropdownChoropleth) {
        // Toggle OFF -> Region mode
        try {
          const data = await getChoropleth(selectedRegion);
          setChoroplethData(data);
        } catch (err) {
          console.error("Failed to fetch region choropleth data:", err);
        }
      } else {
        setChoroplethData(null);
      }
    };
    fetchChoropleth();
  }, [isChoroplethOn, isDropdownChoropleth, geminiMarker, selectedRegion, getChoropleth, getChoroplethRadius]);

  const [poisByCategory, setPoisByCategory] = useState({});

  const SECTOR_TO_GOOGLE_TYPE = {
    'Banks': 'bank',
    'Schools': 'school',
    'Malls': 'shopping_mall',
    'Hospitals': 'hospital',
    'Restaurants': 'restaurant'
  };

  // Helper to calculate distance in meters between two lat/lng points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

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
    setCurrentMapBounds(bounds);
    try {
      // Fetch properties
      const properties = await getBuyingProperties(bounds);
      setBuyingProperties(properties || []);

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
        } else if (activeHazardFilter === 'Building Data') {
          const data = await getBuildings(bounds, selectedRegion);
          setHazardData(data);
          setHazardVersion(v => v + 1);
          return;
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
    
    if (filterLabel === 'Building Data') {
      try {
        const data = await getBuildings(currentMapBounds, selectedRegion);
        setTrafficData(null);
        setHazardData(data);
        setHazardVersion(v => v + 1);
      } catch (err) {
        console.error("Failed to fetch buildings:", err);
      }
      return;
    }

    if (filterLabel === 'Choropleth' || filterLabel === 'Heat Map') {
      setTrafficData(null);
      setHazardData(null);
      return;
    }

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

  // Fetch POIs for all selected sectors and restaurant filters
  useEffect(() => {
    const fetchAllRequiredPOIs = async () => {
      const requiredTypes = new Set();
      
      // Add sector types
      selectedSectors.forEach(sector => {
        if (SECTOR_TO_GOOGLE_TYPE[sector]) {
          requiredTypes.add(SECTOR_TO_GOOGLE_TYPE[sector]);
        }
      });

      // Add restaurant filters
      restaurantFilters.forEach(filter => {
        requiredTypes.add(filter);
      });

      if (requiredTypes.size === 0) {
        setPoisByCategory({});
        return;
      }

      const newPoisMap = {};
      for (const type of requiredTypes) {
        try {
          let data;
          if (geminiMarker) {
            data = await getPOIs(selectedRegion, type, geminiMarker.lat, geminiMarker.lng, analysisRadius);
          } else {
            data = await getPOIs(selectedRegion, type);
          }
          newPoisMap[type] = data || [];
        } catch (err) {
          console.error(`Failed to fetch POIs for ${type}:`, err);
        }
      }
      setPoisByCategory(newPoisMap);
    };

    fetchAllRequiredPOIs();
  }, [selectedRegion, selectedSectors, restaurantFilters, getPOIs, geminiMarker, analysisRadius]);

  // Derived state: Filtered Buying Properties based on 2km proximity
  const filteredBuyingProperties = React.useMemo(() => {
    const requiredTypes = [];
    selectedSectors.forEach(s => { if (SECTOR_TO_GOOGLE_TYPE[s]) requiredTypes.push(SECTOR_TO_GOOGLE_TYPE[s]); });
    restaurantFilters.forEach(f => requiredTypes.push(f));

    if (requiredTypes.length === 0) return buyingProperties;

    return buyingProperties.filter(prop => {
      // Must satisfy ALL required types (AND logic)
      return requiredTypes.every(type => {
        const pois = poisByCategory[type] || [];
        // Check if any POI of this type is within 2000 meters
        return pois.some(poi => {
          const dist = calculateDistance(prop.lat, prop.long, poi.lat, poi.lng);
          return dist <= 2000;
        });
      });
    });
  }, [buyingProperties, selectedSectors, restaurantFilters, poisByCategory]);


  // Update map markers (Red/Blue Pins) to show all selected POI types
  useEffect(() => {
    const markers = [];
    Object.entries(poisByCategory).forEach(([type, pois]) => {
      let color = '#ff4444'; // default red
      let stroke = '#cc0000';

      if (type === 'restaurant') {
        color = '#e91e63';
        stroke = '#ad1457';
      } else if (type === 'bank') {
        color = '#ff4444';
        stroke = '#cc0000';
      } else if (type === 'school') {
        color = '#ffeb3b';
        stroke = '#fbc02d';
      } else if (type === 'shopping_mall') {
        color = '#9c27b0';
        stroke = '#6a1b9a';
      } else if (type === 'hospital') {
        color = '#ff9800';
        stroke = '#e65100';
      }

      pois.forEach(p => {
        if (geminiMarker) {
          const dist = calculateDistance(geminiMarker.lat, geminiMarker.lng, p.lat, p.lng);
          if (dist <= analysisRadius) {
            markers.push({ ...p, pinColor: color, pinStroke: stroke });
          }
        } else {
          markers.push({ ...p, pinColor: color, pinStroke: stroke });
        }
      });
    });

    // De-duplicate by POI ID
    const uniquePois = Array.from(new Map(markers.map(p => [p.id, p])).values());
    setRestaurantMarkers(uniquePois);
  }, [poisByCategory, geminiMarker, analysisRadius]);


  // Fetch Restaurant Markers when Region or Filters change (for Red Pins)


  const handleFabClick = () => {
    if (geminiMarker) {
      // Clear current analysis
      setGeminiMarker(null);
      setSelectedPropertyPolygon(null);
      setIsPanelOpen(false);
      return;
    }
    
    setIsPlacingMarker((prev) => {
      const nextState = !prev;
      if (nextState) {
        setPanelMode('features');
        setIsPanelOpen(true);
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

  const runLocationAnalysis = async (coords, name) => {
    setGeminiMarker({ ...coords, title: name });
    setPanelMode('features');
    setIsPanelOpen(true);
    setIsAnalyzing(true);
    try {
      const criteria = {
        radius_m: analysisRadius,
        population: targetPopulation,
        traffic_kmh: targetTrafficKmh,
        lot_area: targetLotArea,
        business_sectors: selectedSectors
      };
      
      const result = await generateRecommendation(coords.lat, coords.lng, name, criteria);
      if (result && result.analysis && result.analysis.competitors) {
        setCompetitorMarkers(result.analysis.competitors);
      }
      // Update the geminiMarker with the analysis results to show in the UI
      setGeminiMarker({ ...coords, title: name, analysis: result.analysis });
    } catch (e) {
      console.error("Analysis failed:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    try {
      const res = await fetch(`http://localhost:8000/search/place-details?place_id=${suggestion.placeId}`);
      if (!res.ok) throw new Error("Failed to fetch place details");
      
      const details = await res.json();
      const coords = { lat: details.lat, lng: details.lng };
      
      // Update map camera
      setFocusedLocation({ ...coords, zoom: 16 });
      
      // Update marker and UI state
      setGeminiMarker({ 
        ...coords, 
        title: details.name,
        placeId: suggestion.placeId,
        address: details.address
      });
      setSelectedPropertyPolygon(null);
      setPanelMode('features');
      setIsPanelOpen(true);
      
    } catch (err) {
      console.error("Error handling suggestion select:", err);
    }
  };

  const handleMarkerPlaced = async (coords) => {
    // Initial optimistic update
    setGeminiMarker({ ...coords, title: 'New Site' });
    setSelectedPropertyPolygon(null);
    setIsPlacingMarker(false);
    setPanelMode('features');
    setIsPanelOpen(true);

    // Reverse geocode to get Place ID and Address
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results[0]) resolve(results[0]);
            else reject(status);
          });
        });
        
        let title = 'New Site';
        let address = result.formatted_address;
        
        // Find a shorter name from address_components (e.g. route or neighborhood)
        const nameComponent = result.address_components.find(c => 
          c.types.includes('route') || c.types.includes('neighborhood') || c.types.includes('point_of_interest') || c.types.includes('premise')
        );
        if (nameComponent) {
          title = nameComponent.long_name
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

        // Update the marker with fetched context
        setGeminiMarker(prev => ({
          ...prev,
          title: title,
          address: address,
          placeId: result.place_id
        }));
      } catch (e) {
        console.error("Reverse geocode failed:", e);
      }
    }
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setIsPropertyPanelOpen(true);
    setIsPanelOpen(false); // Close analysis if property info is open
  };

  const handleChooseLocation = (property) => {
    setIsPropertyPanelOpen(false);
    const coords = { lat: property.lat, lng: property.long };
    setFocusedLocation({ ...coords, zoom: 18 });
    
    // Set the polygon if it exists (backend now returns it as GeoJSON string)
    if (property.random_shape_polygon) {
      try {
        setSelectedPropertyPolygon(JSON.parse(property.random_shape_polygon));
      } catch (e) {
        console.error("Failed to parse property polygon:", e);
      }
    } else {
      setSelectedPropertyPolygon(null);
    }

    setGeminiMarker({ ...coords, title: property.title });
    setPanelMode('features');
    setIsPanelOpen(true);
  };

  const handleRunAnalysis = async () => {
    if (geminiMarker) {
      await runLocationAnalysis({ lat: geminiMarker.lat, lng: geminiMarker.lng }, geminiMarker.title || 'Selected Site');
    }
  };

  const handleDrawClick = () => {
    setIsDrawing(prev => {
      const next = !prev;
      if (next) {
        setIsPlacingMarker(false);
        setIsDrawingResultVisible(false);
      }
      return next;
    });
  };

  const handleDrawingComplete = (result) => {
    setDrawingResult(result);
    setIsDrawingResultVisible(true);
    setIsDrawing(false); // Stop drawing mode once complete
  };

  const handleClearDrawing = () => {
    setDrawingResult(null);
    setIsDrawingResultVisible(false);
  };

  const handleFinishDrawing = () => {
    // This will be caught by MapCanvas via a ref or a new trigger prop
    setFinishDrawingTrigger(prev => prev + 1);
  };

  const [finishDrawingTrigger, setFinishDrawingTrigger] = useState(0);

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

  const mapToolsComponent = (
    <MapToolsPanel 
      isPlacingMarker={isPlacingMarker}
      isDrawing={isDrawing}
      onDropPinClick={handleFabClick}
      onDrawClick={handleDrawClick}
      onFilterClick={handleOpenFeatures}
    />
  );

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
      buyingProperties={filteredBuyingProperties}
      onPropertySelect={handlePropertySelect}
      competitorMarkers={competitorMarkers}
      onBoundsChanged={handleBoundsChanged}
      focusedLocation={focusedLocation}
      selectedPropertyPolygon={selectedPropertyPolygon}
      isDrawing={isDrawing}
      onDrawingComplete={handleDrawingComplete}
      finishTrigger={finishDrawingTrigger}
      restaurantMarkers={restaurantMarkers}
      radius={analysisRadius}
      isChoroplethOn={isChoroplethOn || activeHazardFilter === 'Choropleth'}
      choroplethData={choroplethData}
      isHeatMapOn={isHeatMapOn}
    />
  );

  const hudComponent = (
    <OverlayHUD
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFabClick={handleFabClick}
      isPlacingMarker={isPlacingMarker}
      isDrawing={isDrawing}
      onDrawClick={handleDrawClick}
      onFinishDrawing={handleFinishDrawing}
      onOpenFeatures={handleOpenFeatures}
      geminiMarker={geminiMarker}
      onFilterChange={handleFilterChange}
      onRegionChange={setSelectedRegion}
      onSelectSuggestion={handleSelectSuggestion}
    />
  );

  const sidePanelComponent = (
    <>
      {isDrawingResultVisible && (
        <DrawingResultPopup 
          result={drawingResult} 
          onClear={handleClearDrawing}
          onClose={() => setIsDrawingResultVisible(false)}
        />
      )}
      
      <SidePanel
        isOpen={isPanelOpen}
        mode={panelMode}
        setMode={setPanelMode}
        hasAIAccess={hasAIAccess}
        poi={geminiMarker}
        radius={analysisRadius}
        setRadius={setAnalysisRadius}
        population={targetPopulation}
        setPopulation={setTargetPopulation}
        trafficKmh={targetTrafficKmh}
        setTrafficKmh={setTargetTrafficKmh}
        lotArea={targetLotArea}
        setLotArea={setTargetLotArea}
        isAnalyzing={isAnalyzing}
        selectedSectors={selectedSectors}
        setSelectedSectors={setSelectedSectors}
        onFiltersChange={setRestaurantFilters}
        onRunAnalysis={handleRunAnalysis}
        onClose={() => setIsPanelOpen(false)}
        isChoroplethOn={isChoroplethOn}
        setIsChoroplethOn={setIsChoroplethOn}
        poisByCategory={poisByCategory}
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
    <>
      <MapDashboardLayout
        mapComponent={mapComponent}
        hudComponent={hudComponent}
        sidePanelComponent={sidePanelComponent}
      />
      <TutorialTour onSidePanelOpen={() => setIsPanelOpen(true)} />
    </>
  );
};
