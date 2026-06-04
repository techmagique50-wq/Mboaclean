import { useEffect } from 'react'
import { useStore } from '../store'
import { permission, showTipNotification, todayKey } from '../lib/notify'
import { effectiveDailyTip } from './useDailyAITip'

/**
 * Vérifie régulièrement s'il faut envoyer le conseil du jour :
 * notifications activées + autorisées + pas déjà envoyé aujourd'hui + heure atteinte.
 * Le conseil est personnalisé selon les habitudes de l'utilisateur.
 */
export function useDailyTipNotification() {
  useEffect(() => {
    const check = async () => {
      const { notif, habits, aiTip, setNotif } = useStore.getState()
      if (!notif.enabled || permission() !== 'granted') return
      const today = todayKey()
      if (notif.lastNotified === today) return
      if (new Date().getHours() < notif.hour) return
      const ok = await showTipNotification(effectiveDailyTip(aiTip, habits))
      if (ok) setNotif({ lastNotified: today })
    }
    check()
    const interval = setInterval(check, 60_000) // re-vérifie chaque minute
    return () => clearInterval(interval)
  }, [])
}
