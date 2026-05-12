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
    backgroundColor: 'var(--bg-card)',
    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02), transparent)',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-soft)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{(score * 100).toFixed(0)}%</span>
    </div>
    <div style={{
      width: '100%',
      height: '6px',
      backgroundColor: 'var(--bg-elevated)',
      borderRadius: 'var(--border-radius-pill)',
      overflow: 'hidden',
      border: '1px solid var(--border-primary)'
    }}>
      <div
        style={{
          width: `${score * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 'var(--border-radius-pill)',
          transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: `0 0 10px ${color}40`
        }}
      />
    </div>
  </div>
));

export default ScoreBar;
