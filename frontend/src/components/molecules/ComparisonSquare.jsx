import React from 'react';

/**
 * ComparisonSquare Molecule
 * @param {Object} props
 * @param {string} props.label - Metric label
 * @param {number|string} props.required - Target/Required value
 * @param {number|string} props.actual - Actual value
 * @param {string} props.unit - Unit label
 * @param {boolean|null} props.isMeeting - Whether criteria is met
 */
export const ComparisonSquare = ({ label, required, actual, unit, isMeeting }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <div style={{ 
      fontSize: '10px', 
      color: '#888', 
      fontWeight: '600', 
      textTransform: 'uppercase', 
      letterSpacing: '0.05em' 
    }}>
      {label}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
      <div style={{
        fontSize: '16px',
        fontWeight: '800',
        color: isMeeting === null ? '#FFF' : (isMeeting ? '#00dc82' : '#ff4d4d')
      }}>
        {typeof actual === 'number' ? actual.toLocaleString() : actual}
      </div>
      <span style={{ fontSize: '10px', color: '#666' }}>{unit}</span>
    </div>
    <div style={{ fontSize: '9px', color: '#555', marginTop: '2px' }}>
      Target: {typeof required === 'number' ? required.toLocaleString() : required}
    </div>
  </div>
);

export default ComparisonSquare;
