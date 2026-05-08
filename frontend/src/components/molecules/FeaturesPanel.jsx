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

/* ---------- REUSABLE UI PARTS ---------- */

const InputField = ({ label, unit, value }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '500' }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        defaultValue={value}
        style={{
          width: '100%',
          backgroundColor: '#2A2A2A',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 40px 12px 16px',
          color: '#FFF',
          fontSize: '14px',
          outline: 'none'
        }}
      />
      <span style={{
        position: 'absolute',
        right: '16px',
        color: '#666',
        fontSize: '12px'
      }}>
        {unit}
      </span>
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
    setSelectedItems(prev => {
      const next = prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label];

      if (title === 'Layers' && typeof window.onLayerToggleGlobal === 'function') {
        window.onLayerToggleGlobal(next);
      }
      return next;
    });
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
        cursor: 'pointer'
      }}
    />
  </div>
);

/* ---------- MAIN COMPONENT ---------- */

export const FeaturesPanel = ({ poi }) => {
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
        <h3 style={{ color: '#FFF', marginBottom: '24px', fontSize: '18px', fontWeight: '700' }}>
          {poi?.title || 'Criteria Options'}
        </h3>

        {poi && !poi.analysis ? (
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
          <>
            <InputField label="Radius" value="500" unit="m" />
            <InputField label="Traffic" value="2,400" unit="vph" />
            <InputField label="Lot area" value="1,200" unit="sq. m" />
          </>
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