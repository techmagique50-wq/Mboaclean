import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { permission, showNotification } from '../lib/notify'
import { formatFCFA } from '../ui/ui'

/**
 * Alerte le ramasseur quand des demandes de ramassage sont ouvertes dans sa ville.
 * Best-effort (app ouverte + permission accordée) ; le vrai push multi-appareils
 * nécessitera un backend (FCM) en Phase 2.
 */
export function useCollectorAlerts() {
  const accounts = useStore((s) => s.accounts)
  const authId = useStore((s) => s.authId)
  const pickups = useStore((s) => s.pickups)
  const lastCount = useRef<number | null>(null)

  const me = accounts.find((a) => a.id === authId)

  useEffect(() => {
    if (!me || me.role !== 'ramasseur') {
      lastCount.current = null
      return
    }
    const open = pickups.filter((p) => p.status === 'ouverte' && p.ville === me.ville)
    const count = open.length
    const prev = lastCount.current
    lastCount.current = count

    if (permission() !== 'granted' || count === 0) return
    // notifie à la 1re détection, ou quand de nouvelles demandes arrivent
    if (prev === null || count > prev) {
      const total = open.reduce((s, p) => s + p.fee, 0)
      void showNotification(
        '🛺 Demandes de ramassage',
        `${count} demande(s) ouverte(s) à ${me.ville} — ${formatFCFA(total)} à gagner.`,
        'mboaclean-pickups',
      )
    }
  }, [me, pickups])
}
