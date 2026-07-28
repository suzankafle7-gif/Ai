import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // FIXED: Changed model name to gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Format history for Gemini (exclude the last message which we send separately)
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;
    
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
