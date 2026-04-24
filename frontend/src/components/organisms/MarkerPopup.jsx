import React from 'react';
import Surface from '../atoms/Surface';
import Typography from '../atoms/Typography';
import LocationHeaderCard from './LocationHeaderCard';
import AIAssistantPanel from './AIAssistantPanel';
import Icon from '../atoms/Icon';

const MarkerPopup = ({ poi, onClose, style = {} }) => {
  if (!poi) return null;

  return (
    <Surface 
      className="marker-popup-container" 
      style={{ 
        width: '340px', 
        position: 'absolute', 
        zIndex: 1000,
        ...style 
      }}
    >
      <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 10 }}>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}
        >
          <Icon name="close" size={12} />
        </button>
      </div>

      <LocationHeaderCard 
        title={poi.title} 
        rating={poi.rating || 4.5} 
        count={poi.reviews || 24745} 
        category={poi.type === 'mall' ? 'Shopping mall' : 'Location'} 
      />

      <div className="p-3 d-flex justify-content-between">
        <div>
          <Typography variant="body" weight="600" color="white">Pros:</Typography>
          {/* Placeholder for pros */}
        </div>
        <div>
          <Typography variant="body" weight="600" color="white">Cons:</Typography>
          {/* Placeholder for cons */}
        </div>
      </div>

      <AIAssistantPanel poi={poi} />
    </Surface>

  );
};

export default MarkerPopup;
