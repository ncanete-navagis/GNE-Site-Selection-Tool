import React, { useCallback, useState, useMemo, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, Data } from '@react-google-maps/api';
import { MapMarker } from '../molecules/MapMarker';

const containerStyle = {
  width: '100vw',
  height: '100vh',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0
};

const center = {
  lat: 10.3157, // Cebu City
  lng: 123.8854
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

export const MapCanvas = ({
  hazardData,
  trafficData,
  sites = [],
  selectedSiteId,
  onSiteSelect,
  isPlacingMarker,
  setIsPlacingMarker,
  onMarkerPlaced,
  geminiMarker
}) => {

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);

  // Guard against race conditions for double clicks
  const isProcessingClick = useRef(false);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e) => {
    if (!isPlacingMarker || isProcessingClick.current) return;

    // Prevent immediate double-fires
    isProcessingClick.current = true;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    onMarkerPlaced({ lat, lng });
    setIsPlacingMarker(false);

    // Release guard after a short delay to prevent double-click zooms acting as second clicks
    setTimeout(() => {
      isProcessingClick.current = false;
    }, 300);
  }, [isPlacingMarker, onMarkerPlaced, setIsPlacingMarker]);

  // Memoize map options to prevent unnecessary map re-renders while updating dynamic props
  const mapOptions = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    draggableCursor: isPlacingMarker ? "crosshair" : "grab",
    // Prevent double clicking from zooming while we are trying to place a marker
    disableDoubleClickZoom: isPlacingMarker
  }), [isPlacingMarker]);

  // Optional: A helper function to properly center custom DOM elements over the coordinate.
  // Note: Your MapMarker already has a top/left -20px offset, so we return 0 here to prevent double-offsetting.
  // But if you ever remove the -20px from MapMarker, change this to return { x: -20, y: -20 }.
  const getPixelPositionOffset = useCallback((offsetWidth, offsetHeight) => {
    return { x: 0, y: 0 };
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={mapOptions}
    >
      {hazardData && (
        <Data
          options={{ fillColor: "red", strokeColor: "red", strokeWeight: 2, fillOpacity: 0.3 }}
          onLoad={data => data.addGeoJson(hazardData)}
        />
      )}
      {trafficData && (
        <Data
          options={{ fillColor: "orange", strokeColor: "orange", strokeWeight: 3, fillOpacity: 0.5 }}
          onLoad={data => data.addGeoJson(trafficData)}
        />
      )}
      {/* Existing markers */}
      {sites.map(site => (
        <OverlayView
          key={site.id}
          position={{ lat: site.lat, lng: site.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={getPixelPositionOffset}
        >
          <MapMarker
            isSelected={selectedSiteId === site.id}
            onClick={() => onSiteSelect(site.id)}
          />
        </OverlayView>
      ))}

      {/* Gemini marker */}
      {geminiMarker && (
        <OverlayView
          position={geminiMarker}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={getPixelPositionOffset}
        >
          <MapMarker isSelected onClick={() => onMarkerPlaced(geminiMarker)} />
        </OverlayView>
      )}

    </GoogleMap>
  ) : (
    <div style={{ ...containerStyle, backgroundColor: '#121212' }} />
  );
};