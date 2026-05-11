import React from 'react';

export const FeaturesPanelHeader = ({ poi }) => {
  return (
    <div style={{ padding: '24px 20px 0 20px' }}>
      <h3 style={{ 
        color: '#FFF', 
        marginBottom: poi?.analysis?.street ? '4px' : '24px', 
        fontSize: '18px', 
        fontWeight: '700' 
      }}>
        {poi?.title || 'Criteria Options'}
      </h3>
      {poi?.analysis?.street && (
        <div style={{ color: '#888', fontSize: '13px', marginBottom: '24px', fontWeight: '400' }}>
          {poi.analysis.house_number ? `${poi.analysis.house_number} ` : ''}{poi.analysis.street}
        </div>
      )}
    </div>
  );
};

export default FeaturesPanelHeader;
