import React from 'react';
import InputField from '../../atoms/InputField';
import Tag from '../../atoms/Tag';
import { sectorOptions } from './constants/featureOptions';

export const FeaturesPanelForm = ({
  poi,
  localRadius,
  setLocalRadius,
  setRadius,
  population,
  setPopulation,
  trafficKmh,
  setTrafficKmh,
  lotArea,
  setLotArea,
  selectedSectors,
  setSelectedSectors,
  onRunAnalysis,
  radius
}) => {
  return (
    <div style={{ padding: '0 20px 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <InputField
        label="Analysis Radius"
        value={localRadius}
        unit="m"
        onChange={(val) => {
          setLocalRadius(val);
          setRadius(parseInt(val) || radius);
        }}
      />
      <InputField
        label="Population Requirement"
        value={population}
        unit="ppl"
        onChange={setPopulation}
      />
      <InputField
        label="Traffic Speed Goal"
        value={trafficKmh}
        unit="km/h"
        onChange={setTrafficKmh}
      />
      <InputField
        label="Minimum Lot Area"
        value={lotArea}
        unit="m²"
        onChange={setLotArea}
      />

      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '11px', 
          color: 'var(--text-muted)', 
          marginBottom: '12px', 
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Business Sectors
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sectorOptions.map((sector) => (
            <Tag
              key={sector.label}
              label={sector.label}
              isSelected={selectedSectors.includes(sector.label)}
              onClick={() => {
                setSelectedSectors(prev =>
                  prev.includes(sector.label)
                    ? prev.filter(s => s !== sector.label)
                    : [...prev, sector.label]
                );
              }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onRunAnalysis}
        disabled={!poi}
        style={{
          marginTop: '8px',
          width: '100%',
          backgroundColor: poi ? 'var(--accent-primary)' : 'var(--bg-secondary)',
          color: poi ? 'white' : 'var(--text-muted)',
          border: poi ? 'none' : '1px solid var(--border-primary)',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: poi ? 'pointer' : 'not-allowed',
          transition: 'all var(--transition-fast)',
          boxShadow: 'var(--shadow-soft)',
          letterSpacing: '0.02em'
        }}
        onMouseEnter={(e) => {
          if (poi) {
            e.target.style.backgroundColor = 'var(--accent-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (poi) {
            e.target.style.backgroundColor = 'var(--accent-primary)';
          }
        }}
      >
        {poi ? '🚀 Run Site Analysis' : '📍 Drop a pin to analyze'}
      </button>
    </div>
  );
};

export default FeaturesPanelForm;
