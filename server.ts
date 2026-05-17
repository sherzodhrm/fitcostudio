import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route: Analyze Food
  app.post("/api/analyze-food", async (req, res) => {
    try {
      const { text, image } = req.body;
      
      const parts: any[] = [];
      if (image) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          }
        });
      }
      parts.push({
        text: `Analyze this food${text ? ' described as: "' + text + '"' : ''}${image ? ' (see image)' : ''}. 
        Return details for calorie and nutrient tracking. Be as accurate as possible for an active person interested in body recomposition.
        Return the result in JSON format.`
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              portion: { type: Type.STRING },
              kcal: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              notes: { type: Type.STRING }
            },
            required: ["name", "portion", "kcal", "protein", "carbs", "fat"]
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: AI Coach Chat
  app.post("/api/chat-coach", async (req, res) => {
    try {
      const { message, history, profile } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        history: history,
        config: {
          systemInstruction: `You are an elite fitness and nutrition coach. 
          User Profile: ${JSON.stringify(profile)}.
          Be concise, evidence-based, and encouraging. Focus on body recomposition and high-performance training.
          If they ask about health issues, advise consulting a doctor but provide general fitness context.`
        }
      });

      const result = await chat.sendMessage({ message });
      res.json({ response: result.text });
    } catch (error: any) {
      console.error("Coach API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
