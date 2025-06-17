import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Función para usar Google Gemini (gratuito, funciona en Vercel)
async function chatWithGemini(prompt) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error con Gemini:', error);
    throw new Error('Error al conectar con Google Gemini. Verifica tu API key.');
  }
}

// Función para usar Hugging Face (gratuito, funciona en Vercel)
async function chatWithHuggingFace(prompt) {
  try {
    const { HfInference } = await import('@huggingface/inference');
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7
      }
    });
    return response.generated_text;
  } catch (error) {
    console.error('Error con Hugging Face:', error);
    throw new Error('Error al conectar con Hugging Face. Verifica tu API key.');
  }
}

// Función para usar OpenAI (mantener como respaldo)
async function chatWithOpenAI(prompt) {
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
  });

  return completion.choices[0].message.content;
}

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    let response;
    
    // Intentar usar Google Gemini primero (gratuito, funciona en Vercel)
    if (process.env.GOOGLE_API_KEY) {
      try {
        response = await chatWithGemini(prompt);
      } catch (geminiError) {
        console.log('Gemini no disponible:', geminiError.message);
      }
    }
    
    // Si Gemini falla, intentar Hugging Face
    if (!response && process.env.HUGGINGFACE_API_KEY) {
      try {
        response = await chatWithHuggingFace(prompt);
      } catch (hfError) {
        console.log('Hugging Face no disponible:', hfError.message);
      }
    }
    
    // Si ambos fallan, usar OpenAI como respaldo
    if (!response && process.env.OPENAI_API_KEY) {
      try {
        response = await chatWithOpenAI(prompt);
      } catch (openaiError) {
        console.log('OpenAI no disponible:', openaiError.message);
      }
    }
    
    if (!response) {
      return res.status(500).json({ 
        error: "No se pudo conectar con ningún servicio de IA. Configura al menos una API key (GOOGLE_API_KEY, HUGGINGFACE_API_KEY, o OPENAI_API_KEY)." 
      });
    }

    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating response" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor iniciado en http://localhost:${PORT}`);
}); 