import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/providers?category=Catering&location=Nairobi
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  const location = req.nextUrl.searchParams.get('location');

  let query = supabaseAdmin.from('providers').select('*').eq('verified', true);
  if (category) query = query.ilike('category', `%${category}%`);
  if (location) query = query.ilike('location', `%${location}%`);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ providers: data });
}

// POST /api/providers — register as a service provider
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, name, category, location, priceMin, priceMax, currency, description, website } = body;

  if (!phone || !name || !category || !location) {
    return NextResponse.json({ error: 'phone, name, category and location are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('providers')
    .insert({
      phone,
      name,
      category,
      location,
      price_min: priceMin ?? null,
      price_max: priceMax ?? null,
      currency: currency ?? 'UGX',
      description: description ?? null,
      website: website ?? null,
      verified: false, // requires admin approval
    })
    .select()
    .single();

  if (error) {
    console.error('[providers] insert error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ provider: data, message: 'Registration received. You will be notified once approved.' }, { status: 201 });
}
