import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, CloudOff, MapPin, Navigation, User } from 'lucide-react'
import { useAuth, useStore } from '../store'
import { depotFor } from '../domain/cities'
import { MapView } from '../components/MapView'
import { compressImage } from '../lib/photo'
import { distanceM, urgency } from '../domain/engine'
import {
  bestInterventionWindow,
  fmtHour,
  travelMinutes,
} from '../domain/congestion'
import {
  STATUS_LABEL,
  VOLUME_LABEL,
  WASTE_LABEL,
  ZONE_LABEL,
  type ReportStatus,
} from '../domain/types'
import { StatusPill, UrgencyPill } from '../ui/ui'

export function ReportDetailPage() {
  const { id = '' } = useParams()
  const reports = useStore((s) => s.reports)
  const role = useAuth()?.role
  const setStatus = useStore((s) => s.setStatus)
  const afterRef = useRef<HTMLInputElement>(null)

  const report = reports.find((r) => r.id === id)
  if (!report) return <p className="text-faint">Signalement introuvable.</p>

  const u = urgency(report, reports)
  const win = bestInterventionWindow(report.zone)
  const accessKm = distanceM(depotFor(report.ville), report) / 1000
  const minBest = travelMinutes(accessKm, win.hour, report.zone)
  const minPeak = travelMinutes(accessKm, 8, report.zone)

  const markResolved = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const after = file ? await compressImage(file) : undefined
    setStatus(report.id, 'resolu', after)
  }

  const stepBtn = (target: ReportStatus, label: string) => (
    <button
      onClick={() => (target === 'resolu' ? afterRef.current?.click() : setStatus(report.id, target))}
      className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
      style={{ background: STATUS_LABEL[target].color }}
    >
      {label}
    </button>
  )

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted">
        <ArrowLeft size={16} /> Retour à la carte
      </Link>

      {/* photos avant / après */}
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-line">
        {report.afterPhoto ? (
          <div className="grid grid-cols-2">
            <figure>
              <img src={report.photo} className="aspect-square w-full object-cover" alt="avant" />
              <figcaption className="bg-[#e8552d] py-1 text-center text-xs font-semibold text-white">AVANT</figcaption>
            </figure>
            <figure>
              <img src={report.afterPhoto} className="aspect-square w-full object-cover" alt="après" />
              <figcaption className="bg-[#1b7a43] py-1 text-center text-xs font-semibold text-white">APRÈS</figcaption>
            </figure>
          </div>
        ) : report.photo ? (
          <img src={report.photo} className="aspect-[4/3] w-full object-cover" alt="dépôt" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-hover text-5xl">
            {WASTE_LABEL[report.wasteType].emoji}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill status={report.status} />
        <UrgencyPill level={u.level} score={u.score} />
        {report.sync === 'pending' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <CloudOff size={12} /> en attente de synchro
          </span>
        )}
      </div>

      <h1 className="mt-3 text-xl font-bold text-brand-strong">
        {WASTE_LABEL[report.wasteType].emoji} {WASTE_LABEL[report.wasteType].label}
      </h1>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted">
        <MapPin size={15} /> {report.quartier}, {report.ville}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted">
        <User size={15} /> Signalé par {report.reporterName}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <Info label="Volume">{VOLUME_LABEL[report.volume].emoji} {VOLUME_LABEL[report.volume].label}</Info>
        <Info label="Zone">{ZONE_LABEL[report.zone].emoji} {ZONE_LABEL[report.zone].label}</Info>
        {u.recurrence > 0 && (
          <Info label="Récurrence">⚠️ {u.recurrence} autre(s) signalement(s) à proximité</Info>
        )}
      </div>

      {report.description && (
        <p className="mt-3 rounded-xl bg-card p-3 text-sm text-muted ring-1 ring-line">
          {report.description}
        </p>
      )}

      {/* créneau d'intervention conseillé (sans caméra ni GPS) */}
      <div className="mt-3 rounded-2xl border border-line bg-card p-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
          <Clock size={16} /> Créneau d'intervention conseillé
        </h2>
        <div className="mt-2 flex items-center gap-3">
          <div className="rounded-xl bg-brand-soft px-3 py-2 text-center">
            <div className="text-lg font-extrabold text-brand">
              {fmtHour(win.hour)}–{fmtHour(win.endHour)}
            </div>
            <div className="text-[11px] text-muted">trafic {win.level}</div>
          </div>
          <p className="flex-1 text-sm text-muted">
            Intervenir {win.reason} pour ne pas perturber la circulation.
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-xs text-muted">
          <Navigation size={13} className="text-accent" />
          Accès depuis le dépôt : ~{accessKm.toFixed(1)} km ·
          <b className="text-ink"> {Math.round(minBest)} min</b> au créneau conseillé
          <span className="text-faint">(vs {Math.round(minPeak)} min en heure de pointe)</span>
        </div>
        <p className="mt-1 text-[11px] text-faint">
          Estimation par heures de pointe et points chauds — sans caméra ni GPS, affinée par les signalements.
        </p>
      </div>

      {/* mini-carte */}
      <div className="mt-3 h-44 overflow-hidden rounded-2xl ring-1 ring-line">
        <MapView reports={[report]} center={[report.lat, report.lng]} zoom={15} />
      </div>

      {/* historique */}
      <div className="mt-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Historique</h2>
        <ol className="space-y-2">
          {report.history.map((h, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_LABEL[h.status].color }} />
              <span className="font-medium text-ink">{STATUS_LABEL[h.status].label}</span>
              <span className="text-faint">· {new Date(h.at).toLocaleDateString('fr-FR')}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* actions décideur */}
      {role === 'decideur' && report.status !== 'resolu' && (
        <div className="mt-5 rounded-2xl border border-brand/30 bg-brand-soft/50 p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
            Décision de l'agent
          </div>
          <p className="mb-2 text-xs text-muted">
            Le système a classé la priorité (urgence {u.score}/100). À toi de décider de l'intervention
            <b> en regardant la photo</b>, puis de planifier au créneau conseillé ({fmtHour(win.hour)}–{fmtHour(win.endHour)}).
          </p>
          <div className="flex gap-2">
            {report.status === 'signale' && stepBtn('en_cours', 'Valider & planifier')}
            {stepBtn('resolu', 'Marquer « résolu » + photo')}
          </div>
          <input ref={afterRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={markResolved} />
        </div>
      )}
    </div>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-2.5 ring-1 ring-line">
      <div className="text-[11px] font-medium text-faint">{label}</div>
      <div className="text-ink">{children}</div>
    </div>
  )
}
