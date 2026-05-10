import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, Marker, MarkerClusterer } from '@react-google-maps/api';
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

// Clean Green Pin SVG
const GREEN_PIN_SVG = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 36">
  <path d="M12 0C5.373 0 0 5.373 0 12c0 8.4 12 24 12 24s12-15.6 12-24c0-6.627-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="#28a745" stroke="#1b702e" stroke-width="1.5"/>
</svg>`);

export const MapCanvas = ({
  hazardData,
  hazardVersion = 0,
  trafficData,
  sites = [],
  selectedSiteId,
  onSiteSelect,
  isPlacingMarker,
  setIsPlacingMarker,
  onMarkerPlaced,
  geminiMarker,
  buyingProperties = [],
  onPropertySelect,
  competitorMarkers = [],
  onBoundsChanged
}) => {

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const isProcessingClick = useRef(false);

  const onLoad = useCallback((mapInstance) => { setMap(mapInstance); }, []);
  const onUnmount = useCallback(() => { setMap(null); }, []);

  useEffect(() => {
    if (!map) return;
    map.data.forEach((feature) => { map.data.remove(feature); });

    if (hazardData && hazardData.features && hazardData.features.length > 0) {
      try {
        map.data.addGeoJson(hazardData);
        map.data.setStyle({
          fillColor: "#FF0000",
          strokeColor: "#CC0000",
          strokeWeight: 1,
          fillOpacity: 0.4
        });
      } catch (e) { console.error("Hazard error:", e); }
    } else if (trafficData && trafficData.features && trafficData.features.length > 0) {
      try {
        map.data.addGeoJson(trafficData);
        map.data.setStyle({
          fillColor: "orange",
          strokeColor: "#CC6600",
          strokeWeight: 2,
          fillOpacity: 0.5
        });
      } catch (e) { console.error("Traffic error:", e); }
    }
  }, [map, hazardData, trafficData, hazardVersion]);

  const handleMapClick = useCallback((e) => {
    if (!isPlacingMarker || isProcessingClick.current) return;
    isProcessingClick.current = true;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    onMarkerPlaced({ lat, lng });
    setIsPlacingMarker(false);
    setTimeout(() => { isProcessingClick.current = false; }, 300);
  }, [isPlacingMarker, onMarkerPlaced, setIsPlacingMarker]);

  const handleIdle = useCallback(() => {
    if (map && onBoundsChanged) {
      const bounds = map.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onBoundsChanged({
          xmin: sw.lng(),
          ymin: sw.lat(),
          xmax: ne.lng(),
          ymax: ne.lat(),
          min_lat: sw.lat(),
          max_lat: ne.lat(),
          min_lng: sw.lng(),
          max_lng: ne.lng(),
          zoom: map.getZoom()
        });
      }
    }
  }, [map, onBoundsChanged]);

  const mapOptions = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    draggableCursor: isPlacingMarker ? "crosshair" : "grab",
    disableDoubleClickZoom: isPlacingMarker
  }), [isPlacingMarker]);

  const getPixelPositionOffset = (offsetWidth, offsetHeight) => ({ x: 0, y: 0 });

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      onIdle={handleIdle}
      options={mapOptions}
    >
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

      {/* Competitor markers (Blue Pins) */}
      {competitorMarkers.map((marker, idx) => (
        <OverlayView
          key={`comp-${idx}`}
          position={marker.pos || { lat: marker.lat, lng: marker.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={getPixelPositionOffset}
        >
          <MapMarker
            color="#3399FF"
            onClick={() => console.log("Selected competitor:", marker.name)}
          />
        </OverlayView>
      ))}

      {/* Buying properties markers (Green Pins) - Clustered */}
      <MarkerClusterer
        options={{
          gridSize: 50,
          maxZoom: 15,
          zoomOnClick: true
        }}
      >
        {(clusterer) =>
          buyingProperties.map(property => (
            <Marker
              key={property.url}
              position={{ lat: property.lat, lng: property.long }}
              clusterer={clusterer}
              icon={window.google ? {
                url: GREEN_PIN_SVG,
                scaledSize: new window.google.maps.Size(30, 42),
                anchor: new window.google.maps.Point(15, 42)
              } : undefined}
              onClick={() => onPropertySelect && onPropertySelect(property)}
            />
          ))
        }
      </MarkerClusterer>

    </GoogleMap>
  ) : (
    <div style={{ ...containerStyle, backgroundColor: '#121212' }} />
  );
};