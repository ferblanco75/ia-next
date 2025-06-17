export async function POST(request) {
  try {
    console.log("🧪 Iniciando prueba específica de Gemini...");
    
    const { prompt } = await request.json();
    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

    console.log("🔍 Verificando GOOGLE_API_KEY...");
    console.log("GOOGLE_API_KEY existe:", !!process.env.GOOGLE_API_KEY);
    console.log("GOOGLE_API_KEY length:", process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length : 0);
    console.log("GOOGLE_API_KEY preview:", process.env.GOOGLE_API_KEY ? `${process.env.GOOGLE_API_KEY.substring(0, 10)}...` : 'No configurada');

    if (!process.env.GOOGLE_API_KEY) {
      return Response.json({ 
        error: "GOOGLE_API_KEY no configurada",
        status: "missing_key"
      }, { status: 400 });
    }

    try {
      console.log("📦 Importando GoogleGenerativeAI...");
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      console.log("✅ GoogleGenerativeAI importado correctamente");

      console.log("🔧 Creando instancia de Gemini...");
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      console.log("✅ Instancia de Gemini creada");

      // Intentar con diferentes modelos disponibles
      const models = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];
      let response = null;
      let modelUsed = null;

      for (const modelName of models) {
        try {
          console.log(`🤖 Probando modelo: ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          console.log(`✅ Modelo ${modelName} obtenido`);

          console.log("📝 Enviando prompt a Gemini...");
          console.log("Prompt:", prompt.substring(0, 100) + "...");
          
          const result = await model.generateContent(prompt);
          console.log(`✅ Respuesta recibida de Gemini con modelo ${modelName}`);

          response = result.response.text();
          modelUsed = modelName;
          console.log("📄 Texto extraído:", response.substring(0, 100) + "...");
          break; // Si funciona, salir del bucle

        } catch (modelError) {
          console.log(`❌ Error con modelo ${modelName}:`, modelError.message);
          continue; // Intentar con el siguiente modelo
        }
      }

      if (!response) {
        throw new Error("Ningún modelo de Gemini funcionó");
      }

      return Response.json({ 
        success: true,
        response: response,
        service: "Google Gemini",
        model: modelUsed,
        prompt: prompt,
        responseLength: response.length
      });

    } catch (geminiError) {
      console.error("❌ Error específico de Gemini:", geminiError);
      console.error("❌ Error message:", geminiError.message);
      console.error("❌ Error stack:", geminiError.stack);
      
      return Response.json({ 
        error: "Error al conectar con Google Gemini",
        details: geminiError.message,
        status: "gemini_error",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error("💥 Error general en test-gemini:", error);
    return Response.json({ 
      error: "Error general en el endpoint de prueba",
      details: error.message,
      status: "general_error"
    }, { status: 500 });
  }
} 