import React, { useCallback, useState, useMemo, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, Data, InfoWindow } from '@react-google-maps/api';
import { MapMarker } from '../molecules/MapMarker';

const containerStyle = {
  width: '100vw',
  height: '100vh',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0
};

export const REGION_CONFIG = {
  cebu: {
    center: { lat: 10.3157, lng: 123.8854 },
    zoom: 12
  },
  manila: {
    center: { lat: 14.5995, lng: 120.9842 },
    zoom: 12
  }
};

export const REGION_BOUNDS = {
  cebu: {
    north: 10.42,   // includes Talamban / Busay
    south: 10.20,   // includes SRP / Talisay border
    west: 123.75,   // mountain side past Busay
    east: 124.10,   // fully covers Mactan / Lapu-Lapu
  },
  manila: {
    north: 14.72,
    south: 14.50,
    west: 120.90,
    east: 121.10,
  },
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

/* --- Enhanced Premium Restaurant Marker --- */
const RestaurantMarker = React.memo(({ restaurant, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        // Float the marker up when hovered or active
        top: isActive || isHovered ? '-22px' : '-15px',
        left: '-15px',
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // playful spring effect
        transform: isActive || isHovered ? 'scale(1.15)' : 'scale(1)',
        zIndex: isActive || isHovered ? 100 : 1
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(restaurant.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        width: '30px',
        height: '30px',
        background: 'linear-gradient(135deg, #4da1ff 0%, #1a73e8 100%)',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isActive || isHovered
          ? '0 8px 16px rgba(26, 115, 232, 0.5)'
          : '0 4px 10px rgba(0, 0, 0, 0.4)',
        border: isActive ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease-in-out',
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          transform: 'rotate(45deg)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
        }} />
      </div>

      {/* Soft shadow anchor beneath the pin */}
      <div style={{
        position: 'absolute',
        bottom: isActive || isHovered ? '-10px' : '-4px',
        left: '15px',
        width: isActive || isHovered ? '18px' : '12px',
        height: '4px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: '50%',
        transform: 'translateX(-50%)',
        filter: 'blur(2px)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: isActive || isHovered ? 0.3 : 0.6
      }} />
    </div>
  );
});

export const MapCanvas = ({
  hazardData,
  trafficData,
  sites = [],
  selectedSiteId,
  onSiteSelect,
  isPlacingMarker,
  setIsPlacingMarker,
  onMarkerPlaced,
  geminiMarker,
  restaurants = [],
  region = 'cebu'
}) => {

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const isProcessingClick = useRef(false);

  // Region panning logic
  const panToRegion = useCallback((regionName) => {
    if (!map || !regionName) return;

    const key = regionName.toLowerCase();
    const config = REGION_CONFIG[key];
    const bounds = REGION_BOUNDS[key];

    if (config && bounds) {
      // 🔒 Lock camera to region
      map.setOptions({
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });

      // 🎯 Move camera
      map.panTo(config.center);
      map.setZoom(config.zoom);
    }
  }, [map]);

  React.useEffect(() => {
    if (map && region) {
      panToRegion(region);
    }
  }, [map, region, panToRegion]);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const handleMapClick = useCallback((e) => {
    if (!isPlacingMarker || isProcessingClick.current) return;
    isProcessingClick.current = true;
    onMarkerPlaced({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setIsPlacingMarker(false);
    setTimeout(() => { isProcessingClick.current = false; }, 300);
  }, [isPlacingMarker, onMarkerPlaced, setIsPlacingMarker]);

  const mapOptions = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    draggableCursor: isPlacingMarker ? "crosshair" : "grab",
    disableDoubleClickZoom: isPlacingMarker
  }), [isPlacingMarker]);

  const getPixelPositionOffset = useCallback((offsetWidth, offsetHeight) => ({ x: 0, y: 0 }), []);

  // Use a slight vertical offset for InfoWindow positioning
  const activeRestaurant = useMemo(() => {
    return restaurants.find(r => r.id === activeRestaurantId);
  }, [restaurants, activeRestaurantId]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={REGION_CONFIG.cebu.center}
      zoom={REGION_CONFIG.cebu.zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={mapOptions}
    >
      {hazardData && <Data options={{ fillColor: "red", strokeColor: "red", strokeWeight: 2, fillOpacity: 0.3 }} onLoad={data => data.addGeoJson(hazardData)} />}
      {trafficData && <Data options={{ fillColor: "orange", strokeColor: "orange", strokeWeight: 3, fillOpacity: 0.5 }} onLoad={data => data.addGeoJson(trafficData)} />}

      {sites.map(site => (
        <OverlayView key={`site-${site.id}`} position={{ lat: site.lat, lng: site.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPixelPositionOffset}>
          <MapMarker isSelected={selectedSiteId === site.id} onClick={() => onSiteSelect(site.id)} />
        </OverlayView>
      ))}

      {geminiMarker && (
        <OverlayView position={geminiMarker} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPixelPositionOffset}>
          <MapMarker isSelected onClick={() => onMarkerPlaced(geminiMarker)} />
        </OverlayView>
      )}

      {/* Render Premium Restaurant Markers */}
      {restaurants.map(rest => (
        <OverlayView
          key={`restaurant-${rest.id}`}
          position={{ lat: rest.lat, lng: rest.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={getPixelPositionOffset}
        >
          <RestaurantMarker
            restaurant={rest}
            isActive={activeRestaurantId === rest.id}
            onClick={setActiveRestaurantId}
          />
        </OverlayView>
      ))}

      {/* Enhanced InfoWindow for active restaurant */}
      {activeRestaurant && window.google && (
        <InfoWindow
          position={{ lat: activeRestaurant.lat, lng: activeRestaurant.lng }}
          onCloseClick={() => setActiveRestaurantId(null)}
          options={{ pixelOffset: new window.google.maps.Size(0, -45) }}
        >
          <div style={{
            color: '#1a1a1a',
            padding: '8px 4px',
            maxWidth: '240px',
            fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif'
          }}>
            <h4 style={{
              margin: '0 0 6px 0',
              fontSize: '15px',
              fontWeight: '700',
              color: '#1a73e8',
              lineHeight: '1.2'
            }}>
              {activeRestaurant.name}
            </h4>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              lineHeight: '1.4',
              color: '#5f6368'
            }}>
              {activeRestaurant.address}
            </p>
            {activeRestaurant.rating && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#fff8e1',
                padding: '4px 8px',
                borderRadius: '12px',
                border: '1px solid #ffe082'
              }}>
                <span style={{ color: '#f5b400', marginRight: '4px', fontSize: '14px' }}>★</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#b28900' }}>
                  {activeRestaurant.rating}
                </span>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : <div style={{ ...containerStyle, backgroundColor: '#121212' }} />;
};