import React from 'react'

const NavigationHub = ({ activeTab, onTabChange }) => {
  const tabs = ['Filter', 'History', 'Layers']

  return (
    <div className="d-flex align-items-center gap-4 px-2 pb-1">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`btn btn-link text-decoration-none px-0 py-1 fw-medium transition-all ${
            activeTab === tab ? 'text-primary' : 'text-white opacity-50'
          }`}
          onClick={() => onTabChange(tab)}
          style={{ borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent' }}
        >
          {tab}
          {tab === 'Filter' && <span className="ms-1 small">▾</span>}
        </button>
      ))}
    </div>
  )
}

export default NavigationHub
