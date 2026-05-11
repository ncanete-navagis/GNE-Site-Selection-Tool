import React, { useState, useEffect } from 'react';

/* ---------- STATIC OPTIONS ---------- */

const layerOptions = [
  { label: 'Traffic Layer' },
  { label: 'Flood Hazard' },
  { label: 'Earthquake Risk' }
];

const regionOptions = [
  { label: 'Cebu' },
  { label: 'Manila' }
];

const sectorOptions = [
  { label: 'Banks' },
  { label: 'Schools' },
  { label: 'Malls' },
  { label: 'Hospitals' },
  { label: 'Restaurants' }
];

/* ---------- REUSABLE UI PARTS ---------- */

const InputField = ({ label, unit, value, onChange, onApply }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '500' }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply && onApply()}
          style={{
            width: '100%',
            backgroundColor: '#2A2A2A',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 40px 12px 16px',
            color: '#FFF',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#666',
          fontSize: '12px',
          pointerEvents: 'none'
        }}>
          {unit}
        </span>
      </div>
      {onApply && (
        <button
          onClick={onApply}
          style={{
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 6px rgba(66, 133, 244, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#357ae8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4285F4'}
        >
          Apply
        </button>
      )}
    </div>
  </div>
);

const CollapsibleSection = ({ title, items = [], type = 'list', value, onChange, isLoading, emptyText = "No items" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleItem = (label) => {
    if (type === 'chip') {
      onChange(label.toLowerCase());
      return;
    }

    const currentValues = value || [];
    onChange(
      currentValues.includes(label)
        ? currentValues.filter(item => item !== label)
        : [...currentValues, label]
    );
  };

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#DDD' }}>
          {title}
        </span>
        <span style={{ color: '#666' }}>▼</span>
      </div>

      {isOpen && (
        <div style={{ padding: '12px 20px 20px 20px' }}>
          {isLoading ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>{emptyText}</div>
          ) : (
            <>
              {type === 'checkbox' && items.map((item, i) => (
                <label key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', color: '#BBB' }}>
                  <input
                    type="checkbox"
                    checked={(value || []).includes(item.label)}
                    onChange={() => toggleItem(item.label)}
                  />
                  {item.label}
                </label>
              ))}

              {type === 'chip' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {items.map((item, i) => {
                    const isSelected = value === item.label.toLowerCase();
                    return (
                      <button
                        key={i}
                        onClick={() => toggleItem(item.label)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid #3291ff' : '1px solid #444',
                          backgroundColor: isSelected ? 'rgba(50,145,255,0.2)' : 'transparent',
                          color: isSelected ? '#3291ff' : '#BBB',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ToggleSwitch = ({ label, isOn, onToggle }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  }}>
    <span style={{ color: '#DDD' }}>{label}</span>
    <div
      onClick={onToggle}
      style={{
        width: '40px',
        height: '20px',
        borderRadius: '20px',
        backgroundColor: isOn ? '#3291ff' : '#444',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: isOn ? '22px' : '2px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#FFF',
        transition: 'left 0.2s'
      }} />
    </div>
  </div>
);

const ComparisonSquare = ({ label, required, actual, unit, isMeeting }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <div style={{ fontSize: '10px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
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

/* ---------- MAIN COMPONENT ---------- */

export const FeaturesPanel = ({
  poi,
  radius, setRadius,
  population, setPopulation,
  trafficKmh, setTrafficKmh,
  lotArea, setLotArea,
  isAnalyzing,
  selectedSectors,
  setSelectedSectors,
  onRunAnalysis
}) => {
  const [localRadius, setLocalRadius] = useState(radius);

  // Sync local radius if external radius changes
  useEffect(() => {
    setLocalRadius(radius);
  }, [radius]);

  const [restaurantTypes, setRestaurantTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [region, setRegion] = useState('cebu');
  const [isChoroplethOn, setIsChoroplethOn] = useState(false);
  const [isHeatMapOn, setIsHeatMapOn] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  /* Fetch restaurant types whenever region changes */
  useEffect(() => {
    setIsLoadingTypes(true);
    fetch(`http://localhost:8000/api/v1/places/restaurant-types?region=${region}`)
      .then(res => res.json())
      .then(data => {
        const typesList = data.types || [];
        const formatted = typesList.map(type => ({
          label: type.replaceAll('_', ' ')
        }));
        setRestaurantTypes(formatted);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingTypes(false));
  }, [region]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <div style={{ padding: '24px 20px' }}>
        <h3 style={{ color: '#FFF', marginBottom: poi?.analysis?.street ? '4px' : '24px', fontSize: '18px', fontWeight: '700' }}>
          {poi?.title || 'Criteria Options'}
        </h3>
        {poi?.analysis?.street && (
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '24px', fontWeight: '400' }}>
            {poi.analysis.house_number ? `${poi.analysis.house_number} ` : ''}{poi.analysis.street}
          </div>
        )}

        {isAnalyzing ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="loading-spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#ff2a85',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ color: '#FFF', fontSize: '14px', fontWeight: '500' }}>Analyzing location...</div>
            <div style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>Fetching foot traffic and hazard data</div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : poi?.analysis ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Scoring Breakdown
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { label: 'Overall Score', score: poi.analysis.overall_score, color: '#ff2a85' },
                { label: 'Foot Traffic', score: poi.analysis.foot_traffic_score, color: '#3291ff' },
                { label: 'Competition', score: poi.analysis.competing_business_score, color: '#00dc82' },
                { label: 'Flood Safety', score: poi.analysis.flood_hazard_score, color: '#f39c12' },
                { label: 'Landslide Safety', score: poi.analysis.landslide_hazard_score, color: '#e74c3c' },
              ].map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: '#AAA' }}>{item.label}</span>
                    <span style={{ color: '#FFF', fontWeight: '600' }}>{(item.score * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.score * 100}%`, height: '100%', background: item.color, transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Squares */}
            <div style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              <ComparisonSquare
                label="Population"
                required={poi.analysis.population ?? "N/A"}
                actual={poi.analysis.actual_population ?? 0}
                unit="ppl"
                isMeeting={poi.analysis.population ? (poi.analysis.actual_population >= poi.analysis.population) : null}
              />
              <ComparisonSquare
                label="Traffic Speed"
                required={poi.analysis.traffic_kmh ?? "N/A"}
                actual={poi.analysis.actual_traffic_kmh ?? 0}
                unit="km/h"
                isMeeting={poi.analysis.traffic_kmh ? (poi.analysis.actual_traffic_kmh >= poi.analysis.traffic_kmh) : null}
              />
              <ComparisonSquare
                label="Comm. Space"
                required="Any"
                actual={poi.analysis.commercial_space || 'No'}
                unit=""
                isMeeting={poi.analysis.commercial_space === 'Yes'}
              />
              <ComparisonSquare
                label="Lot Area"
                required={poi.analysis.lot_area ?? "N/A"}
                actual={poi.analysis.lot_area ?? 0} // Placeholder
                unit="Square Meters"
                isMeeting={true}
              />
            </div>

            {/* Sector Counts */}
            {poi.analysis.sector_counts && Object.keys(poi.analysis.sector_counts).length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nearby Establishments
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {Object.entries(poi.analysis.sector_counts).map(([sector, count]) => (
                    <div key={sector} style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ fontSize: '10px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sector}</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros & Cons */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {poi.analysis.pros?.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#00dc82', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✓</span> Pros
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {poi.analysis.pros.map((pro, i) => (
                      <span key={i} style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(0, 220, 130, 0.1)', color: '#00dc82', borderRadius: '6px', border: '1px solid rgba(0, 220, 130, 0.2)' }}>
                        {pro}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {poi.analysis.cons?.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#ff4d4d', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>!</span> Cons
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {poi.analysis.cons.map((con, i) => (
                      <span key={i} style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', borderRadius: '6px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                        {con}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                {sectorOptions.map((sector) => {
                  const isSelected = selectedSectors.includes(sector.label);
                  return (
                    <button
                      key={sector.label}
                      onClick={() => {
                        setSelectedSectors(prev =>
                          prev.includes(sector.label)
                            ? prev.filter(s => s !== sector.label)
                            : [...prev, sector.label]
                        );
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: isSelected ? '1px solid #ff2a85' : '1px solid #444',
                        backgroundColor: isSelected ? 'rgba(255, 42, 133, 0.1)' : 'transparent',
                        color: isSelected ? '#ff2a85' : '#BBB',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {sector.label}
                    </button>
                  );
                })}
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
        )}
      </div>

      <div style={{ flex: 1 }}>
        <CollapsibleSection
          title="Filter"
          items={restaurantTypes}
          type="checkbox"
          value={selectedTypes}
          onChange={setSelectedTypes}
          isLoading={isLoadingTypes}
          emptyText="No filters found"
        />

        <CollapsibleSection
          title="Layers"
          items={layerOptions}
          type="checkbox"
          value={selectedLayers}
          onChange={setSelectedLayers}
        />

        <CollapsibleSection
          title="Region"
          items={regionOptions}
          type="chip"
          value={region}
          onChange={setRegion}
        />
      </div>

      <div style={{ marginTop: 'auto' }}>
        <ToggleSwitch
          label="Choropleth Map"
          isOn={isChoroplethOn}
          onToggle={() => setIsChoroplethOn(prev => !prev)}
        />

        <ToggleSwitch
          label="Heat Map"
          isOn={isHeatMapOn}
          onToggle={() => setIsHeatMapOn(prev => !prev)}
        />
      </div>
    </div>
  );
};