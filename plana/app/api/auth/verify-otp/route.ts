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
    // Try to create Supabase Auth user (may already exist if they used USSD)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      phone,
      phone_confirm: true,
      user_metadata: { name: name ?? phone },
    });

    let userId: string;

    if (authError) {
      // Auth user may already exist — try to find them by phone
      const { data: { users: existingAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();
      const found = existingAuthUsers?.find(u => u.phone === phone);
      if (!found) {
        console.error('[verify-otp] auth error:', authError.message);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }
      userId = found.id;
    } else {
      userId = authData.user.id;
    }

    // Upsert user profile (handles the case where USSD created a phone-only record)
    const { data: newUser, error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({ id: userId, phone, name: name ?? null }, { onConflict: 'phone' })
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
