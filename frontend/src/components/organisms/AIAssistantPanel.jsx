import React, { useRef, useEffect } from 'react';
import ChatBubble from '../molecules/ChatBubble';
import SearchInput from '../molecules/SearchInput';
import Typography from '../atoms/Typography';
import { useGeminiChat } from '../../hooks/useGeminiChat';

const AIAssistantPanel = ({ poi }) => {
  const { messages, isTyping, error, sendMessage } = useGeminiChat(poi);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      className="m-3 p-3" 
      style={{ 
        background: '#1E1F22', 
        borderRadius: '8px', 
        height: '300px', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      <div className="flex-grow-1 overflow-auto mb-2 pr-1" ref={scrollRef}>
        {messages.map((msg) => (
          <ChatBubble 
            key={msg.id} 
            text={msg.content} 
            isAI={msg.role === 'model'} 
          />
        ))}
        {isTyping && (
          <div className="p-2 opacity-50">
            <Typography variant="caption" color="white">Navagis Agent is thinking...</Typography>
          </div>
        )}
        {error && (
          <div className="p-2 text-danger small">
            {error}
          </div>
        )}
      </div>
      <div className="mt-auto">
        <SearchInput 
          placeholder="Ask about foot traffic..." 
          onSend={sendMessage} 
        />
      </div>
    </div>
  );
};

export default AIAssistantPanel;

