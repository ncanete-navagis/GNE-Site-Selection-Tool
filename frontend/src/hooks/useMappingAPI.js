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
  const [markers, setMarkers] = useState([
    { id: '1', pos: { lat: 10.33, lng: 123.93 }, title: "Pacific Mall", type: "mall", rating: 4.2, reviews: 1200 },
    { id: '2', pos: { lat: 10.31, lng: 123.89 }, title: "Cebu City Center", type: "city", rating: 4.8, reviews: 8500 },
    { id: '3', pos: { lat: 10.34, lng: 123.95 }, title: "Maayo Hotel", type: "hotel", rating: 4.5, reviews: 3200 }
  ]);
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
    // Open sidebar only for existing POIs, or use popup for others
    // For this task, we want the marker popup
  }, []);

  /**
   * General Map Click Handler (drops a new marker)
   */
  const onMapClick = useCallback((e) => {
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    const newMarker = {
      id: Date.now().toString(),
      pos: newPos,
      title: "New Location",
      type: "new",
      rating: 0,
      reviews: 0
    };
    
    setMarkers(prev => [...prev, newMarker]);
    setSelectedPOI(newMarker);
    
    if (map) {
      map.panTo(newPos);
    }
  }, [map]);

  return {
    map,
    mapState,
    markers,
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

