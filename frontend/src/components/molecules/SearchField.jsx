import { useState, useEffect, useRef } from 'react';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';

export const SearchField = ({
  value,
  onChange,
  placeholder = "Search for a place or address...",
  className = '',
  onSelectSuggestion,
  city = 'cebu'
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // debounce timer for fetching suggestions
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);

    return () => clearTimeout(timeout);
  }, [value]);

  const fetchSuggestions = async (text) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/search/autocomplete?q=${encodeURIComponent(text)}&city=${city}`
      );
      const data = await res.json();
      setSuggestions(data.results || []);
      setShowDropdown(data.results && data.results.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    // Fill the input with the selected text
    if (onChange) {
      onChange({ target: { value: item.text } });
    }
    setShowDropdown(false);
    setSuggestions([]);

    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div 
      className={`search-field ${className}`} 
      style={{ position: 'relative', flexGrow: 1 }}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* INPUT CONTAINER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--border-radius-pill)',
        padding: '0 8px',
        border: '1px solid var(--border-primary)',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />

        <div style={{ padding: '0 8px', display: 'flex', alignItems: 'center' }}>
          {loading ? (
            <div className="spinner-small" style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.1)',
              borderTop: '2px solid var(--accent-primary, #4285F4)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}></div>
          ) : (
            <Icon
              name="search"
              color="var(--text-muted)"
              size={18}
              style={{ opacity: 0.7 }}
            />
          )}
        </div>
      </div>

      {/* DROPDOWN */}
      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: '#1a1a1a',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          padding: '4px'
        }}>
          {suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(index)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderRadius: '8px',
                backgroundColor: activeIndex === index ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: activeIndex === index ? '#fff' : '#ccc',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Icon name="mapPin" size={14} color={activeIndex === index ? '#4285F4' : '#666'} />
              <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};