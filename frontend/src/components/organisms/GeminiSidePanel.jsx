import React, { useState, useEffect, useRef } from 'react';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { ChatMessage } from '../molecules/ChatMessage';

export const GeminiSidePanel = ({ isOpen, onClose, poi }) => {
  const { messages, isTyping, error, sendMessage } = useGeminiChat(poi);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const panelStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '400px',
    backgroundColor: '#121212',
    borderRight: '1px solid #333',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 100, // Above Map Canvas and HUD
    pointerEvents: 'auto',
  };

  const headerStyle = {
    padding: '24px 20px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  };

  const titleStyle = {
    color: '#FFF',
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  };

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#AAA',
    cursor: 'pointer',
    fontSize: '28px',
    lineHeight: 1,
    padding: '0 8px',
    transition: 'color 0.2s',
  };

  const messagesContainerStyle = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#121212',
  };

  const getMessageStyle = (role) => ({
    padding: '12px 16px',
    borderRadius: '16px',
    maxWidth: '85%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: role === 'user' ? 'var(--color-accent-pink, #FF3366)' : '#2A2A2A',
    color: '#FFF',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    borderBottomRightRadius: role === 'user' ? '4px' : '16px',
    borderBottomLeftRadius: role === 'model' ? '4px' : '16px',
  });

  const inputContainerStyle = {
    padding: '20px',
    borderTop: '1px solid #333',
    display: 'flex',
    gap: '12px',
    backgroundColor: '#1E1E1E',
  };

  const inputStyle = {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '24px',
    border: '1px solid #444',
    backgroundColor: '#121212',
    color: '#FFF',
    outline: 'none',
    fontSize: '14px',
    transition: 'border-color 0.2s',
  };

  const sendBtnStyle = {
    backgroundColor: 'var(--color-accent-pink, #FF3366)',
    color: '#FFF',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 51, 102, 0.4)',
    transition: 'transform 0.2s',
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          {poi ? `AI Insights - ${poi.title}` : 'AI Assistant'}
        </h3>
        <button 
          style={closeBtnStyle} 
          onClick={onClose}
          onMouseEnter={(e) => e.target.style.color = '#FFF'}
          onMouseLeave={(e) => e.target.style.color = '#AAA'}
        >
          &times;
        </button>
      </div>

      <div style={messagesContainerStyle}>
        {messages.length === 0 && !isTyping && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>
            Start exploring location insights with Gemini...
          </div>
        )}
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        {isTyping && (
          <div style={getMessageStyle('model')}>
            <span style={{ fontStyle: 'italic', color: '#AAA' }}>Gemini is analyzing...</span>
          </div>
        )}
        {error && (
          <div style={{ color: '#FF4444', fontSize: '12px', textAlign: 'center', padding: '12px', backgroundColor: '#331111', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form style={inputContainerStyle} onSubmit={handleSend}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Ask about this location..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-pink, #FF3366)'}
          onBlur={(e) => e.target.style.borderColor = '#444'}
        />
        <button 
          style={sendBtnStyle} 
          type="submit"
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};
