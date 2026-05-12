import React from 'react';

export const DrawingResultPopup = ({ result, onClear, onClose }) => {
  if (!result) return null;

  const containerStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '412px', // Offset from side panel
    width: '340px',
    backgroundColor: 'var(--bg-secondary)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), transparent)',
    backdropFilter: 'blur(var(--blur-intensity))',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-elevated)',
    padding: '24px',
    color: 'var(--text-primary)',
    zIndex: 2000,
    animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--accent-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  };

  const closeBtnStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '18px',
    width: '28px',
    height: '28px',
    borderRadius: 'var(--border-radius-pill)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  };

  const statContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  };

  const statBoxStyle = {
    backgroundColor: 'var(--bg-card)',
    padding: '16px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-primary)',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-soft)',
  };

  const statLabelStyle = {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    fontWeight: '700',
    display: 'block',
  };

  const statValueStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  };

  const pointsListStyle = {
    maxHeight: '140px',
    overflowY: 'auto',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: 'var(--border-radius-md)',
    padding: '12px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-primary)',
  };

  const clearBtnStyle = {
    width: '100%',
    padding: '14px',
    marginTop: '24px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all var(--transition-normal)',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Measurement</h3>
        <button 
          style={closeBtnStyle} 
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.color = 'var(--text-primary)';
            e.target.style.backgroundColor = 'var(--bg-card)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'var(--text-secondary)';
            e.target.style.backgroundColor = 'var(--bg-elevated)';
          }}
        >
          &times;
        </button>
      </div>

      <div style={statContainerStyle}>
        <div style={statBoxStyle} className="stat-box">
          <span style={statLabelStyle}>Total Area</span>
          <span style={statValueStyle}>{result.area.toLocaleString()} m²</span>
        </div>
        <div style={statBoxStyle} className="stat-box">
          <span style={statLabelStyle}>Perimeter</span>
          <span style={statValueStyle}>{result.perimeter.toLocaleString()} m</span>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={statLabelStyle}>Path Nodes ({result.points.length})</span>
      </div>
      <div style={pointsListStyle}>
        {result.points.map((p, i) => (
          <div key={i} style={{ marginBottom: '6px', borderBottom: i === result.points.length - 1 ? 'none' : '1px solid var(--border-primary)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--accent-primary)', marginRight: '12px', fontWeight: '700' }}>{i+1}</span>
            <span style={{ opacity: 0.8 }}>{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</span>
          </div>
        ))}
      </div>

      <button 
        style={clearBtnStyle} 
        onClick={onClear}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        🗑 Clear Measurement
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
