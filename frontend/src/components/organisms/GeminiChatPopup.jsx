import React, { useState, useEffect, useRef } from 'react';
import { useGeminiChat } from '../../hooks/useGeminiChat';

export const GeminiChatPopup = ({ poi, onClose }) => {
  const { messages, isTyping, error, sendMessage } = useGeminiChat(poi);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const containerStyle = {
    position: 'absolute',
    top: '24px',
    right: '350px', // next to HUD
    width: '320px',
    height: '450px',
    backgroundColor: '#1E1E1E',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 20,
    border: '1px solid #333'
  };

  const headerStyle = {
    padding: '16px',
    backgroundColor: '#2A2A2A',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyle = {
    color: '#FFF',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0
  };

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '20px',
    padding: 0
  };

  const messagesStyle = {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const getMessageStyle = (role) => ({
    padding: '10px 14px',
    borderRadius: '12px',
    maxWidth: '85%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: role === 'user' ? '#007BFF' : '#333',
    color: '#FFF',
    fontSize: '14px',
    lineHeight: '1.4'
  });

  const inputContainerStyle = {
    padding: '16px',
    borderTop: '1px solid #333',
    display: 'flex',
    gap: '8px',
    backgroundColor: '#1E1E1E'
  };

  const inputStyle = {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '20px',
    border: '1px solid #444',
    backgroundColor: '#2A2A2A',
    color: '#FFF',
    outline: 'none',
    fontSize: '14px'
  };

  const sendBtnStyle = {
    backgroundColor: '#007BFF',
    color: '#FFF',
    border: 'none',
    borderRadius: '20px',
    padding: '0 16px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Gemini AI - {poi?.title}</h3>
        <button style={closeBtnStyle} onClick={onClose}>&times;</button>
      </div>

      <div style={messagesStyle}>
        {messages.map((msg, idx) => (
          <div key={idx} style={getMessageStyle(msg.role)}>
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div style={getMessageStyle('model')}>
            <span style={{ fontStyle: 'italic', color: '#AAA' }}>Typing...</span>
          </div>
        )}
        {error && (
          <div style={{ color: '#FF4444', fontSize: '12px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form style={inputContainerStyle} onSubmit={handleSend}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Ask Gemini..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button style={sendBtnStyle} type="submit">Send</button>
      </form>
    </div>
  );
};
