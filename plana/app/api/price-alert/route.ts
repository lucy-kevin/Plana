import { model } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';
import AfricasTalking from 'africastalking';

export async function POST(req: NextRequest) {
  const {
    userPhone,
    category,
    location,
    eventDate,
    currency,
    budget,
    // Optional — pass these when a real spike is confirmed
    previousPrice,
    currentPrice,
    spikePercent,
  } = await req.json();

  const spikeConfirmed = previousPrice && currentPrice && spikePercent;

  let warning = '';

  try {
    const prompt = spikeConfirmed
      ? `You are a Plana budget advisor. Write 1 urgent SMS sentence (under 140 chars, no markdown) telling the user that ${category} prices in ${location} have just risen by ${spikePercent}% — from ${currency} ${previousPrice} to ${currency} ${currentPrice}. Their event is on ${eventDate} and their budget is ${currency} ${budget}. Tell them whether their budget still covers it and urge them to act now.`
      : `You are a local event planning advisor in Africa. Write 1 SMS-friendly warning sentence (under 140 chars, no markdown) about a real price spike or availability risk for ${category} in ${location} around ${eventDate}. Mention the cause and tell them to book now.`;

    const result = await model.generateContent(prompt);
    warning = result.response.text().trim().slice(0, 140);
  } catch {
    if (spikeConfirmed) {
      const stillCovers = Number(currentPrice) <= Number(budget);
      warning = `${category} prices in ${location} just jumped ${spikePercent}% to ${currency} ${currentPrice}. Your budget ${stillCovers ? 'still covers this — book now before it rises further' : 'no longer covers this — review your plan now'}.`;
    } else {
      warning = `Prices for ${category} in ${location} are rising ahead of your event. Book now to lock in current rates.`;
    }
  }

  const message = `Plana Alert: ${warning} Visit plana.vercel.app to review.`;

  try {
    const at = AfricasTalking({
      username: process.env.AT_USERNAME!,
      apiKey: process.env.AT_API_KEY!,
    });
    await at.SMS.send({ to: [userPhone], message, from: undefined });
    console.log('[price-alert] sent:', message);
    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('[price-alert] SMS error:', (err as Error).message);
    return NextResponse.json({ success: false, error: 'Failed to send alert' }, { status: 500 });
  }
}
