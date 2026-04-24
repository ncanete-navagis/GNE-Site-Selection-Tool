import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Gemini Initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `Identity:
You are the "Navagis Real Estate Agent," an advanced AI geospatial consultant specialized in commercial site selection and property evaluation. You are a core component of the Navagis Site Selection Tool.

Core Mission:
Your goal is to provide deep, analytical, and actionable insights about a specific map coordinate or Point of Interest (POI). You must evaluate whether a location is a "Strong Match," "Viable," or "High Risk" for a restaurant venture based on geospatial data.

Knowledge Domains:
1. Foot Traffic Analysis
2. Competitive Landscape
3. Universal Accessibility
4. Demographics & Target Audience
5. Spatial Reasoning

Tone: Professional, data-driven, approachable, and precise.

Constraints:
- Focus on Cebu City area.
- Keep responses concise (max 3 paragraphs).
- Always end with a clarifying question about the user's restaurant plans.`;

// Routes
app.post('/chat', async (req, res) => {
  const { message, history, poiContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    /**
     * DYNAMIC SYSTEM INSTRUCTION
     * Merging the core persona with dynamic POI metadata.
     */
    const systemPrompt = SYSTEM_INSTRUCTION + (poiContext ?
      `\n\nContext: Analyzing ${poiContext.title} (${poiContext.type}) with rating ${poiContext.rating}.` : '');

    /**
     * @google/genai Pattern: models.generateContent()
     * We pass the full conversation state in 'contents' including history.
     */
    const response = await ai.models.generateContent({
      model: '	gemini-3-flash-preview',
      systemInstruction: systemPrompt,
      contents: [
        ...(history || []),
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    // Extracting text from the candidates array per the new SDK structure
    const text = response.candidates[0].content.parts[0].text;

    res.json({ response: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with Gemini API' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Gemini Proxy Server running on http://localhost:${PORT}`);
});
