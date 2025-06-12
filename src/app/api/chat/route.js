import OpenAI from "openai";
import { verifyToken } from "../../../lib/auth.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const response = completion.choices[0].message.content;
    return Response.json({ response });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error generating response" }, { status: 500 });
  }
} 