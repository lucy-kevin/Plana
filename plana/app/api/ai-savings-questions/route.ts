import { generateWithRetry } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

const fallbacks: Record<string, string[]> = {
  wedding: [
    'Are you saving alone or with your partner/family?',
    'What is your biggest concern about the wedding budget?',
    'Do you already have a caterer or photographer in mind?',
    'Will you need accommodation for out-of-town guests?',
    'Are you planning a honeymoon as part of this budget?',
  ],
  trip: [
    'How many nights will you be away?',
    'Will you need to book flights?',
    'Are you planning to hire a vehicle or use public transport?',
    'Will you need travel insurance?',
    'Are you saving alone or splitting costs with others?',
  ],
  birthday: [
    'Will there be a DJ or live entertainment?',
    'Do you want a custom cake?',
    'Are you hiring a venue or using a home/garden?',
    'Will you need a photographer?',
    'Are you saving alone or with family?',
  ],
  corporate: [
    'Is this an internal team event or a client-facing function?',
    'Will you need audio-visual equipment?',
    'Are meals and refreshments included in the plan?',
    'Will speakers or facilitators need to be paid?',
    'Is accommodation required for any attendees?',
  ],
  default: [
    'Are you saving alone or with others?',
    'What is the most important part of this event for you?',
    'Do you have any existing savings toward this goal?',
    'Will you need to hire any outside services or vendors?',
    'Is there any part of the budget you are most worried about?',
  ],
};

function getFallback(type: string): string[] {
  return fallbacks[type?.toLowerCase()] ?? fallbacks.default;
}

export async function POST(req: NextRequest) {
  const { planType } = await req.json();
  const type = planType ?? 'event';

  const prompt = `You are a savings coach for Uganda. A user is planning a ${type}.
Generate exactly 5 short, friendly questions to understand their situation and give personalised savings advice.
DO NOT ask about: location, venue, city, number of guests, date, month, timeline, budget amount, or savings goal — those are already collected separately.
Focus on: who they are saving with, vendor choices, existing savings, priorities, concerns, special requirements.
Return a JSON array of plain strings only. No objects, no keys, no markdown. Example:
["Question one?","Question two?","Question three?","Question four?","Question five?"]`;

  try {
    const text = await generateWithRetry(prompt);
    const stripped = text.replace(/```json[\s\S]*?```|```/g, '').trim();
    const start = stripped.indexOf('[');
    const end = stripped.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('No JSON array in response');
    const parsed = JSON.parse(stripped.slice(start, end + 1));
    const questions: string[] = Array.isArray(parsed)
      ? parsed.map((q: unknown) => (typeof q === 'string' ? q : (q as { question?: string })?.question ?? String(q)))
      : getFallback(type);
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: getFallback(type) });
  }
}
