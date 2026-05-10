import React, { useState } from 'react';

export const MapToolsPanel = ({ isPlacingMarker, onDropPinClick, onDrawClick }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [kmValue, setKmValue] = useState('01');
  const [schoolsChecked, setSchoolsChecked] = useState(false);

  const handleKmChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // only digits
    if (val.length <= 2) {
      setKmValue(val);
    }
  };

  const pillStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#EAEAEA',
    color: '#000',
    borderRadius: '10px',
    padding: '6px 8px 6px 16px',
    fontSize: '15px',
    fontWeight: '600'
  };

  const darkBoxStyle = {
    backgroundColor: '#1E1E1E',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', pointerEvents: 'auto' }}>
      {/* Expanded Filter Panel */}
      {isFilterOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', marginBottom: '6px' }}>
          
          {/* Close Dash Pill */}
          <div 
             onClick={() => setIsFilterOpen(false)}
             style={{ 
               backgroundColor: '#EAEAEA', 
               borderRadius: '10px', 
               padding: '6px 24px', 
               cursor: 'pointer', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               marginBottom: '6px'
             }}
          >
             <svg width="20" height="10" viewBox="0 0 16 8" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <polyline points="2,2 8,6 14,2" />
             </svg>
          </div>

          {/* Schools / Colleges Pill */}
          <div style={pillStyle}>
            <span>Schools / Colleges</span>
            <div style={{ ...darkBoxStyle, width: '32px', height: '26px', position: 'relative' }}>
              <input 
                type="checkbox" 
                checked={schoolsChecked} 
                onChange={(e) => setSchoolsChecked(e.target.checked)} 
                style={{ width: '100%', height: '100%', opacity: 0, cursor: 'pointer', position: 'absolute', zIndex: 2, margin: 0 }} 
              />
              {schoolsChecked && (
                <div style={{
                  position: 'absolute',
                  width: '5px',
                  height: '12px',
                  border: 'solid #fff',
                  borderWidth: '0 2px 2px 0',
                  transform: 'rotate(45deg)',
                  top: '5px'
                }} />
              )}
            </div>
          </div>

          {/* Kilometers Pill */}
          <div style={pillStyle}>
            <span>Kilometers</span>
            <div style={{ ...darkBoxStyle, width: '32px', height: '26px' }}>
              <input 
                type="text" 
                value={kmValue} 
                onChange={handleKmChange} 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  textAlign: 'center', 
                  backgroundColor: 'transparent', 
                  color: '#fff', 
                  border: 'none', 
                  fontSize: '15px',
                  outline: 'none',
                  padding: 0
                }} 
              />
            </div>
          </div>

        </div>
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
            backgroundColor: '#1E1E1E', 
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
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          style={{ 
            width: '54px', height: '48px', 
            borderRadius: '8px', 
            backgroundColor: isFilterOpen ? '#444' : '#1E1E1E', 
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
