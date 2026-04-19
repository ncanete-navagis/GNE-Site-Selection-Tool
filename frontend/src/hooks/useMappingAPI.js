import { useState, useCallback, useRef } from 'react';

/**
 * Hook to manage Google Maps Platform SDK integration.
 * Orchestrates map loading, events, and marker interaction.
 */
export const useMappingAPI = (initialCenter) => {
  const [map, setMap] = useState(null);
  const [mapState, setMapState] = useState({
    center: initialCenter,
    zoom: 12,
    bounds: null,
  });
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Initializer function for the map instance.
   */
  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    
    // Initial bounds capture
    setMapState(prev => ({
      ...prev,
      bounds: mapInstance.getBounds()?.toJSON() || null
    }));
  }, []);

  /**
   * Cleanup function for the map instance.
   */
  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  /**
   * Handler for Map Idle event (triggered after pan/zoom)
   * Captures the new spatial state.
   */
  const onMapIdle = useCallback(() => {
    if (!map) return;
    
    setMapState({
      center: map.getCenter().toJSON(),
      zoom: map.getZoom(),
      bounds: map.getBounds().toJSON(),
    });
  }, [map]);

  /**
   * Handler for Site/Marker click event.
   */
  const onMarkerClick = useCallback((poi) => {
    setSelectedPOI(poi);
    setIsSidebarOpen(true);
    
    if (map) {
      map.panTo(poi.pos);
    }
  }, [map]);

  /**
   * General Map Click Handler (e.g., to close panels)
   */
  const onMapClick = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return {
    map,
    mapState,
    selectedPOI,
    isSidebarOpen,
    onMapLoad,
    onMapUnmount,
    onMapIdle,
    onMarkerClick,
    onMapClick,
    setIsSidebarOpen,
    setSelectedPOI
  };
};
