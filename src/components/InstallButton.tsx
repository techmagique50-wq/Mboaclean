import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/** Bannière « Installer l'app » : prompt natif (Android/Chrome) ou astuce iOS. */
export function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
    }
    const onInstalled = () => setDismissed(true)
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS && !isStandalone()) setIosHint(true)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (dismissed || isStandalone()) return null
  if (!deferred && !iosHint) return null

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice.catch(() => {})
    setDeferred(null)
    setDismissed(true)
  }

  return (
    <div className="flex items-center gap-2 bg-brand-strong px-4 py-2 text-sm text-white">
      <Download size={16} className="shrink-0" />
      {deferred ? (
        <>
          <span className="flex-1">Installe MboaClean sur ton téléphone</span>
          <button onClick={install} className="rounded-lg bg-white/20 px-3 py-1 font-semibold">
            Installer
          </button>
        </>
      ) : (
        <span className="flex-1 text-xs">
          Pour installer : appuie sur <Share size={12} className="inline" /> puis « Sur l'écran d'accueil ».
        </span>
      )}
      <button onClick={() => setDismissed(true)} aria-label="Fermer" className="rounded-lg p-1 hover:bg-white/15">
        <X size={16} />
      </button>
    </div>
  )
}
