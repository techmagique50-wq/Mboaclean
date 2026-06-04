import { useEffect } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  Map,
  PlusCircle,
  User,
  LayoutDashboard,
  WifiOff,
  Recycle,
  Lightbulb,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import { useAuth, useStore } from './store'
import { useDailyTipNotification } from './hooks/useDailyTipNotification'
import { useDailyAITip } from './hooks/useDailyAITip'

export default function App() {
  const me = useAuth()
  const logout = useStore((s) => s.logout)
  const online = useStore((s) => s.online)
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const pending = useStore((s) => s.reports.filter((r) => r.sync === 'pending').length)
  const loc = useLocation()
  useDailyTipNotification()
  useDailyAITip()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // garde-fou : pas de compte → connexion
  if (!me) return <Navigate to="/login" replace />
  const role = me.role

  const citoyenNav = [
    { to: '/', label: 'Carte', icon: Map, end: true },
    { to: '/conseils', label: 'Conseils', icon: Lightbulb, end: false },
    { to: '/signaler', label: 'Signaler', icon: PlusCircle, end: false },
    { to: '/profil', label: 'Profil', icon: User, end: false },
  ]
  const decideurNav = [
    { to: '/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard, end: false },
    { to: '/', label: 'Carte', icon: Map, end: true },
  ]
  const nav = role === 'citoyen' ? citoyenNav : decideurNav

  const ThemeBtn = ({ className = '' }: { className?: string }) => (
    <button
      onClick={toggleTheme}
      aria-label="Changer de thème"
      className={`grid h-9 w-9 place-items-center rounded-full transition active:scale-90 ${className}`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col bg-bg md:my-4 md:flex-row md:overflow-hidden md:rounded-[1.75rem] md:shadow-xl md:shadow-black/5">
      {/* Header mobile */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-brand px-4 text-white md:hidden">
        <span className="flex items-center gap-2 text-lg font-bold">
          <Recycle size={20} /> MboaClean
        </span>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
            {role === 'citoyen' ? '👤 Citoyen' : '🏛️ Décideur'}
          </span>
          <ThemeBtn className="text-white hover:bg-white/15" />
          <button
            onClick={logout}
            aria-label="Se déconnecter"
            className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15 active:scale-90"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden w-60 flex-col gap-1 border-r border-line bg-card p-4 md:flex">
        <div className="mb-5 px-2">
          <div className="flex items-center gap-2 text-xl font-extrabold text-brand">
            <Recycle size={22} /> MboaClean
          </div>
          <div className="text-xs text-faint">Cameroun propre, piloté par la donnée</div>
        </div>
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                isActive
                  ? 'bg-brand-soft text-brand'
                  : 'text-muted hover:bg-hover hover:text-ink'
              }`
            }
          >
            <n.icon size={18} className="transition group-hover:scale-110" /> {n.label}
          </NavLink>
        ))}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <div className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
            <span className="text-sm text-muted">Thème</span>
            <ThemeBtn className="text-ink hover:bg-hover" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              {role === 'citoyen' ? <User size={18} /> : <LayoutDashboard size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{me.name}</div>
              <div className="truncate text-xs text-faint">
                {role === 'citoyen' ? 'Citoyen' : me.organisation ?? 'Décideur'}
              </div>
            </div>
            <button
              onClick={logout}
              aria-label="Se déconnecter"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-hover hover:text-danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        {!online && (
          <div className="flex items-center justify-center gap-2 bg-danger py-1.5 text-xs font-medium text-white">
            <WifiOff size={14} /> Hors-ligne — tes signalements seront synchronisés au retour du réseau
          </div>
        )}
        {online && pending > 0 && (
          <div className="bg-accent py-1.5 text-center text-xs font-medium text-white">
            Synchronisation de {pending} signalement(s)…
          </div>
        )}
        <main className="flex-1 animate-fade-up p-4 pb-24 md:pb-6" key={loc.pathname}>
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t border-line bg-card/95 backdrop-blur md:hidden">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                isActive ? 'text-brand' : 'text-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 h-1 w-8 rounded-full bg-brand transition-all" />
                )}
                <n.icon size={22} className={isActive ? 'scale-110 transition' : 'transition'} />
                {n.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FAB Signaler (citoyen, mobile) */}
      {role === 'citoyen' && loc.pathname !== '/signaler' && (
        <NavLink
          to="/signaler"
          className="fixed bottom-20 right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-danger px-5 font-bold text-white shadow-lg shadow-danger/30 transition active:scale-95 md:hidden"
        >
          <PlusCircle size={24} /> Signaler
        </NavLink>
      )}
    </div>
  )
}
