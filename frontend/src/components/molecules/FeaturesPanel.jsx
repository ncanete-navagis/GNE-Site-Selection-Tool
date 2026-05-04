import React, { useState } from 'react';

const filterOptions = [
  { label: 'Fast Food' },
  { label: 'Fine Dining' },
  { label: 'Cafes' },
  { label: 'Food Trucks' }
];

const layerOptions = [
  { label: 'Traffic Layer' },
  { label: 'Flood Hazard' },
  { label: 'Earthquake Risk' }
];

const regionOptions = [
  { label: 'North' },
  { label: 'South' },
  { label: 'Central' },
  { label: 'East' },
  { label: 'West' }
];

const InputField = ({ label, unit, value, placeholder }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '500' }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        defaultValue={value}
        placeholder={placeholder}
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
        fontSize: '12px',
        pointerEvents: 'none'
      }}>
        {unit}
      </span>
    </div>
  </div>
);

const CollapsibleSection = ({ title, items = [], type = 'list' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleItem = (label) => {
    setSelectedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#DDD' }}>
          {title}
        </span>

        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
          color: '#666'
        }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '12px 20px 20px 20px' }}>

          {/* LIST TYPE */}
          {type === 'list' && items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '8px 0',
                fontSize: '13px',
                color: '#BBB',
                cursor: 'pointer'
              }}
            >
              {item.label}
            </div>
          ))}

          {/* CHECKBOX TYPE */}
          {type === 'checkbox' && items.map((item, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                fontSize: '13px',
                color: '#BBB',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.label)}
                onChange={() => toggleItem(item.label)}
              />
              {item.label}
            </label>
          ))}

          {type === 'chip' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {items.map((item, index) => {
                const isSelected = selectedItems.includes(item.label);

                return (
                  <button
                    key={index}
                    onClick={() => toggleItem(item.label)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '16px',
                      border: isSelected ? '1px solid #3291ff' : '1px solid #444',
                      backgroundColor: isSelected ? 'rgba(50,145,255,0.2)' : 'transparent',
                      color: isSelected ? '#3291ff' : '#BBB',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

const ToggleSwitch = ({ label, isOn, onToggle }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <span style={{ color: '#DDD', fontSize: '14px', fontWeight: '500' }}>
        {label}
      </span>

      <div
        onClick={onToggle}
        style={{
          width: '40px',
          height: '20px',
          borderRadius: '20px',
          backgroundColor: isOn ? '#3291ff' : '#444',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#FFF',
            position: 'absolute',
            top: '2px',
            left: isOn ? '22px' : '2px',
            transition: 'left 0.2s'
          }}
        />
      </div>
    </div>
  );
};

export const FeaturesPanel = ({ poi }) => {
  const [isChoroplethOn, setIsChoroplethOn] = useState(false);
  const [isHeatMapOn, setIsHeatMapOn] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ICON TOOLBAR */}
      <div style={{ padding: '20px', display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {[1, 2, 3, 4].map((i) => (
          <button
            key={i}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#3291ff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFF'
            }}
          >
            {i === 1 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>}
            {i === 2 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.5 1.5"></path><path d="M7.5 3.5L9 9l3 2.5"></path></svg>}
            {i === 3 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
            {i === 4 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: '24px 20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#FFF' }}>
          Criteria Options
        </h3>

        <InputField label="Radius" value="500" unit="m" />
        <InputField label="Population" value="10,000" unit="km/h" /> {/* Following user example KM/H for population? Re-reading... user said Example: "Radius", "Population", "Traffic", "Lot area" and Unit label: "m", "km/h", "sq. m" */}
        <InputField label="Traffic" value="2,400" unit="vph" />
        <InputField label="Lot area" value="1,200" unit="sq. m" />

        <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '20px 0' }} />
      </div>

      {/* COLLAPSIBLE SECTIONS */}
      <div style={{ flex: 1 }}>
        <CollapsibleSection
          title="Filter"
          items={filterOptions}
          type="checkbox"
        />

        <CollapsibleSection
          title="Layers"
          items={layerOptions}
          type="checkbox"
        />

        <CollapsibleSection
          title="Region"
          items={regionOptions}
          type="chip"
        />
      </div>
      {/* MAP TOGGLES */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

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
