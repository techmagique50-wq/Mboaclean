import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Coins, Gift, History, Trophy } from 'lucide-react'
import { useAuth, useStore } from '../store'
import { STATUS_LABEL, WASTE_LABEL } from '../domain/types'
import { PageTitle, StatusPill } from '../ui/ui'
import { ConseilsPerso } from '../components/ConseilsPerso'
import { RewardsModal } from '../components/RewardsModal'

export function ProfilePage() {
  const user = useAuth()!
  const reports = useStore((s) => s.reports)
  const allRedemptions = useStore((s) => s.redemptions)
  const redemptions = useMemo(
    () => allRedemptions.filter((r) => r.accountId === user.id),
    [allRedemptions, user.id],
  )
  const [showRewards, setShowRewards] = useState(false)

  const mine = useMemo(
    () => reports.filter((r) => r.reporterName === user.name).sort((a, b) => b.createdAt - a.createdAt),
    [reports, user.name],
  )
  const resolved = mine.filter((r) => r.status === 'resolu').length

  const badges = [
    { ok: mine.length >= 1, emoji: '🌱', label: 'Premier signalement' },
    { ok: mine.length >= 5, emoji: '🦸', label: 'Éco-citoyen actif' },
    { ok: resolved >= 1, emoji: '✅', label: 'Première résolution' },
    { ok: mine.length >= 10, emoji: '🏆', label: 'Gardien du quartier' },
  ]

  // classement des quartiers les plus actifs (gamification)
  const ranking = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of reports) m.set(r.quartier, (m.get(r.quartier) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [reports])

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Mon profil" subtitle={user.quartier} />

      {/* EcoPoints */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-[#1b7a43] to-[#0f4d2a] p-5 text-white">
        <div>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Coins size={16} /> EcoPoints
          </div>
          <div className="text-4xl font-extrabold">{user.ecoPoints}</div>
          <div className="mt-1 text-xs opacity-80">+10 points par signalement</div>
        </div>
        <button
          onClick={() => setShowRewards(true)}
          className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25 active:scale-95"
        >
          <Gift size={16} /> Échanger
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-faint">
        Convertis tes EcoPoints en crédit téléphonique (MTN MoMo / Orange Money).
      </p>

      {redemptions.length > 0 && (
        <div className="mt-3 rounded-2xl border border-line bg-card p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
            <History size={14} /> Mes échanges
          </h3>
          <div className="space-y-1.5">
            {redemptions.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{r.label}</span>
                <span className="text-faint">−{r.cost} pts · {new Date(r.at).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* conseils personnalisés + notifications */}
      <div className="mt-5">
        <ConseilsPerso />
      </div>

      {/* badges */}
      <h2 className="mb-2 mt-5 flex items-center gap-2 text-sm font-semibold text-muted">
        <Award size={16} /> Mes badges
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {badges.map((b) => (
          <div
            key={b.label}
            className={`flex items-center gap-2 rounded-xl border p-3 ${
              b.ok ? 'border-[#1b7a43] bg-brand-soft' : 'border-line bg-card opacity-50'
            }`}
          >
            <span className="text-2xl">{b.emoji}</span>
            <span className="text-sm font-medium text-ink">{b.label}</span>
          </div>
        ))}
      </div>

      {/* classement quartiers */}
      <h2 className="mb-2 mt-5 flex items-center gap-2 text-sm font-semibold text-muted">
        <Trophy size={16} /> Quartiers les plus mobilisés
      </h2>
      <div className="divide-y divide-line rounded-2xl border border-line bg-card">
        {ranking.map(([q, c], i) => (
          <div key={q} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-6 text-center font-bold text-faint">{i + 1}</span>
            <span className="flex-1 font-medium text-ink">{q}</span>
            <span className="text-sm text-muted">{c} signalements</span>
          </div>
        ))}
      </div>

      {/* mes signalements */}
      <h2 className="mb-2 mt-5 text-sm font-semibold text-muted">
        Mes signalements ({mine.length})
      </h2>
      <div className="space-y-2">
        {mine.map((r) => (
          <Link
            key={r.id}
            to={`/signalement/${r.id}`}
            className="flex items-center gap-3 rounded-xl border border-line bg-card p-3"
          >
            <span className="text-2xl">{WASTE_LABEL[r.wasteType].emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-ink">{r.quartier}, {r.ville}</div>
              <div className="text-xs text-faint">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
            <StatusPill status={r.status} />
          </Link>
        ))}
        {!mine.length && (
          <p className="rounded-xl bg-card p-6 text-center text-sm text-faint ring-1 ring-line">
            Tu n'as pas encore signalé. Touche « Signaler » pour commencer 🌱
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-faint">
        Connecté en tant que <b>{user.name}</b> · {STATUS_LABEL.signale.label.toLowerCase()} = orange
      </p>

      {showRewards && <RewardsModal onClose={() => setShowRewards(false)} />}
    </div>
  )
}
