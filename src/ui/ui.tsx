import type { ReportStatus } from '../domain/types'
import { STATUS_LABEL } from '../domain/types'
import { URGENCY_COLOR, type UrgencyLevel } from '../domain/engine'

export function formatFCFA(n: number): string {
  return Math.round(n).toLocaleString('fr-FR') + ' FCFA'
}

export function timeAgo(ts: number, now: number): string {
  const diff = Math.max(0, now - ts)
  const m = Math.round(diff / 60_000)
  if (m < 60) return `il y a ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.round(h / 24)
  return `il y a ${d} j`
}

export function StatusPill({ status }: { status: ReportStatus }) {
  const s = STATUS_LABEL[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${s.color}1a`, color: s.color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  bas: 'Faible',
  moyen: 'Moyenne',
  haut: 'Haute',
}

export function UrgencyPill({ level, score }: { level: UrgencyLevel; score?: number }) {
  const c = URGENCY_COLOR[level]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${c}1a`, color: c }}
    >
      Urgence {URGENCY_LABEL[level]}
      {score != null && <span className="opacity-70">· {score}</span>}
    </span>
  )
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-strong">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
  )
}

export function Stat({
  label,
  value,
  hint,
  color = '#1b7a43',
}: {
  label: string
  value: string
  hint?: string
  color?: string
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 transition hover:shadow-md hover:shadow-black/5">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color }}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-faint">{hint}</div>}
    </div>
  )
}
