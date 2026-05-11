import React from 'react';

export const PropertySidePanel = ({ isOpen, onClose, property, onChooseLocation }) => {
  if (!property) return null;

  const panelStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '400px',
    backgroundColor: '#1E1E1E',
    boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 1100, // Higher than left panel
    pointerEvents: 'auto',
    color: '#FFF',
  };

  const headerStyle = {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle = {
    color: '#FFF',
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '28px',
    lineHeight: 1,
    padding: '0 8px',
    transition: 'color 0.2s',
  };

  const contentStyle = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const imageStyle = {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    borderRadius: '12px',
    backgroundColor: '#333',
  };

  const infoGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
  };

  const valueStyle = {
    fontSize: '15px',
    color: '#FFF',
    fontWeight: '500',
  };

  const priceStyle = {
    fontSize: '24px',
    color: '#28a745',
    fontWeight: '700',
  };

  const footerStyle = {
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  };

  const chooseBtnStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#28a745',
    color: '#FFF',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
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
          onMouseEnter={(e) => e.target.style.color = '#FFF'}
          onMouseLeave={(e) => e.target.style.color = '#888'}
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
              style={{ ...valueStyle, color: '#3399FF', fontSize: '13px', wordBreak: 'break-all', textDecoration: 'none' }}
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
            e.target.style.backgroundColor = '#218838';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.backgroundColor = '#28a745';
          }}
        >
          Choose Location
        </button>
      </div>
    </div>
  );
};
