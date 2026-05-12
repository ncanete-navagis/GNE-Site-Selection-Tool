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
    backgroundColor: 'var(--bg-card)',
    backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.02), transparent)',
    padding: '16px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: 'var(--shadow-soft)',
    transition: 'transform var(--transition-fast)'
  }}>
    <div style={{ 
      fontSize: '10px', 
      color: 'var(--text-muted)', 
      fontWeight: '700', 
      textTransform: 'uppercase', 
      letterSpacing: '0.05em' 
    }}>
      {label}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
      <div style={{
        fontSize: '20px',
        fontWeight: '800',
        color: isMeeting === null ? 'var(--text-primary)' : (isMeeting ? '#10b981' : '#ef4444'),
        letterSpacing: '-0.02em'
      }}>
        {typeof actual === 'number' ? actual.toLocaleString() : actual}
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', opacity: 0.7 }}>{unit}</span>
    </div>
    <div style={{ 
      fontSize: '10px', 
      color: 'var(--text-muted)', 
      marginTop: '2px',
      paddingTop: '6px',
      borderTop: '1px solid rgba(255, 255, 255, 0.03)'
    }}>
      Target: <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{typeof required === 'number' ? required.toLocaleString() : required}</span>
    </div>
  </div>
);

export default ComparisonSquare;
