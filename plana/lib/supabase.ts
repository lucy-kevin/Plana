import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// For client-side / anon operations
export const supabase = createClient(url, anon);

// For server-side operations that bypass RLS (auth, admin tasks)
export const supabaseAdmin = createClient(url, service);
