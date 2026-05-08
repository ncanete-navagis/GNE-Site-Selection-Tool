import React, { useState, useEffect, useCallback } from 'react';

const layerOptions = [
  { label: 'Traffic Layer' },
  { label: 'Flood Hazard' },
  { label: 'Earthquake Risk' }
];

const regionOptions = [
  { label: 'Cebu' },
  { label: 'Manila' }
];

const InputField = React.memo(({ label, unit, value }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '500' }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        defaultValue={value}
        style={{
          width: '100%', backgroundColor: '#2A2A2A', border: 'none',
          borderRadius: '8px', padding: '12px 40px 12px 16px', color: '#FFF',
          fontSize: '14px', outline: 'none'
        }}
      />
      <span style={{ position: 'absolute', right: '16px', color: '#666', fontSize: '12px' }}>
        {unit}
      </span>
    </div>
  </div>
));

const CollapsibleSection = React.memo(({ title, items = [], type = 'list', value = [], onChange = () => {}, isLoading, emptyText = "No items" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleItem = useCallback((label) => {
    if (type === 'chip') {
      onChange(label.toLowerCase());
      return;
    }

    const currentValues = value || [];
    const nextValues = currentValues.includes(label)
      ? currentValues.filter(item => item !== label)
      : [...currentValues, label];
      
    onChange(nextValues);
  }, [type, value, onChange]);

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#DDD' }}>{title}</span>
        <span style={{ color: '#666' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div style={{ padding: '12px 20px 20px 20px' }}>
          {isLoading ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>{emptyText}</div>
          ) : (
            <>
              {type === 'checkbox' && items.map((item, i) => {
                const isSelected = (value || []).includes(item.label);
                return (
                  <label key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', color: isSelected ? '#FFF' : '#BBB', fontWeight: isSelected ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleItem(item.label)} style={{ cursor: 'pointer' }} />
                    {item.label}
                  </label>
                );
              })}

              {type === 'chip' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {items.map((item, i) => {
                    const isSelected = value === item.label.toLowerCase();
                    return (
                      <button key={i} onClick={() => toggleItem(item.label)} style={{
                          padding: '8px 12px', borderRadius: '16px', border: isSelected ? '1px solid #3291ff' : '1px solid #444',
                          backgroundColor: isSelected ? 'rgba(50,145,255,0.2)' : 'transparent', color: isSelected ? '#3291ff' : '#BBB',
                          fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
                        }}>
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
});

const ToggleSwitch = React.memo(({ label, isOn, onToggle = () => {} }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ color: '#DDD' }}>{label}</span>
    <div onClick={onToggle} style={{ width: '40px', height: '20px', borderRadius: '20px', backgroundColor: isOn ? '#3291ff' : '#444', cursor: 'pointer', transition: 'background-color 0.3s' }}>
      <div style={{ width: '16px', height: '16px', backgroundColor: '#FFF', borderRadius: '50%', margin: '2px', transform: isOn ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.3s' }} />
    </div>
  </div>
));

export const FeaturesPanel = React.memo(({ 
  poi = null, 
  region = 'cebu', 
  onRegionChange = () => {}, 
  selectedTypes = [], 
  onTypesChange = () => {}, 
  onRestaurantsUpdate = () => {} 
}) => {
  const [restaurantTypes, setRestaurantTypes] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState([]);
  
  const [restaurants, setRestaurants] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  const [isChoroplethOn, setIsChoroplethOn] = useState(false);
  const [isHeatMapOn, setIsHeatMapOn] = useState(false);

  const toggleChoropleth = useCallback(() => setIsChoroplethOn(prev => !prev), []);
  const toggleHeatMap = useCallback(() => setIsHeatMapOn(prev => !prev), []);

  const handleLayerToggle = useCallback((nextLayers) => {
    setSelectedLayers(nextLayers);
    if (typeof window.onLayerToggleGlobal === 'function') {
        window.onLayerToggleGlobal(nextLayers);
    }
  }, []);

  /* Fetch restaurant types whenever region changes */
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTypes(true);
    
    fetch(`http://localhost:5000/api/restaurant-types?region=${region}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const typesList = data.types || [];
        setRestaurantTypes(typesList.map(type => ({ label: (type || '').replaceAll('_', ' ') })));
      })
      .catch(err => console.error(err))
      .finally(() => { if (isMounted) setIsLoadingTypes(false); });

    return () => { isMounted = false; };
  }, [region]);

  /* Fetch restaurants whenever region or filters change */
  useEffect(() => {
    let isMounted = true;
    setIsLoadingRestaurants(true);
    
    // Map UI labels back to API filter format (e.g. "fast food" -> "fast_food")
    const filters = (selectedTypes || []).map(t => (t || '').replaceAll(' ', '_')).join(',');
    
    fetch(`http://localhost:5000/api/restaurants?region=${region}&filters=${filters}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const fetchedRestaurants = data.restaurants || [];
        setRestaurants(fetchedRestaurants);
        onRestaurantsUpdate(fetchedRestaurants);
      })
      .catch(err => console.error(err))
      .finally(() => { if (isMounted) setIsLoadingRestaurants(false); });

    return () => { isMounted = false; };
  }, [region, selectedTypes, onRestaurantsUpdate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 20px' }}>
        <h3 style={{ color: '#FFF', marginBottom: '24px' }}>Criteria Options</h3>
        <InputField label="Radius" value="500" unit="m" />
        <InputField label="Traffic" value="2,400" unit="vph" />
        <InputField label="Lot area" value="1,200" unit="sq. m" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CollapsibleSection title="Filter" items={restaurantTypes} type="checkbox" value={selectedTypes} onChange={onTypesChange} isLoading={isLoadingTypes} emptyText="No filters found" />
        
        {/* Restaurant Loading / Empty State Indicator */}
        <div style={{ padding: '12px 20px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {isLoadingRestaurants ? (
            <div style={{ color: '#3291ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #3291ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              Updating map...
            </div>
          ) : restaurants.length === 0 && (selectedTypes || []).length > 0 ? (
            <div style={{ color: '#ffcc00' }}>No restaurants match your active filters.</div>
          ) : (
            <div style={{ color: '#888' }}>
              <strong style={{ color: '#FFF' }}>{restaurants.length}</strong> location{restaurants.length !== 1 ? 's' : ''} found in {(region || 'cebu').charAt(0).toUpperCase() + (region || 'cebu').slice(1)}.
            </div>
          )}
        </div>

        <CollapsibleSection title="Layers" items={layerOptions} type="checkbox" value={selectedLayers} onChange={handleLayerToggle} />
        <CollapsibleSection title="Region" items={regionOptions} type="chip" value={region} onChange={onRegionChange} />
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <ToggleSwitch label="Choropleth Map" isOn={isChoroplethOn} onToggle={toggleChoropleth} />
        <ToggleSwitch label="Heat Map" isOn={isHeatMapOn} onToggle={toggleHeatMap} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
});