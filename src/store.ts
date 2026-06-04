import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEPOT, seedReports } from './domain/seed'
import type { Habits } from './domain/eco'
import type { Report, ReportStatus, Role } from './domain/types'

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
}

interface State {
  accounts: Account[]
  authId: string | null
  reports: Report[]
  redemptions: Redemption[]
  online: boolean
  habits: Habits
  notif: NotifPrefs
  theme: Theme
  aiTip: AiTip | null

  setAiTip: (t: AiTip | null) => void
  signup: (data: Omit<Account, 'id' | 'password' | 'ecoPoints'> & { password: string }) => AuthResult
  login: (email: string, password: string) => AuthResult
  logout: () => void
  redeem: (reward: { id: string; label: string; cost: number }) => AuthResult

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
      redemptions: [],
      online: true,
      habits: {},
      notif: { enabled: false, hour: 8 },
      theme: 'light',
      aiTip: null,

      setAiTip: (aiTip) => set({ aiTip }),

      signup: (data) => {
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
          ecoPoints: 0,
        }
        set((s) => ({ accounts: [...s.accounts, account], authId: account.id }))
        return { ok: true }
      },

      login: (email, password) => {
        const e = email.trim().toLowerCase()
        const acc = get().accounts.find((a) => a.email === e)
        if (!acc || acc.password !== hashPassword(password))
          return { ok: false, error: 'Email ou mot de passe incorrect.' }
        set({ authId: acc.id })
        return { ok: true }
      },

      logout: () => set({ authId: null }),

      redeem: (reward) => {
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
        }
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === me.id ? { ...a, ecoPoints: a.ecoPoints - reward.cost } : a,
          ),
          redemptions: [redemption, ...s.redemptions],
        }))
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
        return id
      },

      setStatus: (id, status, afterPhoto) =>
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
        })),

      syncPending: () =>
        set((s) => ({
          reports: s.reports.map((r) => (r.sync === 'pending' ? { ...r, sync: 'synced' } : r)),
        })),

      reset: () =>
        set({
          accounts: seedAccounts,
          authId: null,
          reports: seedReports,
          redemptions: [],
          online: true,
          habits: {},
          notif: { enabled: false, hour: 8 },
          aiTip: null,
        }),
    }),
    { name: 'mboaclean-store', version: 2 },
  ),
)

export function currentAccount(s: State): Account | undefined {
  return s.accounts.find((a) => a.id === s.authId)
}

/** Compte connecté (ou undefined si déconnecté). */
export const useAuth = () => useStore((s) => s.accounts.find((a) => a.id === s.authId))

export { DEPOT }
