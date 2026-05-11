import React from 'react';
import LoadingSpinner from '../../atoms/LoadingSpinner';

export const FeaturesPanelLoading = () => (
  <div style={{ padding: '40px 0', textAlign: 'center' }}>
    <LoadingSpinner />
    <div style={{ color: '#FFF', fontSize: '14px', fontWeight: '500' }}>Analyzing location...</div>
    <div style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>Fetching foot traffic and hazard data</div>
  </div>
);

export default FeaturesPanelLoading;
