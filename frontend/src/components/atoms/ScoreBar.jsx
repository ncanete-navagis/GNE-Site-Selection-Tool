import React from 'react';

/**
 * ScoreBar Atom
 * @param {Object} props
 * @param {string} props.label - Metric name
 * @param {number} props.score - Score value (0 to 1)
 * @param {string} props.color - Bar color
 */
export const ScoreBar = React.memo(({ label, score, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
      <span style={{ color: '#AAA' }}>{label}</span>
      <span style={{ color: '#FFF', fontWeight: '600' }}>{(score * 100).toFixed(0)}%</span>
    </div>
    <div style={{
      width: '100%',
      height: '4px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div
        style={{
          width: `${score * 100}%`,
          height: '100%',
          background: color,
          transition: 'width 1s ease-out'
        }}
      />
    </div>
  </div>
));

export default ScoreBar;
