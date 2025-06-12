import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
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