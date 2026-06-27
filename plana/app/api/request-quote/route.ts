import { NextRequest, NextResponse } from 'next/server';
import AfricasTalking from 'africastalking';

export async function POST(req: NextRequest) {
  const { providerPhone, providerName, planType, location, budget, currency, category } = await req.json();

  const username = process.env.AT_USERNAME!;
  const apiKey = process.env.AT_API_KEY!;

  console.log('[request-quote] AT credentials:', { username, apiKeyPrefix: apiKey?.slice(0, 10) });

  const at = AfricasTalking({ username, apiKey });

  const ref = `PLANA-${Date.now()}`;
  const message =
    `Hi ${providerName}, a Plana user needs a quote.\n` +
    `Event: ${planType} in ${location}\n` +
    `Category: ${category}\n` +
    `Budget: ${currency} ${budget}\n` +
    `Ref: ${ref}\n` +
    `Reply to this number to connect with the client.`;

  try {
    const result = await at.SMS.send({
      to: [providerPhone],
      message,
      from: undefined,
    });
    console.log('[request-quote] AT response:', JSON.stringify(result));
    return NextResponse.json({ success: true, ref });
  } catch (err) {
    console.error('[request-quote] AT SMS error:', (err as Error).message);
    return NextResponse.json({ success: false, error: 'Failed to send SMS' }, { status: 500 });
  }
}
