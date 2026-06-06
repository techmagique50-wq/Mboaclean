import { useState } from 'react'
import { ArrowLeft, Check, Coins, Phone, X } from 'lucide-react'
import { useAuth, useStore } from '../store'
import { REWARDS, type Reward } from '../domain/rewards'

const OPERATORS = ['MTN MoMo', 'Orange Money']

function needsNumber(r: Reward) {
  return r.type === 'credit' || r.type === 'momo'
}

export function RewardsModal({ onClose }: { onClose: () => void }) {
  const me = useAuth()!
  const redeem = useStore((s) => s.redeem)

  const [pending, setPending] = useState<Reward | null>(null) // récompense en attente du numéro
  const [done, setDone] = useState<{ reward: Reward; phone?: string; operator?: string } | null>(null)
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState(OPERATORS[0])
  const [error, setError] = useState('')

  const start = (reward: Reward) => {
    setError('')
    if (needsNumber(reward)) {
      setPending(reward) // → écran de saisie du numéro
    } else {
      finish(reward) // bon / don : pas de numéro
    }
  }

  const finish = (reward: Reward, contact?: { phone: string; operator: string }) => {
    const res = redeem(reward, contact)
    if (res.ok) {
      setDone({ reward, phone: contact?.phone, operator: contact?.operator })
      setPending(null)
    } else {
      setError(res.error ?? 'Erreur')
    }
  }

  const confirmNumber = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 8) {
      setError('Entre un numéro Mobile Money valide (8 chiffres minimum).')
      return
    }
    if (pending) finish(pending, { phone: phone.trim(), operator })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md animate-pop overflow-y-auto rounded-3xl bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Succès ───────────────────────────────────────────────── */}
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand">
              <Check size={34} />
            </div>
            <h2 className="text-lg font-bold text-ink">Échange réussi 🎉</h2>
            <p className="mt-1 text-sm text-muted">
              {done.reward.emoji} <b>{done.reward.label}</b> — {done.reward.cost} EcoPoints utilisés.
            </p>
            {done.phone ? (
              <p className="mt-2 text-sm text-brand-strong">
                Transfert vers <b>{done.operator}</b> : <b>{done.phone}</b>
              </p>
            ) : null}
            <p className="mt-2 text-xs text-faint">
              Simulation — le transfert Mobile Money réel sera actif en Phase 3.
            </p>
            <button onClick={onClose} className="mt-4 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">
              Terminer
            </button>
          </div>
        ) : pending ? (
          /* ── Saisie du numéro Mobile Money ──────────────────────── */
          <div>
            <div className="mb-3 flex items-center gap-2">
              <button onClick={() => { setPending(null); setError('') }} className="rounded-lg p-1.5 text-muted hover:bg-hover">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-lg font-bold text-ink">Numéro Mobile Money</h2>
            </div>
            <p className="mb-3 text-sm text-muted">
              {pending.emoji} <b>{pending.label}</b> ({pending.cost} pts) sera envoyé sur ce numéro.
            </p>

            <label className="mb-1 block text-xs font-medium text-muted">Opérateur</label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {OPERATORS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOperator(o)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    operator === o ? 'border-brand bg-brand-soft text-brand' : 'border-line text-muted'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>

            <label className="mb-1 block text-xs font-medium text-muted">Numéro de téléphone</label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 focus-within:border-brand">
              <Phone size={16} className="text-faint" />
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            {error && <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <button
              onClick={confirmNumber}
              className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              Confirmer l'échange
            </button>
          </div>
        ) : (
          /* ── Liste des récompenses ──────────────────────────────── */
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Échanger mes EcoPoints</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-brand">
                  <Coins size={16} /> <b>{me.ecoPoints}</b> EcoPoints disponibles
                </p>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-hover">
                <X size={20} />
              </button>
            </div>

            {error && <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <div className="space-y-2">
              {REWARDS.map((r) => {
                const enough = me.ecoPoints >= r.cost
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-2xl">
                      {r.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-ink">{r.label}</div>
                      <div className="text-xs text-faint">{r.detail}</div>
                    </div>
                    <button
                      onClick={() => start(r)}
                      disabled={!enough}
                      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition active:scale-95 ${
                        enough ? 'bg-brand text-white' : 'cursor-not-allowed bg-hover text-faint'
                      }`}
                    >
                      {r.cost} pts
                    </button>
                  </div>
                )
              })}
            </div>

            <p className="mt-4 text-center text-[11px] text-faint">
              Conversion réelle MTN MoMo / Orange Money prévue en Phase 3.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
