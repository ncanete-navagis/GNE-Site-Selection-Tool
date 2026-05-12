import React from 'react';

export const PropertySidePanel = ({ isOpen, onClose, property, onChooseLocation }) => {
  if (!property) return null;

  const panelStyle = {
    position: 'fixed',
    top: '12px',
    right: '12px',
    bottom: '12px',
    width: '420px',
    backgroundColor: 'var(--bg-secondary)',
    backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), transparent)',
    backdropFilter: 'blur(var(--blur-intensity))',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: 'var(--shadow-elevated)',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 1100, // Higher than left panel
    pointerEvents: 'auto',
    color: 'var(--text-primary)',
  };

  const headerStyle = {
    padding: '24px 20px',
    borderBottom: '1px solid var(--border-primary)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle = {
    color: 'var(--text-primary)',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.025em',
  };

  const closeBtnStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '20px',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--border-radius-pill)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  };

  const contentStyle = {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const imageStyle = {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-soft)',
  };

  const infoGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '16px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-primary)',
  };

  const labelStyle = {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700',
  };

  const valueStyle = {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '500',
  };

  const priceStyle = {
    fontSize: '28px',
    color: 'var(--accent-primary)',
    fontWeight: '800',
    letterSpacing: '-0.025em',
  };

  const footerStyle = {
    padding: '24px',
    borderTop: '1px solid var(--border-primary)',
    backgroundColor: 'var(--bg-elevated)',
    borderBottomLeftRadius: 'var(--border-radius-lg)',
    borderBottomRightRadius: 'var(--border-radius-lg)',
  };

  const chooseBtnStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: 'var(--border-radius-md)',
    border: 'none',
    backgroundColor: 'var(--button-primary)',
    color: '#FFF',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all var(--transition-normal)',
    boxShadow: '0 4px 12px var(--accent-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle} title={property.title}>
          {property.title}
        </h3>
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

      <div style={contentStyle}>
        {property.coverphotourl && (
          <img 
            src={property.coverphotourl} 
            alt={property.title} 
            style={imageStyle}
            onError={(e) => e.target.src = 'https://via.placeholder.com/400x220?text=No+Image+Available'}
          />
        )}

        <div style={infoGroupStyle}>
          <span style={labelStyle}>Price</span>
          <span style={priceStyle}>{formatPrice(property.price)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={infoGroupStyle}>
            <span style={labelStyle}>Purpose</span>
            <span style={valueStyle}>{property.purpose}</span>
          </div>
          <div style={infoGroupStyle}>
            <span style={labelStyle}>Category</span>
            <span style={valueStyle}>{property.category}</span>
          </div>
          <div style={infoGroupStyle}>
            <span style={labelStyle}>Area</span>
            <span style={valueStyle}>{property.area ? `${property.area} Square Meters` : 'N/A'}</span>
          </div>
          <div style={infoGroupStyle}>
            <span style={labelStyle}>Location</span>
            <span style={valueStyle}>{property.location}</span>
          </div>
        </div>

        {property.url && (
          <div style={infoGroupStyle}>
            <span style={labelStyle}>Listing URL</span>
            <a 
              href={property.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ ...valueStyle, color: 'var(--accent-primary)', fontSize: '13px', wordBreak: 'break-all', textDecoration: 'none' }}
            >
              {property.url}
            </a>
          </div>
        )}
      </div>

      <div style={footerStyle}>
        <button 
          style={chooseBtnStyle}
          onClick={() => onChooseLocation && onChooseLocation(property)}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.backgroundColor = 'var(--button-primary-hover)';
            e.target.style.boxShadow = '0 6px 20px var(--accent-soft)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.backgroundColor = 'var(--button-primary)';
            e.target.style.boxShadow = '0 4px 12px var(--accent-soft)';
          }}
        >
          Choose Location
        </button>
      </div>
    </div>
  );
};
