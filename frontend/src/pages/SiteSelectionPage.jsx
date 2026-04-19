import React, { useState } from 'react'
import MapViewer from '../components/organisms/MapViewer'
import HeaderControlBar from '../components/organisms/HeaderControlBar'
import NavigationHub from '../components/organisms/NavigationHub'
import Sidebar from '../components/organisms/Sidebar'
import { useMappingAPI } from '../hooks/useMappingAPI'

const SiteSelectionPage = () => {
  const [activeTab, setActiveTab] = useState('Filter')
  
  // Use our specialized mapping hook
  const { 
    mapState, 
    selectedPOI, 
    isSidebarOpen, 
    onMapLoad, 
    onMapUnmount, 
    onMapIdle, 
    onMarkerClick, 
    onMapClick,
    setIsSidebarOpen
  } = useMappingAPI({ lat: 10.3157, lng: 123.8854 })

  return (
    <div className="vh-100 vw-100 position-relative bg-black">
      {/* Base Layer: Map */}
      <MapViewer 
        onLoad={onMapLoad} 
        onUnmount={onMapUnmount} 
        onIdle={onMapIdle}
        onMarkerClick={onMarkerClick}
        onMapClick={onMapClick}
      />

      {/* Overlay Layer: Controls */}
      <div className="overlay-container d-flex flex-column align-items-center">
        <div className="glass-panel p-3 w-75 mt-3 d-flex flex-column gap-2 shadow-lg scale-in">
          <HeaderControlBar />
          <hr className="my-1 border-light opacity-25" />
          <NavigationHub activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Global Map State Debug (Optional) */}
        <div className="position-absolute bottom-0 start-0 m-3 glass-panel p-2 small opacity-50" style={{ fontSize: '10px' }}>
          Lat: {mapState.center.lat.toFixed(4)} | Lng: {mapState.center.lng.toFixed(4)} | Zoom: {mapState.zoom}
        </div>

        {/* Sidebar Component */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          selectedPOI={selectedPOI}
        />
        
        {/* Floating Toggle for Sidebar */}
        {!isSidebarOpen && selectedPOI && (
          <button 
            className="btn btn-primary position-absolute bottom-0 end-0 m-4 rounded-circle shadow-lg p-0 d-flex align-items-center justify-content-center"
            onClick={() => setIsSidebarOpen(true)}
            style={{ width: '56px', height: '56px' }}
          >
            ℹ️
          </button>
        )}
      </div>
    </div>
  )
}

export default SiteSelectionPage
