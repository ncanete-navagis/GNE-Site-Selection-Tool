import React from 'react';

export const MapToolsPanel = ({ isPlacingMarker, isDrawing, onDropPinClick, onDrawClick, onFilterClick, onFinishDrawing }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', pointerEvents: 'auto' }}>
      {/* Finish Button (Conditional) */}
      {isDrawing && (
        <button
          onClick={onFinishDrawing}
          style={{
            backgroundColor: '#4285F4',
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          Finish Drawing
        </button>
      )}

      {/* Button Row */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        backgroundColor: '#EAEAEA', 
        padding: '8px', 
        borderRadius: '12px' 
      }}>
        {/* Drop a pin */}
        <button 
          title="Drop a Pin"
          onClick={onDropPinClick}
          style={{ 
            width: '54px', height: '48px', 
            borderRadius: '8px', 
            backgroundColor: isPlacingMarker ? '#28a745' : '#1E1E1E', 
            border: 'none', cursor: 'pointer', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </button>

        {/* Draw */}
        <button 
          title="Draw"
          onClick={onDrawClick}
          style={{ 
            width: '54px', height: '48px', 
            borderRadius: '8px', 
            backgroundColor: isDrawing ? '#4285F4' : '#1E1E1E', 
            border: 'none', cursor: 'pointer', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>

        {/* Filter (Plus) */}
        <button 
          title="Filter"
          onClick={onFilterClick}
          style={{ 
            width: '54px', height: '48px', 
            borderRadius: '8px', 
            backgroundColor: '#1E1E1E', 
            border: 'none', cursor: 'pointer', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
