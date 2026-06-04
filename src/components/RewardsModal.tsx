import { useState } from 'react'
import { Check, Coins, X } from 'lucide-react'
import { useAuth, useStore } from '../store'
import { REWARDS, type Reward } from '../domain/rewards'

export function RewardsModal({ onClose }: { onClose: () => void }) {
  const me = useAuth()!
  const redeem = useStore((s) => s.redeem)
  const [done, setDone] = useState<Reward | null>(null)
  const [error, setError] = useState('')

  const onRedeem = (reward: Reward) => {
    const res = redeem(reward)
    if (res.ok) {
      setDone(reward)
      setError('')
    } else {
      setError(res.error ?? 'Erreur')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md animate-fade-up overflow-y-auto rounded-t-3xl bg-card p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand">
              <Check size={34} />
            </div>
            <h2 className="text-lg font-bold text-ink">Échange réussi 🎉</h2>
            <p className="mt-1 text-sm text-muted">
              {done.emoji} <b>{done.label}</b> — {done.cost} EcoPoints utilisés.
            </p>
            <p className="mt-2 text-xs text-faint">
              {done.type === 'credit' || done.type === 'momo'
                ? 'Le transfert sera effectué sur ton numéro Mobile Money (simulation — actif en Phase 3).'
                : 'Un agent te contactera pour la remise (simulation).'}
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDone(null)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink">
                Autre échange
              </button>
              <button onClick={onClose} className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">
                Terminer
              </button>
            </div>
          </div>
        ) : (
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
                      onClick={() => onRedeem(r)}
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
