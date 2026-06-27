import { model } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    budget,
    currency,
    eventDate,
    startDate,
    totalSaved,
    monthsLeft,
    type,
    location,
    // extra answers from the savings questions flow
    answers,
  } = await req.json();

  const needed = budget - totalSaved;
  const perMonth = monthsLeft > 0 ? (needed / monthsLeft).toFixed(0) : needed;
  const perWeek = monthsLeft > 0 ? (needed / (monthsLeft * 4.33)).toFixed(0) : needed;
  const percentSaved = ((totalSaved / budget) * 100).toFixed(0);
  const onTrack = totalSaved >= budget - needed;

  // Format any extra answers the user provided into the prompt
  const answersText = answers && Object.keys(answers).length > 0
    ? '\nAdditional context from user:\n' +
      Object.entries(answers)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')
    : '';

  const prompt = `You are a warm, practical savings coach for Plana, a planning app used in Africa.

The user is saving for: ${type || 'an event'}${location ? ` in ${location}` : ''}.
Goal: ${currency} ${budget}
Saved so far: ${currency} ${totalSaved} (${percentSaved}% done)
Still needed: ${currency} ${needed}
Months left: ${monthsLeft}
Must save per month: ${currency} ${perMonth}
Must save per week: ${currency} ${perWeek}
Saving since: ${startDate}
Event date: ${eventDate}
${answersText}

Write 4–5 sentences of warm, specific savings advice:
1. Tell them clearly if they are on track or behind, using the exact numbers above.
2. Tell them exactly how much to save per month and per week.
3. Based on their income and expenses (if given), tell them what percentage of their income they need to save and whether that is realistic.
4. Recommend a specific savings method that suits them — M-PESA Goal (Lock Savings), Sacco, chama, bank fixed deposit, or splitting between multiple methods.
5. Give one concrete action they can take this week to move closer to their goal.

Write in plain English. No markdown, no bullet points, no lists. Just flowing sentences.`;

  try {
    const result = await model.generateContent(prompt);
    const advice = result.response.text().trim();
    return NextResponse.json({ advice });
  } catch (err) {
    console.error('[ai-savings] error:', err);
    return NextResponse.json({
      advice: `You have saved ${currency} ${totalSaved} of your ${currency} ${budget} goal with ${monthsLeft} months to go. You need to save ${currency} ${perMonth} per month (about ${currency} ${perWeek} per week) to stay on track. Consider locking your savings in an M-PESA Goal account or a Sacco so you are not tempted to spend them early. Set up a standing order on your bank app to move money on payday automatically — this removes the temptation to skip a month.`,
    });
  }
}
