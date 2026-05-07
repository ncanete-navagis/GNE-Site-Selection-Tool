import { useState, useCallback, useEffect } from 'react';

export const useGeminiChat = (selectedPOI) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const buildFAQPrompts = (poi) => [
    {
      label: "What is the foot traffic here?",
      prompt: `Analyze the pedestrian and vehicle foot traffic at ${poi.title}.
        Explain peak hours, nearby establishments contributing to traffic, and whether this is favorable for a restaurant business.`,
    },
    {
      label: "Is it located in a floodzone?",
      prompt: `Check if ${poi.title} is within a flood-prone area.
        Explain historical flood data, risk level, and how this may affect a restaurant operation.`,
    },
    {
      label: "Is the community good?",
      prompt: `Analyze the surrounding community of ${poi.title}.
        Describe demographics, safety, nearby residential and commercial zones, and if the community is suitable for a restaurant.`,
    },
    {
      label: "What is the total lot area?",
      prompt: `Provide details about the total lot area of ${poi.title}.
        Explain if the space is sufficient for a restaurant, parking, and future expansion.`,
    },
  ];

  // Endpoint for the backend proxy
  const BACKEND_URL = 'http://localhost:8000/api/v1/ai/chat';

  // Reset chat when POI changes
  useEffect(() => {
    if (selectedPOI) {
      const faqs = buildFAQPrompts(selectedPOI);

      setMessages([
        {
          id: 'initial',
          role: 'model',
          content: `Hi! I'm analyzing ${selectedPOI.title}.

  This location has a rating of ${selectedPOI.rating}/5. Based on my initial look, it seems interesting for a restaurant.

  What type of cuisine are you planning for this location?`,
          timestamp: Date.now(),
          faqs, // 👈 attach FAQs to this message
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

  const sendFAQPrompt = useCallback((prompt, label) => {
    // show only the label as user's message
    sendMessage(prompt);
  }, [sendMessage]);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    sendFAQPrompt
  };
};
