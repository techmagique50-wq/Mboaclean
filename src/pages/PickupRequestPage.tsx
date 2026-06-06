import { useMemo, useState } from 'react'
import { Banknote, MapPin, Phone, Send, Trash2 } from 'lucide-react'
import { useAuth, useStore } from '../store'
import { cityCenter } from '../domain/cities'
import {
  PICKUP_STATUS_LABEL,
  WASTE_LABEL,
  type PickupStatus,
  type WasteType,
} from '../domain/types'
import { PageTitle, formatFCFA } from '../ui/ui'

const FEE_PRESETS = [300, 500, 1000, 2000]

export function PickupRequestPage() {
  const me = useAuth()!
  const pickups = useStore((s) => s.pickups)
  const createPickup = useStore((s) => s.createPickup)
  const cancelPickup = useStore((s) => s.cancelPickup)

  const [quartier, setQuartier] = useState(me.quartier !== '—' ? me.quartier : '')
  const [wasteType, setWasteType] = useState<WasteType>('menager')
  const [fee, setFee] = useState(500)
  const [note, setNote] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number }>()
  const [geo, setGeo] = useState<'idle' | 'ok' | 'approx'>('idle')

  const mine = useMemo(
    () => pickups.filter((p) => p.householdId === me.id).sort((a, b) => b.createdAt - a.createdAt),
    [pickups, me.id],
  )

  const locate = () => {
    const fallback = () => {
      const [lat, lng] = cityCenter(me.ville)
      setCoords({ lat: lat + (Math.random() - 0.5) * 0.03, lng: lng + (Math.random() - 0.5) * 0.03 })
      setGeo('approx')
    }
    if (!navigator.geolocation) return fallback()
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude })
        setGeo('ok')
      },
      fallback,
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const submit = () => {
    const c = coords ?? (() => {
      const [lat, lng] = cityCenter(me.ville)
      return { lat, lng }
    })()
    createPickup({
      ville: me.ville,
      quartier: quartier.trim() || 'Non précisé',
      lat: c.lat,
      lng: c.lng,
      wasteType,
      note: note.trim() || undefined,
      fee,
    })
    setNote('')
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Demander un ramassage" subtitle="Un ramasseur près de chez toi vient enlever tes déchets — tu le paies directement." />

      {/* formulaire */}
      <div className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <button
          onClick={locate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white"
        >
          <MapPin size={16} /> {coords ? 'Position enregistrée' : 'Ma position'}
        </button>
        {coords && (
          <p className="text-center text-xs text-muted">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} {geo === 'approx' && '(approximative)'}
          </p>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Quartier</span>
          <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="ex. Mokolo" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
        </label>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Type de déchet</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(WASTE_LABEL) as WasteType[]).map((k) => (
              <button
                key={k}
                onClick={() => setWasteType(k)}
                className={`rounded-xl border px-2.5 py-1.5 text-sm ${
                  wasteType === k ? 'border-brand bg-brand-soft text-brand' : 'border-line text-muted'
                }`}
              >
                {WASTE_LABEL[k].emoji} {WASTE_LABEL[k].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Montant proposé (FCFA)</span>
          <div className="flex flex-wrap items-center gap-2">
            {FEE_PRESETS.map((f) => (
              <button
                key={f}
                onClick={() => setFee(f)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${
                  fee === f ? 'border-brand bg-brand-soft text-brand' : 'border-line text-muted'
                }`}
              >
                {f}
              </button>
            ))}
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(Math.max(0, Number(e.target.value)))}
              className="w-24 rounded-xl border border-line px-3 py-1.5 text-sm"
            />
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Note (optionnel)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex. 2 sacs devant le portail" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
        </label>

        <button
          onClick={submit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-white transition active:scale-[0.98]"
        >
          <Send size={18} /> Publier la demande ({formatFCFA(fee)})
        </button>
        <p className="text-center text-[11px] text-faint">
          Le paiement se fait <b>en direct au ramasseur</b> (Mobile Money) une fois le ramassage effectué.
        </p>
      </div>

      {/* mes demandes */}
      <h2 className="mb-2 mt-5 text-sm font-semibold text-muted">Mes demandes ({mine.length})</h2>
      <div className="space-y-2">
        {mine.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-card p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{WASTE_LABEL[p.wasteType].emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{p.quartier} · {formatFCFA(p.fee)}</div>
                <div className="text-xs text-faint">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <PickupPill status={p.status} />
            </div>
            {p.note && <p className="mt-1 text-xs text-muted">{p.note}</p>}

            {(p.status === 'acceptee' || p.status === 'terminee') && p.collectorName && (
              <div className="mt-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand-strong">
                <div className="font-semibold">🛺 {p.collectorName}</div>
                {p.collectorPhone && (
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Phone size={12} /> Payer {formatFCFA(p.fee)} : {p.collectorOperator} <b>{p.collectorPhone}</b>
                  </div>
                )}
              </div>
            )}

            {p.status === 'ouverte' && (
              <button
                onClick={() => cancelPickup(p.id)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-danger"
              >
                <Trash2 size={13} /> Annuler
              </button>
            )}
          </div>
        ))}
        {!mine.length && (
          <p className="rounded-xl bg-card p-6 text-center text-sm text-faint ring-1 ring-line">
            Aucune demande. Publie ta première demande de ramassage ci-dessus 🛺
          </p>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-faint">
        <Banknote size={13} /> Service entre particuliers — MboaClean met juste en relation.
      </p>
    </div>
  )
}

export function PickupPill({ status }: { status: PickupStatus }) {
  const s = PICKUP_STATUS_LABEL[status]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${s.color}1a`, color: s.color }}
    >
      {s.label}
    </span>
  )
}
