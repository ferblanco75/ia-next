import { verifyToken } from "../../../lib/auth.js";

// Función para usar Google Gemini (gratuito, funciona en Vercel)
async function chatWithGemini(prompt) {
  try {
    console.log("🤖 Intentando usar Google Gemini...");
    console.log("🔑 API Key length:", process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length : 0);
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Usar el modelo correcto disponible
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("📝 Enviando prompt a Gemini:", prompt.substring(0, 50) + "...");
    const result = await model.generateContent(prompt);
    console.log("✅ Respuesta generada con Google Gemini");
    return result.response.text();
  } catch (error) {
    console.error('❌ Error con Gemini:', error.message);
    console.error('❌ Error completo:', error);
    
    // Si el modelo no está disponible, intentar con otro
    if (error.message.includes('not found') || error.message.includes('404')) {
      console.log("🔄 Intentando con modelo alternativo...");
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        
        const result = await model.generateContent(prompt);
        console.log("✅ Respuesta generada con Gemini 1.0 Pro");
        return result.response.text();
      } catch (fallbackError) {
        console.error('❌ Error con modelo alternativo:', fallbackError.message);
        throw new Error(`Error al conectar con Google Gemini: ${fallbackError.message}`);
      }
    }
    
    throw new Error(`Error al conectar con Google Gemini: ${error.message}`);
  }
}

// Función para usar Hugging Face (gratuito, funciona en Vercel)
async function chatWithHuggingFace(prompt) {
  try {
    console.log("🤖 Intentando usar Hugging Face...");
    console.log("🔑 API Key length:", process.env.HUGGINGFACE_API_KEY ? process.env.HUGGINGFACE_API_KEY.length : 0);
    
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
    console.log("✅ Respuesta generada con Hugging Face");
    return response.generated_text;
  } catch (error) {
    console.error('❌ Error con Hugging Face:', error.message);
    throw new Error(`Error al conectar con Hugging Face: ${error.message}`);
  }
}

// Función para usar OpenAI (mantener como respaldo)
async function chatWithOpenAI(prompt) {
  try {
    console.log("🤖 Usando OpenAI como respaldo...");
    console.log("🔑 API Key length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
    
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });
    console.log("✅ Respuesta generada con OpenAI");
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error con OpenAI:', error.message);
    throw new Error(`Error al conectar con OpenAI: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    console.log("🚀 Iniciando request de chat...");
    
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

    console.log("🔍 Verificando servicios de IA disponibles...");
    console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? `✅ Configurada (${process.env.GOOGLE_API_KEY.substring(0, 10)}...)` : "❌ No configurada");
    console.log("HUGGINGFACE_API_KEY:", process.env.HUGGINGFACE_API_KEY ? `✅ Configurada (${process.env.HUGGINGFACE_API_KEY.substring(0, 10)}...)` : "❌ No configurada");
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? `✅ Configurada (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : "❌ No configurada");

    let response;
    let serviceUsed = "ninguno";
    
    // Intentar usar Google Gemini primero (gratuito, funciona en Vercel)
    if (process.env.GOOGLE_API_KEY) {
      try {
        console.log("🎯 Intentando Gemini como primera opción...");
        response = await chatWithGemini(prompt);
        serviceUsed = "Google Gemini";
      } catch (geminiError) {
        console.log('❌ Gemini no disponible:', geminiError.message);
      }
    } else {
      console.log("⚠️ GOOGLE_API_KEY no configurada, saltando Gemini");
    }
    
    // Si Gemini falla, intentar Hugging Face
    if (!response && process.env.HUGGINGFACE_API_KEY) {
      try {
        console.log("🎯 Intentando Hugging Face como segunda opción...");
        response = await chatWithHuggingFace(prompt);
        serviceUsed = "Hugging Face";
      } catch (hfError) {
        console.log('❌ Hugging Face no disponible:', hfError.message);
      }
    } else if (!response) {
      console.log("⚠️ HUGGINGFACE_API_KEY no configurada, saltando Hugging Face");
    }
    
    // Si ambos fallan, usar OpenAI como respaldo
    if (!response && process.env.OPENAI_API_KEY) {
      try {
        console.log("🎯 Intentando OpenAI como respaldo...");
        response = await chatWithOpenAI(prompt);
        serviceUsed = "OpenAI";
      } catch (openaiError) {
        console.log('❌ OpenAI no disponible:', openaiError.message);
      }
    } else if (!response) {
      console.log("⚠️ OPENAI_API_KEY no configurada, saltando OpenAI");
    }
    
    if (!response) {
      console.log("💥 No se pudo conectar con ningún servicio de IA");
      return Response.json({ 
        error: "No se pudo conectar con ningún servicio de IA. Configura al menos una API key (GOOGLE_API_KEY, HUGGINGFACE_API_KEY, o OPENAI_API_KEY)." 
      }, { status: 500 });
    }

    console.log(`🎉 Respuesta generada exitosamente usando: ${serviceUsed}`);
    return Response.json({ response, serviceUsed });
  } catch (error) {
    console.error("💥 Error general en la API:", error);
    return Response.json({ error: "Error generating response" }, { status: 500 });
  }
} 