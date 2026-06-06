// ── Authentification Supabase ────────────────────────────────────────────────
// Le profil (table profiles) est créé automatiquement par un trigger à
// l'inscription ; on complète ensuite quartier/organisation/téléphone.

import { supabase } from './supabase'
import { fetchProfile, updateProfile } from './db'
import type { Account } from '../store'

export interface AuthOutcome {
  ok: boolean
  error?: string
  profile?: Account
}

export interface SignupInput {
  name: string
  email: string
  password: string
  role: Account['role']
  ville: string
  quartier?: string
  organisation?: string
  phone?: string
  operator?: string
}

export async function signInRemote(email: string, password: string): Promise<AuthOutcome> {
  if (!supabase) return { ok: false, error: 'Supabase non configuré' }
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error || !data.user) return { ok: false, error: traduire(error?.message) }
  const profile = await fetchProfile(data.user.id)
  return profile ? { ok: true, profile } : { ok: false, error: 'Profil introuvable.' }
}

export async function signUpRemote(input: SignupInput): Promise<AuthOutcome> {
  if (!supabase) return { ok: false, error: 'Supabase non configuré' }
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { name: input.name, role: input.role, ville: input.ville } },
  })
  if (error || !data.user) return { ok: false, error: traduire(error?.message) }

  // le trigger a créé le profil ; on complète les champs additionnels
  const profile = await fetchProfile(data.user.id)
  if (profile) {
    await updateProfile(profile.id, {
      name: input.name,
      quartier: input.quartier,
      organisation: input.organisation,
      phone: input.phone,
      operator: input.operator,
    })
    return {
      ok: true,
      profile: { ...profile, name: input.name, quartier: input.quartier ?? profile.quartier, organisation: input.organisation, phone: input.phone, operator: input.operator },
    }
  }
  return { ok: false, error: "Compte créé mais profil indisponible (confirmation email activée ?)." }
}

export async function signOutRemote(): Promise<void> {
  await supabase?.auth.signOut()
}

/** Profil de la session courante (au démarrage de l'app). */
export async function currentProfile(): Promise<Account | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user) return null
  return fetchProfile(user.id)
}

function traduire(msg?: string): string {
  if (!msg) return 'Erreur'
  if (/Invalid login/i.test(msg)) return 'Email ou mot de passe incorrect.'
  if (/already registered|already exists/i.test(msg)) return 'Un compte existe déjà avec cet email.'
  if (/Email not confirmed/i.test(msg)) return 'Email non confirmé. Désactive la confirmation email dans Supabase (démo).'
  return msg
}
