import { useMemo, useState } from 'react'
import { Banknote, Check, MapPin, Wallet } from 'lucide-react'
import { useAuth, useStore } from '../store'
import { WASTE_LABEL } from '../domain/types'
import { PageTitle, Stat, formatFCFA, timeAgo } from '../ui/ui'
import { PickupPill } from './PickupRequestPage'

export function PickupsPage() {
  const me = useAuth()!
  const pickups = useStore((s) => s.pickups)
  const acceptPickup = useStore((s) => s.acceptPickup)
  const completePickup = useStore((s) => s.completePickup)
  const [tab, setTab] = useState<'ouvertes' | 'courses'>('ouvertes')

  const open = useMemo(
    () =>
      pickups
        .filter((p) => p.status === 'ouverte' && p.ville === me.ville)
        .sort((a, b) => b.createdAt - a.createdAt),
    [pickups, me.ville],
  )
  const mine = useMemo(
    () => pickups.filter((p) => p.collectorId === me.id).sort((a, b) => b.updatedAt - a.updatedAt),
    [pickups, me.id],
  )
  const earnings = mine.filter((p) => p.status === 'terminee').reduce((s, p) => s + p.fee, 0)
  const potential = open.reduce((s, p) => s + p.fee, 0)
  const now = Date.now()

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Ramassage à domicile" subtitle={`Demandes des ménages à ${me.ville}`} />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Stat label="Demandes ouvertes" value={String(open.length)} hint={`${formatFCFA(potential)} à gagner`} color="#e8552d" />
        <Stat label="Mes gains" value={formatFCFA(earnings)} hint={`${mine.filter((p) => p.status === 'terminee').length} courses`} />
      </div>

      <div className="mb-4 flex gap-2">
        <TabBtn active={tab === 'ouvertes'} onClick={() => setTab('ouvertes')}>Ouvertes ({open.length})</TabBtn>
        <TabBtn active={tab === 'courses'} onClick={() => setTab('courses')}>Mes courses ({mine.length})</TabBtn>
      </div>

      {tab === 'ouvertes' ? (
        <div className="space-y-2">
          {open.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line bg-card p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{WASTE_LABEL[p.wasteType].emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{p.householdName}</div>
                  <div className="flex items-center gap-1 text-xs text-faint">
                    <MapPin size={11} /> {p.quartier} · {timeAgo(p.createdAt, now)}
                  </div>
                </div>
                <span className="rounded-lg bg-brand-soft px-2.5 py-1 text-sm font-bold text-brand">
                  {formatFCFA(p.fee)}
                </span>
              </div>
              {p.note && <p className="mt-1 text-xs text-muted">« {p.note} »</p>}
              <button
                onClick={() => acceptPickup(p.id)}
                className="mt-2 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                Accepter la course
              </button>
            </div>
          ))}
          {!open.length && (
            <p className="rounded-xl bg-card p-6 text-center text-sm text-faint ring-1 ring-line">
              Aucune demande ouverte à {me.ville} pour l'instant. Reviens plus tard 🛺
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {mine.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line bg-card p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{WASTE_LABEL[p.wasteType].emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{p.householdName} · {p.quartier}</div>
                  <div className="text-xs text-faint">{formatFCFA(p.fee)}</div>
                </div>
                <PickupPill status={p.status} />
              </div>

              {p.status === 'acceptee' ? (
                <>
                  <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <Wallet size={13} /> À encaisser en direct : <b>{formatFCFA(p.fee)}</b> (Mobile Money / espèces)
                  </div>
                  <button
                    onClick={() => completePickup(p.id)}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white"
                    style={{ background: '#1B7A43' }}
                  >
                    <Check size={16} /> Ramassage effectué & payé
                  </button>
                </>
              ) : (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-brand">
                  <Check size={13} /> Course terminée — {formatFCFA(p.fee)} encaissés
                </div>
              )}
            </div>
          ))}
          {!mine.length && (
            <p className="rounded-xl bg-card p-6 text-center text-sm text-faint ring-1 ring-line">
              Tu n'as pas encore de course. Accepte une demande dans l'onglet « Ouvertes ».
            </p>
          )}
        </div>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-faint">
        <Banknote size={13} /> Le ménage te paie directement. MboaClean ne prend pas de commission (démo).
      </p>
    </div>
  )
}

function TabBtn({
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
      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
        active ? 'bg-brand text-white' : 'bg-card text-muted ring-1 ring-line'
      }`}
    >
      {children}
    </button>
  )
}
