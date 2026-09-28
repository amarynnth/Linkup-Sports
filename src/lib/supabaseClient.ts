import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (see
 * .env.example). Until then the app runs entirely in local demo mode —
 * no setup required, but sessions only exist on this device.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null;
