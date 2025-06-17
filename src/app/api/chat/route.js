import { verifyToken } from "../../../lib/auth.js";

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

export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Token de autenticación requerido" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return Response.json({ error: "Token inválido o expirado" }, { status: 401 });
    }

    const { prompt } = await request.json();
    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

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
      return Response.json({ 
        error: "No se pudo conectar con ningún servicio de IA. Configura al menos una API key (GOOGLE_API_KEY, HUGGINGFACE_API_KEY, o OPENAI_API_KEY)." 
      }, { status: 500 });
    }

    return Response.json({ response });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error generating response" }, { status: 500 });
  }
} 