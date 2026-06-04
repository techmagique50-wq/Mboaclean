import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Lightbulb, MapPin, PlusCircle } from 'lucide-react'
import { useStore } from '../store'
import { MapView } from '../components/MapView'
import { useDailyTip } from '../hooks/useDailyAITip'
import { CITY_NAMES, cityCenter } from '../domain/cities'
import type { ReportStatus } from '../domain/types'

export function MapPage() {
  const reports = useStore((s) => s.reports)
  const [heat, setHeat] = useState(false)
  const [ville, setVille] = useState<string>('toutes')
  const [status, setStatus] = useState<ReportStatus | 'tous'>('tous')

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (ville === 'toutes' || r.ville === ville) && (status === 'tous' || r.status === status),
      ),
    [reports, ville, status],
  )

  const active = reports.filter((r) => r.status !== 'resolu').length
  const tip = useDailyTip()

  return (
    <div>
      <Link
        to="/conseils"
        className="mb-3 flex items-start gap-2 rounded-2xl border border-[#1b7a43]/20 bg-brand-soft p-3 text-sm"
      >
        <Lightbulb size={18} className="mt-0.5 shrink-0 text-brand" />
        <span>
          <b className="text-brand-strong">Conseil du jour — {tip.title}.</b>{' '}
          <span className="text-muted">{tip.text}</span>
        </span>
      </Link>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-brand-strong">Carte des signalements</h1>
          <p className="text-sm text-muted">
            {active} points actifs · touche un point pour le détail
          </p>
        </div>
        <button
          onClick={() => setHeat((h) => !h)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            heat ? 'bg-[#e8552d] text-white' : 'bg-card text-muted ring-1 ring-line'
          }`}
        >
          <Flame size={16} /> Points noirs
        </button>
      </div>

      {/* filtres */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          className="rounded-full border border-line bg-card px-3 py-1.5 text-sm font-medium text-muted"
        >
          <option value="toutes">Toutes les villes</option>
          {CITY_NAMES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <span className="mx-1 w-px self-stretch bg-line" />
        {(['tous', 'signale', 'en_cours', 'resolu'] as const).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {s === 'tous' ? 'Tous' : s === 'signale' ? 'Signalés' : s === 'en_cours' ? 'En cours' : 'Résolus'}
          </Chip>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line" style={{ height: '64vh' }}>
        <MapView
          key={ville}
          reports={filtered}
          showHeat={heat}
          center={ville === 'toutes' ? undefined : cityCenter(ville)}
          zoom={ville === 'toutes' ? 6 : 13}
        />
      </div>

      <Link
        to="/signaler"
        className="mt-4 hidden items-center justify-center gap-2 rounded-xl bg-[#e8552d] px-4 py-3 font-bold text-white hover:brightness-95 md:flex"
      >
        <PlusCircle size={20} /> Signaler un dépôt
      </Link>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-faint">
        <MapPin size={13} /> Données de démonstration — Yaoundé & Douala.
      </p>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-[#1b7a43] text-white' : 'bg-card text-muted ring-1 ring-line'
      }`}
    >
      {children}
    </button>
  )
}
