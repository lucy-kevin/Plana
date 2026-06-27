import { NextRequest, NextResponse } from 'next/server';
import AfricasTalking from 'africastalking';

export async function POST(req: NextRequest) {
  const { userPhone, category, percent, currency, remaining } = await req.json();

  const username = process.env.AT_USERNAME!;
  const apiKey = process.env.AT_API_KEY!;

  const at = AfricasTalking({ username, apiKey });

  const message =
    `Plana Budget Alert: Your ${category} budget is at ${percent}%. ` +
    `You have ${currency} ${remaining} remaining. ` +
    `Log in at plana.vercel.app to review your plan.`;

  try {
    const result = await at.SMS.send({
      to: [userPhone],
      message,
      from: undefined,
    });
    console.log('[budget-alert] AT response:', JSON.stringify(result));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[budget-alert] AT SMS error:', (err as Error).message);
    return NextResponse.json({ success: false, error: 'Failed to send alert' }, { status: 500 });
  }
}
