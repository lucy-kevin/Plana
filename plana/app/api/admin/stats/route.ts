import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const [users, plans, providers, pending] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('plans').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('providers').select('id', { count: 'exact', head: true }).eq('verified', true),
    supabaseAdmin.from('providers').select('id', { count: 'exact', head: true }).eq('verified', false),
  ]);

  return NextResponse.json({
    users: users.count ?? 0,
    plans: plans.count ?? 0,
    providers: providers.count ?? 0,
    pending: pending.count ?? 0,
  });
}
