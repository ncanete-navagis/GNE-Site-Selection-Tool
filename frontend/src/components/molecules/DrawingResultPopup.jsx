import React from 'react';

export const DrawingResultPopup = ({ result, onClear, onClose }) => {
  if (!result) return null;

  const containerStyle = {
    position: 'fixed',
    bottom: '40px',
    right: '400px', // Offset from side panel
    width: '320px',
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    padding: '24px',
    color: '#FFF',
    zIndex: 2000,
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#4285F4',
    margin: 0,
  };

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '4px',
  };

  const statContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  };

  const statBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  };

  const statLabelStyle = {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#888',
    marginBottom: '4px',
    display: 'block',
  };

  const statValueStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFF',
  };

  const pointsListStyle = {
    maxHeight: '120px',
    overflowY: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#AAA',
  };

  const clearBtnStyle = {
    width: '100%',
    padding: '12px',
    marginTop: '20px',
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    color: '#FF4444',
    border: '1px solid rgba(255, 68, 68, 0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Measurement Result</h3>
        <button style={closeBtnStyle} onClick={onClose}>&times;</button>
      </div>

      <div style={statContainerStyle}>
        <div style={statBoxStyle} className="stat-box">
          <span style={statLabelStyle}>Total Area</span>
          <span style={statValueStyle}>{result.area.toLocaleString()} Square Meters</span>
        </div>
        <div style={statBoxStyle} className="stat-box">
          <span style={statLabelStyle}>Perimeter</span>
          <span style={statValueStyle}>{result.perimeter.toLocaleString()} Meters</span>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <span style={statLabelStyle}>Vertices ({result.points.length})</span>
      </div>
      <div style={pointsListStyle}>
        {result.points.map((p, i) => (
          <div key={i} style={{ marginBottom: '4px', borderBottom: i === result.points.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            <span style={{ color: '#4285F4', marginRight: '8px' }}>#{i+1}</span>
            {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
          </div>
        ))}
      </div>

      <button 
        style={clearBtnStyle} 
        onClick={onClear}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 68, 68, 0.25)';
          e.target.style.borderColor = 'rgba(255, 68, 68, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 68, 68, 0.15)';
          e.target.style.borderColor = 'rgba(255, 68, 68, 0.2)';
        }}
      >
        Clear Measurement
      </button>

      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .stat-box:hover {
            border-color: rgba(66, 133, 244, 0.3) !important;
            background-color: rgba(255, 255, 255, 0.08) !important;
          }
        `}
      </style>
    </div>
  );
};
