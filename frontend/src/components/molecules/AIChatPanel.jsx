import React, { useState, useEffect, useRef } from 'react';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { ChatMessage } from './ChatMessage';
import { CollapsibleSection } from './CollapsibleSection';
import { MiniFAQAccordion } from './MiniFAQAccordion';

// Import modular prompts
import { footTrafficPrompts } from '../../ai-prompts/footTraffic.prompts';
import { demographicsPrompts } from '../../ai-prompts/demographics.prompts';
import { competitionPrompts } from '../../ai-prompts/competition.prompts';
import { accessibilityPrompts } from '../../ai-prompts/accessibility.prompts';
import { risksPrompts } from '../../ai-prompts/risks.prompts';
import { spacePrompts } from '../../ai-prompts/space.prompts';
import { businessFitPrompts } from '../../ai-prompts/businessFit.prompts';

const FAQDropdown = ({ id, onSendPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 'var(--border-radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all var(--transition-fast)',
          backgroundColor: isOpen ? 'var(--hover-bg)' : 'transparent'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        Quick follow-up questions {isOpen ? '▴' : '▾'}
      </button>
      
      {isOpen && (
        <div style={{ 
          width: '100%', 
          maxWidth: '320px', 
          marginTop: '8px', 
          animation: 'fadeIn var(--transition-normal)'
        }}>
          <MiniFAQAccordion onSendPrompt={onSendPrompt} />
        </div>
      )}
    </div>
  );
};

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

            {/* 👇 Contextual Mini FAQ Dropdown (appears on model messages) */}
            {(msg.id === 'initial' || msg.showMiniFAQ) && msg.role === 'model' && (
              <div style={{ marginLeft: '12px', marginTop: '4px' }}>
                <FAQDropdown id="tutorial-ai-faq" onSendPrompt={sendFAQPrompt} />
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
        backgroundColor: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border-primary)'
      }}>
        <form
          id="tutorial-ai-user-inputs"
          style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-soft)'
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
              backgroundColor: 'var(--accent-primary)',
              color: '#FFF',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            type="submit"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
