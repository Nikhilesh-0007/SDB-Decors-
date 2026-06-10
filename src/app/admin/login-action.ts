'use server';

import { createClient } from '@supabase/supabase-js';

export async function verifyAdminCredentials(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    return { success: false, error: 'Database configuration missing.' };
  }

  // Initialize an admin client with service role key to bypass RLS safely
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('email, password')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Direct plain-text comparison as requested
    if (data.password === password) {
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password.' };
  } catch (err: any) {
    console.error('Admin login check error:', err);
    return { success: false, error: 'An unexpected connection error occurred.' };
  }
}
