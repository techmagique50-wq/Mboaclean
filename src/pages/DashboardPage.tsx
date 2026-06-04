import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Fuel, Leaf, Route, TrendingUp } from 'lucide-react'
import { useStore } from '../store'
import { MapView } from '../components/MapView'
import { planRoute, urgency } from '../domain/engine'
import { departureAdvice, fmtHour } from '../domain/congestion'
import { CITY_NAMES, cityCenter, depotFor } from '../domain/cities'
import { WASTE_LABEL } from '../domain/types'
import { PageTitle, Stat, StatusPill, UrgencyPill, formatFCFA } from '../ui/ui'

export function DashboardPage() {
  const reports = useStore((s) => s.reports)
  const [ville, setVille] = useState<string>('Yaoundé')
  const depot = depotFor(ville)

  const cityReports = useMemo(() => reports.filter((r) => r.ville === ville), [reports, ville])
  const active = cityReports.filter((r) => r.status !== 'resolu')
  const resolved = cityReports.filter((r) => r.status === 'resolu')

  // KPIs
  const resolutionRate = cityReports.length ? Math.round((resolved.length / cityReports.length) * 100) : 0
  const avgDays = useMemo(() => {
    const times = resolved
      .map((r) => {
        const sig = r.history.find((h) => h.status === 'signale')?.at
        const res = r.history.find((h) => h.status === 'resolu')?.at
        return sig && res ? (res - sig) / 86_400_000 : null
      })
      .filter((x): x is number => x != null)
    return times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : '—'
  }, [resolved])

  // priorisation par urgence
  const prioritized = useMemo(
    () =>
      active
        .map((r) => ({ r, u: urgency(r, reports) }))
        .sort((a, b) => b.u.score - a.u.score),
    [active, reports],
  )

  // tournée optimisée
  const plan = useMemo(() => planRoute(active, depot), [active, depot])
  const dep = useMemo(() => departureAdvice(plan.optimizedKm), [plan.optimizedKm])

  const hauts = prioritized.filter((p) => p.u.level === 'haut').length

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle title="Tableau de bord" subtitle={`Pilotage de la collecte — ${ville}`} />
        <select
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          className="rounded-xl border border-line bg-card px-3 py-2 text-sm"
        >
          {CITY_NAMES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Points actifs" value={String(active.length)} hint={`${hauts} en urgence haute`} color="#e8552d" />
        <Stat label="Taux de résolution" value={`${resolutionRate}%`} hint={`${resolved.length} résolus`} />
        <Stat label="Délai moyen" value={`${avgDays} j`} hint="signalé → résolu" color="#0fa3a3" />
        <Stat label="Signalements" value={String(cityReports.length)} hint="au total" color="#0f4d2a" />
      </div>

      {/* Économies (cœur de la proposition de valeur) */}
      <div className="mt-4 rounded-2xl border border-[#1b7a43]/30 bg-gradient-to-br from-brand-soft to-card p-4">
        <h2 className="flex items-center gap-2 font-bold text-brand-strong">
          <Route size={18} /> Tournée optimisée du jour
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Itinéraire « plus proche voisin » depuis le {depot.name}, comparé à une tournée non optimisée.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Mini icon={<Fuel size={18} />} value={`${plan.litersSaved.toFixed(1)} L`} label="carburant économisé" color="#e8552d" />
          <Mini icon={<TrendingUp size={18} />} value={formatFCFA(plan.fcfaSaved)} label="par tournée" color="#1b7a43" />
          <Mini icon={<Leaf size={18} />} value={`${plan.co2SavedKg.toFixed(1)} kg`} label="CO₂ évité" color="#0fa3a3" />
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <span>Distance optimisée : <b>{plan.optimizedKm.toFixed(1)} km</b></span>
          <span className="text-faint">|</span>
          <span>Non optimisée : {plan.naiveKm.toFixed(1)} km</span>
        </div>
        <p className="mt-2 text-xs text-faint">
          Estimation : {`35 L/100km · 840 FCFA/L · 2,64 kg CO₂/L`}. Sur 250 tournées/an ≈{' '}
          <b className="text-brand">{formatFCFA(plan.fcfaSaved * 250)}</b> d'économies annuelles.
        </p>
      </div>

      {/* meilleure heure de départ (sans caméra ni GPS) */}
      <div className="mt-4 rounded-2xl border border-line bg-card p-4">
        <h2 className="flex items-center gap-2 font-bold text-brand-strong">
          <Clock size={18} /> Meilleure heure de départ
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Pour éviter les embouteillages et ne pas perturber la circulation.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-xl bg-brand-soft px-4 py-2 text-center">
            <div className="text-2xl font-extrabold text-brand">{fmtHour(dep.bestHour)}</div>
            <div className="text-[11px] text-muted">départ conseillé</div>
          </div>
          <div className="text-sm text-muted">
            <div>≈ <b className="text-ink">{Math.round(dep.minutesBest)} min</b> de tournée à cette heure</div>
            <div className="text-faint">
              vs {Math.round(dep.minutesPeak)} min à {fmtHour(dep.peakHour)} (pointe) → <b className="text-brand">{Math.round(dep.minutesSaved)} min</b> gagnées
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-faint">
          Estimé par heures de pointe + points chauds (marchés, écoles). Sans caméra ni GPS camion ;
          s'affine avec les signalements citoyens.
        </p>
      </div>

      {/* carte avec tournée */}
      <div className="mt-4 h-72 overflow-hidden rounded-2xl ring-1 ring-line">
        <MapView
          key={ville}
          reports={active}
          route={{ points: plan.ordered, depot }}
          center={cityCenter(ville)}
          zoom={12}
        />
      </div>

      {/* liste priorisée */}
      <h2 className="mb-2 mt-5 text-sm font-semibold text-muted">
        File de priorité ({prioritized.length})
      </h2>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {prioritized.map(({ r, u }, i) => (
          <Link key={r.id} to={`/signalement/${r.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-hover">
            <span className="w-5 text-center text-sm font-bold text-faint">{i + 1}</span>
            <span className="text-xl">{WASTE_LABEL[r.wasteType].emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-ink">{r.quartier}</div>
              <div className="text-xs text-faint">{WASTE_LABEL[r.wasteType].label}</div>
            </div>
            <UrgencyPill level={u.level} score={u.score} />
            <StatusPill status={r.status} />
          </Link>
        ))}
        {!prioritized.length && (
          <p className="p-6 text-center text-sm text-faint">Aucun point actif — tout est propre ! 🎉</p>
        )}
      </div>
    </div>
  )
}

function Mini({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  color: string
}) {
  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-line">
      <div style={{ color }}>{icon}</div>
      <div className="mt-1 text-lg font-extrabold leading-tight" style={{ color }}>{value}</div>
      <div className="text-[11px] text-faint">{label}</div>
    </div>
  )
}
