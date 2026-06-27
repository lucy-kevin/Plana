import { model } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { category, location, budget, currency } = await req.json();

  const prompt = `List up to 6 real ${category} service providers in ${location} within a budget of ${currency} ${budget}.
Return raw JSON only, no markdown:
[{"id":"prov-1","name":"string","category":"${category}","location":"${location}","priceMin":number,"priceMax":number,"currency":"${currency}","rating":number,"description":"string","phone":"string","website":"string","source":"string"}]
Use real businesses. Ratings between 3.5 and 5.0. All prices in ${currency}.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('[ai-providers] raw:', text.slice(0, 400));
    const clean = text.replace(/```json[\s\S]*?```|```/g, '').trim();
    const providers = JSON.parse(clean);
    return NextResponse.json({ providers });
  } catch (err) {
    console.error('[ai-providers] error:', (err as Error).message);
    return NextResponse.json({ providers: [] });
  }
}
