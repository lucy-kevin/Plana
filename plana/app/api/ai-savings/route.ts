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

  const prompt = `You are a warm, practical savings coach for Plana, a planning app used in Uganda.

The user is saving for: ${type}${location ? ` in ${location}` : ''}.
Goal: ${currency} ${budget.toLocaleString()}
Saved so far: ${currency} ${totalSaved.toLocaleString()} (${percentSaved}% done)
Still needed: ${currency} ${needed.toLocaleString()}
Weeks left: ${weeksLeft}
Must save per week: ${currency} ${perWeek.toLocaleString()}
Must save per month: ${currency} ${perMonth.toLocaleString()}
Event date: ${eventDate || 'not set'}
${answersText}

Write 3–4 sentences of warm, practical savings advice in plain English. No markdown, no bullet points.
Tell them clearly how much to save per week, and recommend a specific savings method (M-PESA Goal, Sacco, bank standing order, or chama).`;

  try {
    const advice = await generateWithRetry(prompt);
    return NextResponse.json({ advice: advice.trim(), weeklyTarget: perWeek });
  } catch (err) {
    console.error('[ai-savings] error:', err);
    return NextResponse.json({
      weeklyTarget: perWeek,
      advice: weeksLeft > 0
        ? `To reach your ${currency} ${budget.toLocaleString()} goal, you need to save ${currency} ${perWeek.toLocaleString()} every week for the next ${weeksLeft} weeks. Consider locking your savings in an M-PESA Goal account or a Sacco so you are not tempted to spend early. Set up a standing order on your bank app to move money automatically on payday.`
        : `Set a clear weekly savings target and lock your money in an M-PESA Goal account or Sacco so it stays untouched until your event. A standing order from your bank on payday is the easiest way to stay consistent.`,
    });
  }
}
