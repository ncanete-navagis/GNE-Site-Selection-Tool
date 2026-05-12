import React from 'react';

export const FeaturesPanelHeader = ({ poi }) => {
  return (
    <div style={{ padding: '24px 20px 8px 20px' }}>
      <h3 style={{ 
        color: 'var(--text-primary)', 
        marginBottom: poi?.analysis?.street ? '6px' : '20px', 
        fontSize: '22px', 
        fontWeight: '800',
        letterSpacing: '-0.02em'
      }}>
        {poi?.title || 'Site Analysis'}
      </h3>
      {poi?.analysis?.street && (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ opacity: 0.7 }}>📍</span>
          {poi.analysis.house_number ? `${poi.analysis.house_number} ` : ''}{poi.analysis.street}
        </div>
      )}
    </div>
  );
};

export default FeaturesPanelHeader;
