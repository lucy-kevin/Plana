import { model } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { question, location } = await req.json();

  const prompt = `You are Plana, an AI planning assistant answering via USSD (SMS-style).
Answer this question in under 150 characters. Be specific with real numbers. No markdown, no bullet points.
${location ? `User location: ${location}` : ''}
Question: ${question}`;

  try {
    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim().slice(0, 150);
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: 'Sorry, Plana AI is unavailable right now. Try again shortly.' });
  }
}
