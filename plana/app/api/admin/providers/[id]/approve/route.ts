import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import AfricasTalking from 'africastalking';

const at = AfricasTalking({
  username: process.env.AT_USERNAME!,
  apiKey: process.env.AT_API_KEY!,
});
const sms = at.SMS;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the provider first to get their phone and name
  const { data: provider, error: fetchError } = await supabaseAdmin
    .from('providers')
    .select('id, phone, name, verified')
    .eq('id', id)
    .single();

  if (fetchError || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  if (provider.verified) {
    return NextResponse.json({ error: 'Provider is already approved' }, { status: 400 });
  }

  // Set verified = true
  const { error: updateError } = await supabaseAdmin
    .from('providers')
    .update({ verified: true })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send approval SMS
  if (provider.phone) {
    try {
      await sms.send({
        to: [provider.phone],
        message: `Hi ${provider.name}, your Plana provider profile is now live. Clients in your area can find you and send quote requests directly to this number. Welcome to Plana!`,
      });
    } catch (smsErr) {
      console.error('[approve] SMS failed:', smsErr);
      // Don't fail the whole request if SMS fails
    }
  }

  return NextResponse.json({ success: true, message: `${provider.name} approved and notified by SMS.` });
}
