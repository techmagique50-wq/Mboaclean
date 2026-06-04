// Notifications locales du conseil quotidien.
// Utilise l'API Web Notifications + le service worker (PWA) quand disponible.
// NB : une vraie notification quotidienne « app fermée » nécessitera du push
// serveur (FCM) — prévu en Phase 2.

interface TipLike {
  title: string
  text: string
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : 'denied'
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/** Date locale au format YYYY-MM-DD (clé "déjà notifié aujourd'hui"). */
export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Affiche le conseil sous forme de notification. */
export async function showTipNotification(tip: TipLike): Promise<boolean> {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false
  const title = '🌱 Conseil du jour — MboaClean'
  const options: NotificationOptions = {
    body: `${tip.title}\n${tip.text}`,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'mboaclean-daily-tip',
  }
  try {
    // via le service worker (meilleure compatibilité, surtout mobile)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return true
    }
  } catch {
    /* repli ci-dessous */
  }
  try {
    new Notification(title, options)
    return true
  } catch {
    return false
  }
}
