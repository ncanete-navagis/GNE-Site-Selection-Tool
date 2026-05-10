import React, { useState, useEffect, useCallback } from 'react';

const layerOptions = [
  { label: 'Traffic Layer', value: 'traffic' },
  { label: 'Flood Hazard', value: 'flood' },
  { label: 'Earthquake Risk', value: 'earthquake' }
];

const regionOptions = [
  { label: 'Cebu', value: 'cebu' },
  { label: 'Manila', value: 'manila' }
];

const InputField = React.memo(({ label, unit, value }) => (
  <div style={{ marginBottom: '20px' }}>
    <label
      style={{
        display: 'block',
        fontSize: '12px',
        color: '#888',
        marginBottom: '8px'
      }}
    >
      {label}
    </label>

    <div style={{ position: 'relative' }}>
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

      <span
        style={{
          position: 'absolute',
          right: '16px',
          top: '12px',
          color: '#666'
        }}
      >
        {unit}
      </span>
    </div>
  </div>
));

const CollapsibleSection = React.memo(({
  title,
  items = [],
  type = 'checkbox',
  value = [],
  onChange = () => { },
  isLoading = false,
  emptyText = "No items"
}) => {

  const [isOpen, setIsOpen] = useState(true);

  const toggleItem = useCallback((itemValue) => {

    if (type === 'chip') {
      onChange(itemValue);
      return;
    }

    const current = value || [];

    const next = current.includes(itemValue)
      ? current.filter(v => v !== itemValue)
      : [...current, itemValue];

    onChange(next);

  }, [type, value, onChange]);

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}
    >

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <span
          style={{
            color: '#DDD',
            fontWeight: '600'
          }}
        >
          {title}
        </span>

        <span style={{ color: '#666' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '12px 20px 20px 20px' }}>

          {isLoading ? (
            <div style={{ color: '#888' }}>
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div style={{ color: '#888' }}>
              {emptyText}
            </div>
          ) : (
            <>
              {type === 'checkbox' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {items.map((item, i) => {

                    const isSelected = (value || []).includes(item.value);

                    return (
                      <label
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: isSelected ? '#fff' : '#bbb',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(item.value)}
                        />

                        {item.label}
                      </label>
                    );
                  })}
                </div>
              )}

              {type === 'chip' && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}
                >
                  {items.map((item, i) => {

                    const isSelected = value === item.value;

                    return (
                      <button
                        key={i}
                        onClick={() => toggleItem(item.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: isSelected
                            ? '1px solid #3291ff'
                            : '1px solid #444',
                          background: isSelected
                            ? 'rgba(50,145,255,0.2)'
                            : 'transparent',
                          color: isSelected
                            ? '#3291ff'
                            : '#bbb',
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
});

export const FeaturesPanel = ({
  region = 'cebu',
  onRegionChange = () => { },
  selectedTypes = [],
  onTypesChange = () => { },
  onRestaurantsUpdate = () => { }
}) => {

  const [restaurantTypes, setRestaurantTypes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  const [selectedLayers, setSelectedLayers] = useState([]);

  const handleLayerToggle = useCallback((layers) => {
    setSelectedLayers(layers);
  }, []);

  // FETCH RESTAURANT TYPES
  useEffect(() => {

    let active = true;

    setIsLoadingTypes(true);

    fetch(`http://localhost:8000/api/v1/places/restaurant-types?region=${region}`)
      .then(res => res.json())
      .then(data => {

        if (!active) return;

        const types = Array.isArray(data.types)
          ? data.types
          : [];

        const formattedTypes = types.map(type => ({
          label: String(type).replaceAll('_', ' '),
          value: String(type)
        }));

        console.log(`[FeaturesPanel] Loaded ${formattedTypes.length} restaurant types for ${region}`);
        setRestaurantTypes(formattedTypes);
      })
      .catch(err => {
        console.error("Restaurant Types Error:", err);
        setRestaurantTypes([]);
      })
      .finally(() => {
        if (active) {
          setIsLoadingTypes(false);
        }
      });

    return () => {
      active = false;
    };

  }, [region]);

  // FETCH RESTAURANTS
  useEffect(() => {

    let active = true;

    setIsLoadingRestaurants(true);

    const filters = (selectedTypes || []).join(',');

    fetch(
      `http://localhost:8000/api/v1/places/restaurants?region=${region}&filters=${filters}`
    )
      .then(res => res.json())
      .then(data => {

        if (!active) return;

        const list = Array.isArray(data.restaurants)
          ? data.restaurants
          : [];

        console.log(`[FeaturesPanel] Fetched ${list.length} restaurants for ${region}. Filters: [${filters}]`);

        if (data.error) {
          console.warn("[FeaturesPanel] API returned an error:", data.error);
        }

        setRestaurants(list);

        // UPDATE MAP MARKERS
        onRestaurantsUpdate(list);

      })
      .catch(err => {

        console.error("Restaurants Error:", err);

        setRestaurants([]);

        onRestaurantsUpdate([]);

      })
      .finally(() => {

        if (active) {
          setIsLoadingRestaurants(false);
        }

      });

    return () => {
      active = false;
    };

  }, [region, selectedTypes, onRestaurantsUpdate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >

      <div style={{ padding: '20px' }}>

        <h3 style={{ color: '#fff' }}>
          Criteria Options
        </h3>

        <InputField
          label="Radius"
          value="500"
          unit="m"
        />

        <InputField
          label="Traffic"
          value="2400"
          unit="vph"
        />

        <InputField
          label="Lot area"
          value="1200"
          unit="sq. m"
        />

      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto'
        }}
      >

        <CollapsibleSection
          title="Restaurant Types"
          items={restaurantTypes}
          value={selectedTypes}
          onChange={onTypesChange}
          isLoading={isLoadingTypes}
          emptyText="No restaurant types found"
        />

        <div
          style={{
            padding: '16px 20px',
            color: '#888',
            fontSize: '14px'
          }}
        >
          {isLoadingRestaurants
            ? 'Loading restaurants...'
            : `${restaurants.length} locations found in ${region}.`}
        </div>

        <CollapsibleSection
          title="Layers"
          items={layerOptions}
          value={selectedLayers}
          onChange={handleLayerToggle}
        />

        <CollapsibleSection
          title="Region"
          items={regionOptions}
          type="chip"
          value={region}
          onChange={onRegionChange}
        />

      </div>
    </div>
  );
};