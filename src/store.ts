import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEPOT, seedPickups, seedReports } from './domain/seed'
import type { Habits } from './domain/eco'
import type { PickupRequest, Report, ReportStatus, Role } from './domain/types'
import { isSupabaseConfigured } from './lib/supabase'
import * as db from './lib/db'
import { signInRemote, signOutRemote, signUpRemote } from './lib/auth'

export interface NotifPrefs {
  enabled: boolean
  hour: number // heure d'envoi (0–23)
  lastNotified?: string
}

export type Theme = 'light' | 'dark'

/** Conseil du jour généré par l'IA, mis en cache (1×/jour, par habitudes). */
export interface AiTip {
  dateKey: string
  habitsKey: string
  title: string
  text: string
}

/** Compte utilisateur. NB : démo locale — le mot de passe n'est PAS sécurisé
 * (haché localement). Une vraie auth se fait côté serveur (bcrypt + token). */
export interface Account {
  id: string
  name: string
  email: string
  password: string // empreinte locale (démo)
  role: Role
  ville: string
  quartier: string
  organisation?: string // pour les décideurs (commune / HYSACAM)
  phone?: string // numéro Mobile Money (paiement des ramasseurs)
  operator?: string // MTN MoMo / Orange Money
  ecoPoints: number
}

let counter = 1
const newId = (p = 'u') => `${p}${Date.now()}_${counter++}`

/** Empreinte locale très simple (djb2) — démo uniquement, pas de sécurité réelle. */
export function hashPassword(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

const seedAccounts: Account[] = [
  {
    id: 'acc_cit',
    name: 'Cyrille',
    email: 'citoyen@mboa.cm',
    password: hashPassword('demo1234'),
    role: 'citoyen',
    ville: 'Yaoundé',
    quartier: 'Mokolo',
    ecoPoints: 120,
  },
  {
    id: 'acc_dec',
    name: 'Mairie de Yaoundé',
    email: 'decideur@mboa.cm',
    password: hashPassword('demo1234'),
    role: 'decideur',
    ville: 'Yaoundé',
    quartier: '—',
    organisation: 'Commune de Yaoundé',
    ecoPoints: 0,
  },
  {
    id: 'acc_ram',
    name: 'Joseph (ramasseur)',
    email: 'ramasseur@mboa.cm',
    password: hashPassword('demo1234'),
    role: 'ramasseur',
    ville: 'Yaoundé',
    quartier: 'Mokolo',
    phone: '+237 6 99 88 77 66',
    operator: 'MTN MoMo',
    ecoPoints: 0,
  },
]

export interface AuthResult {
  ok: boolean
  error?: string
}

export interface Redemption {
  id: string
  accountId: string
  rewardId: string
  label: string
  cost: number
  at: number
  phone?: string // numéro Mobile Money (crédit / transfert)
  operator?: string // MTN MoMo / Orange Money
}

interface State {
  accounts: Account[]
  authId: string | null
  reports: Report[]
  pickups: PickupRequest[]
  redemptions: Redemption[]
  online: boolean
  habits: Habits
  notif: NotifPrefs
  theme: Theme
  aiTip: AiTip | null

  setAiTip: (t: AiTip | null) => void
  signup: (data: Omit<Account, 'id' | 'password' | 'ecoPoints'> & { password: string }) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
  supabaseMode: boolean
  redeem: (
    reward: { id: string; label: string; cost: number },
    contact?: { phone?: string; operator?: string },
  ) => AuthResult

  setOnline: (v: boolean) => void
  setHabits: (h: Habits) => void
  setNotif: (p: Partial<NotifPrefs>) => void
  toggleTheme: () => void

  addReport: (
    data: Pick<
      Report,
      'lat' | 'lng' | 'ville' | 'quartier' | 'wasteType' | 'volume' | 'zone' | 'description' | 'photo'
    >,
  ) => string
  setStatus: (id: string, status: ReportStatus, afterPhoto?: string) => void
  syncPending: () => void

  // marketplace de ramassage
  createPickup: (
    data: Pick<PickupRequest, 'ville' | 'quartier' | 'lat' | 'lng' | 'wasteType' | 'note' | 'fee'>,
  ) => string
  acceptPickup: (id: string) => void
  completePickup: (id: string) => void
  cancelPickup: (id: string) => void

  reset: () => void
}

function nextTs(reports: Report[]): number {
  const max = reports.reduce((m, r) => Math.max(m, r.updatedAt, r.createdAt), 0)
  return max + 60_000
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      accounts: seedAccounts,
      authId: null,
      reports: seedReports,
      pickups: seedPickups,
      redemptions: [],
      online: true,
      habits: {},
      notif: { enabled: false, hour: 8 },
      theme: 'light',
      aiTip: null,

      setAiTip: (aiTip) => set({ aiTip }),

      supabaseMode: isSupabaseConfigured(),

      signup: async (data) => {
        if (isSupabaseConfigured()) {
          const res = await signUpRemote({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            ville: data.ville,
            quartier: data.quartier,
            organisation: data.organisation,
            phone: data.phone,
            operator: data.operator,
          })
          if (!res.ok || !res.profile) return { ok: false, error: res.error }
          set({ accounts: [res.profile], authId: res.profile.id })
          await get().hydrate()
          return { ok: true }
        }
        const email = data.email.trim().toLowerCase()
        if (!email || !data.password) return { ok: false, error: 'Email et mot de passe requis.' }
        if (get().accounts.some((a) => a.email === email))
          return { ok: false, error: 'Un compte existe déjà avec cet email.' }
        const account: Account = {
          id: newId('acc'),
          name: data.name.trim(),
          email,
          password: hashPassword(data.password),
          role: data.role,
          ville: data.ville,
          quartier: data.quartier,
          organisation: data.organisation,
          phone: data.phone,
          operator: data.operator,
          ecoPoints: 0,
        }
        set((s) => ({ accounts: [...s.accounts, account], authId: account.id }))
        return { ok: true }
      },

      login: async (email, password) => {
        if (isSupabaseConfigured()) {
          const res = await signInRemote(email, password)
          if (!res.ok || !res.profile) return { ok: false, error: res.error }
          set({ accounts: [res.profile], authId: res.profile.id })
          await get().hydrate()
          return { ok: true }
        }
        const e = email.trim().toLowerCase()
        const acc = get().accounts.find((a) => a.email === e)
        if (!acc || acc.password !== hashPassword(password))
          return { ok: false, error: 'Email ou mot de passe incorrect.' }
        set({ authId: acc.id })
        return { ok: true }
      },

      logout: async () => {
        if (isSupabaseConfigured()) await signOutRemote()
        set({ authId: null })
      },

      hydrate: async () => {
        if (!isSupabaseConfigured()) return
        try {
          const me = currentAccount(get())
          const [reports, pickups] = await Promise.all([db.fetchReports(), db.fetchPickups()])
          const redemptions = me ? await db.fetchRedemptions(me.id) : get().redemptions
          set({ reports, pickups, redemptions })
        } catch {
          /* hors-ligne : on garde le cache local */
        }
      },

      redeem: (reward, contact) => {
        const me = currentAccount(get())
        if (!me) return { ok: false, error: 'Non connecté.' }
        if (me.ecoPoints < reward.cost)
          return { ok: false, error: 'Pas assez d\'EcoPoints pour cette récompense.' }
        const redemption: Redemption = {
          id: newId('red'),
          accountId: me.id,
          rewardId: reward.id,
          label: reward.label,
          cost: reward.cost,
          at: Date.now(),
          phone: contact?.phone,
          operator: contact?.operator,
        }
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === me.id ? { ...a, ecoPoints: a.ecoPoints - reward.cost } : a,
          ),
          redemptions: [redemption, ...s.redemptions],
        }))
        if (isSupabaseConfigured()) {
          db.insertRedemption(me.id, reward, contact).catch(() => {})
          db.updateProfile(me.id, { ecoPoints: me.ecoPoints - reward.cost }).catch(() => {})
        }
        return { ok: true }
      },

      setOnline: (online) => set({ online }),
      setHabits: (habits) => set({ habits }),
      setNotif: (p) => set((s) => ({ notif: { ...s.notif, ...p } })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      addReport: (data) => {
        const id = newId('r')
        const ts = nextTs(get().reports)
        const online = get().online
        const me = currentAccount(get())
        const report: Report = {
          id,
          ...data,
          status: 'signale',
          createdAt: ts,
          updatedAt: ts,
          reporterName: me?.name ?? 'Anonyme',
          sync: online ? 'synced' : 'pending',
          history: [{ status: 'signale', at: ts }],
        }
        set((s) => ({
          reports: [report, ...s.reports],
          accounts: s.accounts.map((a) =>
            a.id === s.authId ? { ...a, ecoPoints: a.ecoPoints + 10 } : a,
          ),
        }))
        if (isSupabaseConfigured() && me) {
          db.insertReport(data, me.id, me.name).catch(() => {})
          db.updateProfile(me.id, { ecoPoints: me.ecoPoints + 10 }).catch(() => {})
        }
        return id
      },

      setStatus: (id, status, afterPhoto) => {
        set((s) => ({
          reports: s.reports.map((r) => {
            if (r.id !== id) return r
            const ts = nextTs(s.reports)
            return {
              ...r,
              status,
              afterPhoto: afterPhoto ?? r.afterPhoto,
              updatedAt: ts,
              history: [...r.history, { status, at: ts }],
            }
          }),
        }))
        if (isSupabaseConfigured()) db.updateReportStatus(id, status, afterPhoto).catch(() => {})
      },

      syncPending: () =>
        set((s) => ({
          reports: s.reports.map((r) => (r.sync === 'pending' ? { ...r, sync: 'synced' } : r)),
        })),

      createPickup: (data) => {
        const me = currentAccount(get())
        const id = newId('pk')
        const now = Date.now()
        const pickup: PickupRequest = {
          id,
          householdId: me?.id ?? 'anon',
          householdName: me?.name ?? 'Ménage',
          status: 'ouverte',
          createdAt: now,
          updatedAt: now,
          ...data,
        }
        set((s) => ({ pickups: [pickup, ...s.pickups] }))
        if (isSupabaseConfigured() && me) db.insertPickup(data, me.id, me.name).catch(() => {})
        return id
      },

      acceptPickup: (id) => {
        const me = currentAccount(get())
        set((s) => ({
          pickups: s.pickups.map((p) =>
            p.id === id && p.status === 'ouverte'
              ? {
                  ...p,
                  status: 'acceptee',
                  collectorId: me?.id,
                  collectorName: me?.name,
                  collectorPhone: me?.phone,
                  collectorOperator: me?.operator,
                  updatedAt: Date.now(),
                }
              : p,
          ),
        }))
        if (isSupabaseConfigured() && me) db.acceptPickupDb(id, me.id).catch(() => {})
      },

      completePickup: (id) => {
        if (isSupabaseConfigured()) db.setPickupStatus(id, 'terminee').catch(() => {})
        set((s) => ({
          pickups: s.pickups.map((p) =>
            p.id === id ? { ...p, status: 'terminee', updatedAt: Date.now() } : p,
          ),
        }))
      },

      cancelPickup: (id) => {
        if (isSupabaseConfigured()) db.setPickupStatus(id, 'annulee').catch(() => {})
        set((s) => ({
          pickups: s.pickups.map((p) =>
            p.id === id && p.status === 'ouverte' ? { ...p, status: 'annulee', updatedAt: Date.now() } : p,
          ),
        }))
      },

      reset: () =>
        set({
          accounts: seedAccounts,
          authId: null,
          reports: seedReports,
          pickups: seedPickups,
          redemptions: [],
          online: true,
          habits: {},
          notif: { enabled: false, hour: 8 },
          aiTip: null,
        }),
    }),
    { name: 'mboaclean-store', version: 3 },
  ),
)

export function currentAccount(s: State): Account | undefined {
  return s.accounts.find((a) => a.id === s.authId)
}

/** Compte connecté (ou undefined si déconnecté). */
export const useAuth = () => useStore((s) => s.accounts.find((a) => a.id === s.authId))

export { DEPOT }
