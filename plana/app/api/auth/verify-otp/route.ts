import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { phone, code, name } = await req.json();

  if (!phone || !code) {
    return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
  }

  // Look up OTP
  const { data: otpRow, error: otpError } = await supabaseAdmin
    .from('otps')
    .select('*')
    .eq('phone', phone)
    .eq('code', code)
    .eq('used', false)
    .single();

  if (otpError || !otpRow) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
  }

  // Check expiry
  if (new Date(otpRow.expires_at) < new Date()) {
    return NextResponse.json({ error: 'OTP has expired. Request a new one.' }, { status: 401 });
  }

  // Mark OTP as used
  await supabaseAdmin.from('otps').update({ used: true }).eq('id', otpRow.id);

  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  let user = existingUser;

  if (!user) {
    // Create new user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      phone,
      phone_confirm: true,
      user_metadata: { name: name ?? phone },
    });

    if (authError) {
      console.error('[verify-otp] auth error:', authError.message);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Save user profile
    const { data: newUser, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({ id: authData.user.id, phone, name: name ?? null })
      .select()
      .single();

    if (profileError) {
      console.error('[verify-otp] profile error:', profileError.message);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    user = newUser;
  }

  // Generate a session token
  const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: `${phone.replace('+', '')}@plana.app`,
  });

  // Use a signed token approach — return user info and let frontend manage session
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
    },
    isNewUser: !existingUser,
  });
}
