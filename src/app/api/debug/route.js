export async function GET() {
  try {
    const envInfo = {
      GOOGLE_API_KEY: {
        exists: !!process.env.GOOGLE_API_KEY,
        length: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length : 0,
        preview: process.env.GOOGLE_API_KEY ? `${process.env.GOOGLE_API_KEY.substring(0, 10)}...` : 'No configurada'
      },
      HUGGINGFACE_API_KEY: {
        exists: !!process.env.HUGGINGFACE_API_KEY,
        length: process.env.HUGGINGFACE_API_KEY ? process.env.HUGGINGFACE_API_KEY.length : 0,
        preview: process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 10)}...` : 'No configurada'
      },
      OPENAI_API_KEY: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        preview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'No configurada'
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    return Response.json({
      message: "Debug info de variables de entorno",
      data: envInfo,
      recommendations: {
        primary: envInfo.GOOGLE_API_KEY.exists ? "✅ Google Gemini configurado" : "❌ Configura GOOGLE_API_KEY",
        secondary: envInfo.HUGGINGFACE_API_KEY.exists ? "✅ Hugging Face configurado" : "❌ Configura HUGGINGFACE_API_KEY como respaldo",
        fallback: envInfo.OPENAI_API_KEY.exists ? "✅ OpenAI configurado como respaldo" : "⚠️ OpenAI no configurado"
      }
    });
  } catch (error) {
    return Response.json({ 
      error: "Error al obtener debug info",
      message: error.message 
    }, { status: 500 });
  }
} 