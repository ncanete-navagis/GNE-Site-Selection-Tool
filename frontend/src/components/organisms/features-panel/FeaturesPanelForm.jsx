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
    <div style={{ padding: '0 20px 24px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
        label="Population"
        value={population}
        unit="people"
        onChange={setPopulation}
      />
      <InputField
        label="Traffic Speed"
        value={trafficKmh}
        unit="km/h"
        onChange={setTrafficKmh}
      />
      <InputField
        label="Lot Area"
        value={lotArea}
        unit="Square Meters"
        onChange={setLotArea}
      />

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '500' }}>
          Business Sector
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
          marginTop: '12px',
          width: '100%',
          backgroundColor: poi ? '#ff2a85' : '#444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: poi ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: poi ? '0 4px 12px rgba(255, 42, 133, 0.3)' : 'none'
        }}
        onMouseEnter={(e) => poi && (e.target.style.backgroundColor = '#e61e75')}
        onMouseLeave={(e) => poi && (e.target.style.backgroundColor = '#ff2a85')}
      >
        {poi ? 'Run Analysis' : 'Drop a pin to analyze'}
      </button>
    </div>
  );
};

export default FeaturesPanelForm;
