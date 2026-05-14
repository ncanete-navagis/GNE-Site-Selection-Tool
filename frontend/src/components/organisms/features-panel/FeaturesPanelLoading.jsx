import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Identifying site coordinates...",
  "Fetching historical foot traffic data...",
  "Analyzing market competition...",
  "Evaluating environmental hazards...",
  "Calculating accessibility scores...",
  "Finalizing site selection report..."
];

export const FeaturesPanelLoading = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 300); // Wait for fade out before changing text
    }, 2500);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div style={{ 
      padding: '48px 24px', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}>
      {/* Pulse Animation instead of circular spinner */}
      <div className="pulse-container" style={{
        width: '100%',
        maxWidth: '240px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '24px'
      }}>
        <div className="pulse-bar" style={{
          position: 'absolute',
          height: '100%',
          width: '30%',
          background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
          animation: 'pulse-slide 1.5s infinite ease-in-out'
        }} />
      </div>

      <div style={{ 
        color: 'var(--text-primary)', 
        fontSize: '16px', 
        fontWeight: '600',
        transition: 'opacity 0.3s ease-in-out',
        opacity: fade ? 1 : 0,
        marginBottom: '8px',
        height: '24px' // Maintain height during transition
      }}>
        {MESSAGES[messageIndex]}
      </div>
      
      <div style={{ 
        color: 'var(--text-muted)', 
        fontSize: '13px', 
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontWeight: '500'
      }}>
        Analysis in progress
      </div>

      <style>{`
        @keyframes pulse-slide {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default FeaturesPanelLoading;
