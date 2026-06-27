import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/plans — get all plans for a user (by phone)
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone');
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data });
}

// POST /api/plans — create a new plan
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, type, location, budget, currency, guestCount, eventDate, startDate, breakdown } = body;

  if (!phone || !type || !budget) {
    return NextResponse.json({ error: 'phone, type and budget are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('plans')
    .insert({
      phone,
      type,
      location,
      budget: Number(budget),
      currency: currency ?? 'UGX',
      guest_count: guestCount ?? null,
      event_date: eventDate ?? null,
      start_date: startDate ?? new Date().toISOString().split('T')[0],
      total_saved: 0,
      breakdown: breakdown ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('[plans] insert error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plan: data }, { status: 201 });
}
