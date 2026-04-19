import React from 'react'

const Sidebar = ({ isOpen, onClose, selectedPOI }) => {
  if (!selectedPOI) return null;

  return (
    <div 
      className={`glass-panel position-absolute top-0 start-0 h-100 shadow-lg transition-transform ${
        isOpen ? 'translate-middle-x-0' : 'translate-middle-x-n100'
      }`}
      style={{ 
        width: '320px', 
        zIndex: 100,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      <div className="d-flex flex-column h-100 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold">Site Details</h4>
          <button className="btn btn-close btn-close-white" onClick={onClose}></button>
        </div>

        <div className="flex-grow-1 overflow-auto">
          <div className="mb-4">
            <div className="rounded bg-primary bg-opacity-10 p-3 border border-primary border-opacity-25 mb-3">
              <h6 className="text-primary mb-1">{selectedPOI.title}</h6>
              <p className="small mb-0 opacity-75">
                Lat: {selectedPOI.pos.lat.toFixed(4)}, Lng: {selectedPOI.pos.lng.toFixed(4)}
              </p>
            </div>
            
            <p className="small opacity-75">
              This {selectedPOI.type} site has been identified as a high-potential location for development based on local demographics and traffic patterns.
            </p>
          </div>

          <hr className="opacity-20" />

          <div className="list-group list-group-flush bg-transparent">
            <div className="list-group-item bg-transparent text-white border-white border-opacity-10 px-0">
              <label className="d-block small opacity-50">Property Type</label>
              <span className="text-capitalize">{selectedPOI.type}</span>
            </div>
            <div className="list-group-item bg-transparent text-white border-white border-opacity-10 px-0">
              <label className="d-block small opacity-50">Discovery Status</label>
              <span className="text-success fw-bold">Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-top border-white border-opacity-10">
          <button className="btn btn-primary w-100 py-2">Select as Site</button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
