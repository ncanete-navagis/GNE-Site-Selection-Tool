import { useState, useCallback, useEffect } from 'react';

export const useGeminiChat = (selectedPOI) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  // Endpoint for the backend proxy
  const BACKEND_URL = 'http://localhost:5000/chat';

  // Reset chat when POI changes
  useEffect(() => {
    if (selectedPOI) {
      setMessages([
        {
          id: 'initial',
          role: 'model',
          content: `Hi! I'm analyzing ${selectedPOI.title} (${selectedPOI.type}). This location has a rating of ${selectedPOI.rating}/5. Based on my initial look, it seems interesting for a restaurant. What type of cuisine are you planning for this location?`,
          timestamp: Date.now()
        }
      ]);
    }
  }, [selectedPOI?.id]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !selectedPOI) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Prepare history in the format expected by Gemini (though backend handles parts, we send simplified list)
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: history,
          poiContext: {
            title: selectedPOI.title,
            type: selectedPOI.type,
            rating: selectedPOI.rating
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Backend failed to respond');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.response,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error("Gemini Proxy Error:", err);
      setError("I'm having trouble connecting to my knowledge base. Please try again.");
    } finally {
      setIsTyping(false);
    }
  }, [messages, selectedPOI]);

  return {
    messages,
    isTyping,
    error,
    sendMessage
  };
};
