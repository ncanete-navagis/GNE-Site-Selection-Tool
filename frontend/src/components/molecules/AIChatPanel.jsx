import React, { useState, useEffect, useRef } from 'react';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { ChatMessage } from './ChatMessage';

export const AIChatPanel = ({ poi }) => {
  const { messages, isTyping, error, sendMessage, sendFAQPrompt } = useGeminiChat(poi);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{
        flex: 1,
        padding: '0 32px 32px 32px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        scrollbarWidth: 'none'
      }}>
        {messages.length === 0 && !isTyping && (
          <div style={{
            color: 'rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            marginTop: '60px',
            fontSize: '14px',
            padding: '0 40px',
            lineHeight: '1.6'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
            Ask Gemini about demographics, foot traffic, or local competitors for this site.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ChatMessage role={msg.role} content={msg.content} />

            {/* 👇 FAQ Buttons (only appears on first message) */}
            {msg.faqs && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginLeft: msg.role === 'model' ? '8px' : '0'
              }}>
                {msg.faqs.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => sendFAQPrompt(faq.prompt, faq.label)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
                    }
                  >
                    {faq.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '20px 20px 20px 4px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            alignSelf: 'flex-start',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div className="typing-dots" style={{ display: 'flex', gap: '4px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
            </div>
            Gemini is thinking...
          </div>
        )}

        {error && (
          <div style={{
            color: '#ff4d4d',
            fontSize: '12px',
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 77, 77, 0.2)'
          }}>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '24px 32px 32px 32px',
        background: 'linear-gradient(to top, rgba(18, 18, 18, 1) 80%, rgba(18, 18, 18, 0))'
      }}>
        <form
          style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '6px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}
          onSubmit={handleSend}
        >
          <input
            style={{
              flex: 1,
              padding: '12px 18px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFF',
              fontSize: '14px',
              outline: 'none'
            }}
            type="text"
            placeholder="Ask Gemini anything..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            style={{
              backgroundColor: 'var(--color-accent-pink, #ff2a85)',
              color: '#FFF',
              border: 'none',
              borderRadius: '14px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(255, 42, 133, 0.3)'
            }}
            type="submit"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
