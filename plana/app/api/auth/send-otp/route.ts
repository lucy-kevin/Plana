import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import AfricasTalking from 'africastalking';

function getAT() {
  return AfricasTalking({
    username: process.env.AT_USERNAME!,
    apiKey: process.env.AT_API_KEY!,
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in Supabase — delete any existing OTP for this phone first
  await supabaseAdmin.from('otps').delete().eq('phone', phone);

  const { error: insertError } = await supabaseAdmin.from('otps').insert({
    phone,
    code: otp,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    console.error('[send-otp] DB error:', insertError.message);
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
  }

  // Send OTP via Africa's Talking SMS
  try {
    const at = getAT();
    await at.SMS.send({
      to: [phone],
      message: `Your Plana verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: undefined,
    });
    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('[send-otp] SMS error:', (err as Error).message);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
