import { GoogleGenerativeAI } from '@google/generative-ai';

export const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

// Retries once after a delay if Gemini returns 429 or 503
export async function generateWithRetry(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 429 || status === 503) {
      await new Promise((r) => setTimeout(r, 12000));
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
    throw err;
  }
}
