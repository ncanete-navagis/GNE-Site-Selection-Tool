import { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';

export const SearchField = ({
  value,
  onChange,
  placeholder = "Search for a place or address...",
  className = '',
  onSelectSuggestion
}) => {

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // debounce timer
  useEffect(() => {
    if (!value) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 400); // debounce

    return () => clearTimeout(timeout);
  }, [value]);

  const fetchSuggestions = async (text) => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/search/autocomplete?q=${text}&city=cebu`
      );

      const data = await res.json();
      setSuggestions(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    onChange(item.text); // fill input
    setSuggestions([]);

    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
  };

  return (
    <div className={`search-field ${className}`} style={{ position: 'relative' }}>

      {/* INPUT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        borderRadius: 'var(--border-radius-pill)',
        padding: '0 8px',
        flexGrow: 1,
      }}>
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />

        <Icon
          name="search"
          color="var(--text-muted)"
          style={{ marginLeft: '12px', marginRight: '8px', opacity: 0.7 }}
        />
      </div>

      {/* DROPDOWN */}
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#1f1f1f',
          borderRadius: '8px',
          marginTop: '6px',
          zIndex: 1000,
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #333',
                color: 'white'
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>
          Loading...
        </div>
      )}
    </div>
  );
};