import { generateWithRetry } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Accept both naming conventions (breakdown page uses totalBudget/planType)
  const budget: number = body.budget ?? body.totalBudget ?? 0;
  const totalSaved: number = body.totalSaved ?? 0;
  const currency: string = body.currency ?? 'UGX';
  const type: string = body.type ?? body.planType ?? 'event';
  const location: string = body.location ?? '';
  const eventDate: string = body.eventDate ?? '';
  const startDate: string = body.startDate ?? new Date().toISOString().slice(0, 10);
  const answers = body.answers;

  // Calculate months left from eventDate if monthsLeft not provided directly
  let monthsLeft: number = body.monthsLeft ?? 0;
  let weeksLeft = 0;
  if (!body.monthsLeft && eventDate) {
    const ms = new Date(eventDate).getTime() - Date.now();
    weeksLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24 * 7)));
    monthsLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24 * 30)));
  } else {
    weeksLeft = monthsLeft * 4;
  }

  const needed = Math.max(0, budget - totalSaved);
  const perMonth = monthsLeft > 0 ? Math.ceil(needed / monthsLeft) : needed;
  const perWeek = weeksLeft > 0 ? Math.ceil(needed / weeksLeft) : perMonth;
  const percentSaved = budget > 0 ? ((totalSaved / budget) * 100).toFixed(0) : '0';

  const answersText = answers && Object.keys(answers).length > 0
    ? '\nAdditional context from user:\n' +
      Object.entries(answers).map(([k, v]) => `- ${k}: ${v}`).join('\n')
    : '';

  const prompt = `Savings coach for Uganda. Be brief and encouraging. No markdown.
Plan: ${type}${location ? ` in ${location}` : ''}. Goal: ${currency} ${budget.toLocaleString()}. Weeks left: ${weeksLeft}. Save per week: ${currency} ${perWeek.toLocaleString()}.
Write 2 short sentences: tell them the weekly amount to save and recommend one savings method (Sacco, M-PESA Goal, or bank standing order).`;

  try {
    const advice = await generateWithRetry(prompt);
    return NextResponse.json({ advice: advice.trim(), weeklyTarget: perWeek });
  } catch {
    const advice = weeksLeft > 0
      ? `Save ${currency} ${perWeek.toLocaleString()} every week for ${weeksLeft} weeks to reach your goal. Lock your savings in a Sacco or M-PESA Goal so you are not tempted to spend early.`
      : `Lock your savings in a Sacco or M-PESA Goal account so they stay untouched until your event.`;
    return NextResponse.json({ advice, weeklyTarget: perWeek });
  }
}
