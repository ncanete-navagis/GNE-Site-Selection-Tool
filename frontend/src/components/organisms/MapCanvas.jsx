import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, MarkerF, MarkerClustererF, DrawingManagerF, PolylineF, PolygonF, InfoWindowF, CircleF } from '@react-google-maps/api';
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

const LIBRARIES = ['drawing', 'geometry'];

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

const GET_PIN_SVG = (fill = '#ff4444', stroke = '#cc0000') => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 36">
  <path d="M12 0C5.373 0 0 5.373 0 12c0 8.4 12 24 12 24s12-15.6 12-24c0-6.627-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
</svg>`);

const GET_DOT_SVG = (fill = '#ff4444', stroke = '#ffffff') => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <circle cx="8" cy="8" r="6" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
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
  onBoundsChanged,
  focusedLocation,
  selectedPropertyPolygon,
  isDrawing,
  onDrawingComplete,
  finishTrigger = 0,
  restaurantMarkers = [],
  radius = 1000
}) => {

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES
  });

  const [map, setMap] = useState(null);
  const [drawnObjects, setDrawnObjects] = useState([]);
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState([]);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const isProcessingClick = useRef(false);

  const onLoad = useCallback((mapInstance) => { setMap(mapInstance); }, []);
  const onUnmount = useCallback(() => { setMap(null); }, []);

  const onPolygonComplete = useCallback((polygon) => {
    if (!window.google || !polygon) return;

    const path = polygon.getPath();
    const points = [];
    for (let i = 0; i < path.getLength(); i++) {
      const p = path.getAt(i);
      points.push({ lat: p.lat(), lng: p.lng() });
    }

    const area = window.google.maps.geometry.spherical.computeArea(path);
    const perimeter = window.google.maps.geometry.spherical.computeLength(path);

    onDrawingComplete({
      area: Math.round(area),
      perimeter: Math.round(perimeter),
      points
    });

    setDrawnObjects(prev => [...prev, polygon]);
  }, [onDrawingComplete]);

  // Handle "Finish Drawing" trigger
  useEffect(() => {
    if (finishTrigger > 0 && currentDrawingPoints.length >= 3) {
      if (!window.google) return;

      const path = currentDrawingPoints.map(p => new window.google.maps.LatLng(p.lat, p.lng));
      const area = window.google.maps.geometry.spherical.computeArea(path);
      const perimeter = window.google.maps.geometry.spherical.computeLength(path);

      onDrawingComplete({
        area: Math.round(area),
        perimeter: Math.round(perimeter),
        points: currentDrawingPoints
      });

      // We'll let the PolygonF handle the visualization of the result if needed, 
      // but for now we just finish the drawing session.
      setCurrentDrawingPoints([]);
    }
  }, [finishTrigger, onDrawingComplete]);

  // Clear drawings when isDrawing becomes false
  useEffect(() => {
    if (!isDrawing) {
      setCurrentDrawingPoints([]);
      if (drawnObjects.length > 0) {
        drawnObjects.forEach(obj => obj.setMap(null));
        setDrawnObjects([]);
      }
    }
  }, [isDrawing]);

  // Handle focused location (zoom in)
  useEffect(() => {
    if (map && focusedLocation) {
      map.panTo({ lat: focusedLocation.lat, lng: focusedLocation.lng });
      if (focusedLocation.zoom) {
        map.setZoom(focusedLocation.zoom);
      }
    }
  }, [map, focusedLocation]);

  useEffect(() => {
    if (!map) return;
    map.data.forEach((feature) => { map.data.remove(feature); });

    // 1. Property Polygon (Highest Priority)
    if (selectedPropertyPolygon) {
      try {
        // Wrap the raw geometry in a FeatureCollection to satisfy Google Maps API
        const featureCollection = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: selectedPropertyPolygon,
            properties: { dataType: 'property' }
          }]
        };
        map.data.addGeoJson(featureCollection);
      } catch (e) { console.error("Property polygon error:", e); }
    }

    // 2. Hazards
    if (hazardData && hazardData.features && hazardData.features.length > 0) {
      try {
        const features = map.data.addGeoJson(hazardData);
        features.forEach(f => f.setProperty('dataType', 'hazard'));
      } catch (e) { console.error("Hazard error:", e); }
    }

    // 3. Traffic
    if (trafficData && trafficData.features && trafficData.features.length > 0) {
      try {
        const features = map.data.addGeoJson(trafficData);
        features.forEach(f => f.setProperty('dataType', 'traffic'));
      } catch (e) { console.error("Traffic error:", e); }
    }

    // Dynamic Styling based on feature property
    map.data.setStyle((feature) => {
      const type = feature.getProperty('dataType');
      if (type === 'property') {
        return {
          fillColor: "#4285F4",
          strokeColor: "#4285F4",
          strokeWeight: 3,
          fillOpacity: 0.3,
          clickable: false
        };
      }
      if (type === 'hazard') {
        return {
          fillColor: "#ff4444",
          strokeColor: "#ff4444",
          strokeWeight: 1,
          fillOpacity: 0.4,
          clickable: false
        };
      }
      if (type === 'traffic') {
        return {
          fillColor: "orange",
          strokeColor: "#CC6600",
          strokeWeight: 2,
          fillOpacity: 0.5,
          clickable: false
        };
      }
      if (type === 'building') {
        return {
          fillColor: "#ffffff",
          strokeColor: "#666666",
          strokeWeight: 1,
          fillOpacity: 0.6,
          clickable: true
        };
      }
      return {};
    });

  }, [map, hazardData, trafficData, hazardVersion, selectedPropertyPolygon]);

  const handleMapClick = useCallback((e) => {
    if (isDrawing) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setCurrentDrawingPoints(prev => [...prev, { lat, lng }]);
      return;
    }

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
      {/* Manual Drawing Preview */}
      {isDrawing && currentDrawingPoints.length > 0 && (
        <>
          <PolylineF
            path={currentDrawingPoints}
            options={{
              strokeColor: '#4285F4',
              strokeOpacity: 0.8,
              strokeWeight: 3,
            }}
          />
          {currentDrawingPoints.map((p, i) => (
            <MarkerF
              key={`draw-pt-${i}`}
              position={p}
              icon={window.google ? {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 5
              } : undefined}
            />
          ))}
        </>
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

      {/* Gemini marker & Analysis Radius Circle */}
      {geminiMarker && (
        <>
          <CircleF
            center={geminiMarker}
            radius={radius}
            options={{
              strokeColor: '#4285F4',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#4285F4',
              fillOpacity: 0.15,
              clickable: false,
              zIndex: 1
            }}
          />
          <OverlayView
            position={geminiMarker}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPixelPositionOffset}
          >
            <MapMarker isSelected onClick={() => onMarkerPlaced(geminiMarker)} />
          </OverlayView>
        </>
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
      <MarkerClustererF
        key={`cluster-${buyingProperties.length}`}
        options={{
          gridSize: 50,
          maxZoom: 15,
          zoomOnClick: true
        }}
      >
        {(clusterer) =>
          buyingProperties.map((property, idx) => (
            <MarkerF
              key={`${property.url}-${idx}`}
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
      </MarkerClustererF>

      {/* Restaurant location pins (Red Pins) */}
      {restaurantMarkers.map((restaurant, idx) => (
        <MarkerF
          key={`restaurant-${restaurant.id || idx}`}
          position={{ lat: restaurant.lat, lng: restaurant.lng }}
          icon={window.google ? {
            url: GET_DOT_SVG(restaurant.pinColor),
            scaledSize: new window.google.maps.Size(16, 16),
            anchor: new window.google.maps.Point(8, 8)
          } : undefined}
          onClick={() => setActiveRestaurant(restaurant)}
        />
      ))}

      {activeRestaurant && (
        <InfoWindowF
          position={{ lat: activeRestaurant.lat, lng: activeRestaurant.lng }}
          onCloseClick={() => setActiveRestaurant(null)}
        >
          <div style={{ padding: '8px', color: '#333' }}>
            <h4 style={{ margin: '0 0 4px 0' }}>{activeRestaurant.name}</h4>
            <p style={{ margin: 0, fontSize: '12px' }}>{activeRestaurant.address}</p>
          </div>
        </InfoWindowF>
      )}

    </GoogleMap>
  ) : (
    <div style={{ ...containerStyle, backgroundColor: '#121212' }} />
  );
};