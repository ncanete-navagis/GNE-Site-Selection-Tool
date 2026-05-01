import React, { useState } from 'react';
import Icon from '../atoms/Icon';

const SearchInput = ({ placeholder, onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div
      className="d-flex align-items-center p-2"
      style={{
        background: '#404249',
        borderRadius: '8px',
        width: '100%'
      }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          outline: 'none',
          width: '100%',
          fontSize: '14px'
        }}
      />
      <button
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        onClick={handleSend}
      >
        <Icon name="send" size={16} />
      </button>
    </div>
  );
};

export default SearchInput;

