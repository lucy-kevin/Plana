import { NextRequest, NextResponse } from 'next/server';
import AfricasTalking from 'africastalking';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { providerPhone, providerName, providerId, clientPhone, planType, location, budget, currency, category } = await req.json();

  const at = AfricasTalking({
    username: process.env.AT_USERNAME!,
    apiKey: process.env.AT_API_KEY!,
  });

  const ref = `PLANA-${Date.now()}`;
  const budgetLine = budget ? `Budget: ${currency ?? 'UGX'} ${Number(budget).toLocaleString()}` : '';
  const locationLine = location ? ` in ${location}` : '';
  const contactLine = clientPhone
    ? `Contact the client: ${clientPhone}`
    : 'The client did not leave a number. They will contact you directly.';

  const message = [
    `Hi ${providerName}, a Plana user needs a quote.`,
    `Event: ${planType || 'Event'}${locationLine}`,
    `Category: ${category}`,
    budgetLine,
    `Ref: ${ref}`,
    contactLine,
  ].filter(Boolean).join('\n');

  try {
    const result = await at.SMS.send({ to: [providerPhone], message });
    console.log('[request-quote] AT response:', JSON.stringify(result));

    // Save to DB so provider can see it on their dashboard
    await supabaseAdmin.from('quote_requests').insert({
      ref,
      provider_id: providerId ?? null,
      provider_phone: providerPhone,
      client_phone: clientPhone ?? null,
      plan_type: planType,
      location,
      budget: budget ? Number(budget) : null,
      currency: currency ?? 'UGX',
      category,
      status: 'pending',
    });

    return NextResponse.json({ success: true, ref });
  } catch (err) {
    console.error('[request-quote] error:', (err as Error).message);
    return NextResponse.json({ success: false, error: 'Failed to send quote request' }, { status: 500 });
  }
}
