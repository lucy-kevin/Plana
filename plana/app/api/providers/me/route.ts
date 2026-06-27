import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/providers/me?phone=+256700000000
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone');
  if (!phone) return NextResponse.json({ error: 'phone is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !data) return NextResponse.json({ error: 'No provider found for this number' }, { status: 404 });
  return NextResponse.json({ provider: data });
}
