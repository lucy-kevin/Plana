import { GoogleGenerativeAI } from '@google/generative-ai';

export const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2';

async function generateWithOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return (data.response as string).trim();
}

// Tries Gemini first. Falls back to local Ollama on 429/503/any failure.
export async function generateWithRetry(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    console.warn(`[ai] Gemini failed (${status}), falling back to Ollama`);
    return generateWithOllama(prompt);
  }
}
