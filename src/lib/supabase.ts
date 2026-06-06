import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Supabase est-il configuré ? Sinon l'app fonctionne en mode local (démo). */
export function isSupabaseConfigured(): boolean {
  return !!URL && !!KEY
}

/** Client Supabase (null si non configuré → repli local). */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(URL!, KEY!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
