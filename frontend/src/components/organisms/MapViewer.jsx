import React, { useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%'
}

const center = {
  lat: 10.3157, // Cebu City
  lng: 123.8854
}

const MapViewer = ({ 
  onLoad, 
  onUnmount, 
  onIdle, 
  onMarkerClick, 
  onMapClick 
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  })

  // Sample POIs (In production, these would come from an API/Context)
  const markers = useMemo(() => [
    { id: 1, pos: { lat: 10.33, lng: 123.93 }, title: "Pacific Mall", type: "mall" },
    { id: 2, pos: { lat: 10.31, lng: 123.89 }, title: "Cebu City Center", type: "city" },
    { id: 3, pos: { lat: 10.34, lng: 123.95 }, title: "Maayo Hotel", type: "hotel" }
  ], [])

  return isLoaded ? (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onIdle={onIdle}
        onClick={onMapClick}
        options={{
          disableDefaultUI: true,
          styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#1c1c1e" }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1c1c1e" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
            {
              "featureType": "administrative",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [{ "color": "#18181a" }]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#6b6b6b" }]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [{ "color": "#2c2c2e" }]
            },
            {
              "featureType": "road",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#3a3a3c" }]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [{ "color": "#3a3a3c" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#1c1c1e" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "transit",
              "elementType": "geometry",
              "stylers": [{ "color": "#2c2c2e" }]
            },
            {
              "featureType": "transit.station",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{ "color": "#0e0e0e" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#515c6d" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#0e0e0e" }]
            }
          ]
        }}
      >
        {markers.map(marker => (
          <Marker 
            key={marker.id} 
            position={marker.pos} 
            title={marker.title}
            onClick={() => onMarkerClick(marker)}
          />
        ))}
      </GoogleMap>
    </div>
  ) : (
    <div className="map-container d-flex justify-content-center align-items-center bg-dark text-white">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading Map...</span>
      </div>
    </div>
  )
}

export default React.memo(MapViewer)
