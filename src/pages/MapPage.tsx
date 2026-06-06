import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Lightbulb, MapPin, PlusCircle } from 'lucide-react'
import { useAuth, useStore } from '../store'
import { MapView } from '../components/MapView'
import { SearchBox, type SearchItem } from '../components/SearchBox'
import { useDailyTip } from '../hooks/useDailyAITip'
import { CITIES, CITY_NAMES, cityCenter } from '../domain/cities'
import type { ReportStatus } from '../domain/types'

interface PlaceItem extends SearchItem {
  kind: 'ville' | 'quartier'
  ville: string
  center: [number, number]
}

export function MapPage() {
  const reports = useStore((s) => s.reports)
  const me = useAuth()
  // Un décideur ne voit que sa ville.
  const lockedCity = me?.role === 'decideur' ? me.ville : null

  const [heat, setHeat] = useState(false)
  const [ville, setVille] = useState<string>(lockedCity ?? 'toutes')
  const [status, setStatus] = useState<ReportStatus | 'tous'>('tous')
  const [focus, setFocus] = useState<{ center: [number, number]; zoom: number } | null>(null)

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (ville === 'toutes' || r.ville === ville) && (status === 'tous' || r.status === status),
      ),
    [reports, ville, status],
  )

  // index de recherche : villes + quartiers (centre = moyenne des signalements)
  const places = useMemo<PlaceItem[]>(() => {
    const cities: PlaceItem[] = CITIES.filter((c) => !lockedCity || c.name === lockedCity).map(
      (c) => ({ id: `v:${c.name}`, label: c.name, sub: 'Ville', icon: '🏙️', kind: 'ville', ville: c.name, center: c.center }),
    )
    const acc = new Map<string, { ville: string; quartier: string; lat: number; lng: number; n: number }>()
    for (const r of reports) {
      if (lockedCity && r.ville !== lockedCity) continue
      const k = `${r.ville}/${r.quartier}`
      const e = acc.get(k) ?? { ville: r.ville, quartier: r.quartier, lat: 0, lng: 0, n: 0 }
      e.lat += r.lat
      e.lng += r.lng
      e.n++
      acc.set(k, e)
    }
    const quartiers: PlaceItem[] = [...acc.values()].map((e) => ({
      id: `q:${e.ville}/${e.quartier}`,
      label: e.quartier,
      sub: e.ville,
      icon: '📍',
      kind: 'quartier',
      ville: e.ville,
      center: [e.lat / e.n, e.lng / e.n],
    }))
    return [...cities, ...quartiers]
  }, [reports, lockedCity])

  const onSearch = (item: PlaceItem) => {
    if (!lockedCity) setVille(item.ville)
    setFocus({ center: item.center, zoom: item.kind === 'ville' ? 13 : 15 })
  }

  const mapCenter = focus?.center ?? (ville === 'toutes' ? undefined : cityCenter(ville))
  const mapZoom = focus?.zoom ?? (ville === 'toutes' ? 6 : 13)
  const mapKey = `${ville}|${focus ? focus.center.join(',') + focus.zoom : ''}`

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

      {/* recherche ville / quartier */}
      <div className="mb-3">
        <SearchBox
          items={places}
          onSelect={onSearch}
          placeholder={lockedCity ? `Rechercher un quartier à ${lockedCity}…` : 'Rechercher une ville ou un quartier…'}
        />
      </div>

      {/* filtres */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {lockedCity ? (
          <span className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand">
            🏙️ {lockedCity}
          </span>
        ) : (
          <select
            value={ville}
            onChange={(e) => {
              setVille(e.target.value)
              setFocus(null)
            }}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-sm font-medium text-muted"
          >
            <option value="toutes">Toutes les villes</option>
            {CITY_NAMES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}
        <span className="mx-1 w-px self-stretch bg-line" />
        {(['tous', 'signale', 'en_cours', 'resolu'] as const).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {s === 'tous' ? 'Tous' : s === 'signale' ? 'Signalés' : s === 'en_cours' ? 'En cours' : 'Résolus'}
          </Chip>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line" style={{ height: '64vh' }}>
        <MapView
          key={mapKey}
          reports={filtered}
          showHeat={heat}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      {me?.role === 'citoyen' && (
        <Link
          to="/signaler"
          className="mt-4 hidden items-center justify-center gap-2 rounded-xl bg-[#e8552d] px-4 py-3 font-bold text-white hover:brightness-95 md:flex"
        >
          <PlusCircle size={20} /> Signaler un dépôt
        </Link>
      )}

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
