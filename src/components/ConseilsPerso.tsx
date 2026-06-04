import { useState } from 'react'
import { Bell, BellRing, Send, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import {
  CATEGORY_LABEL,
  HABIT_QUESTIONS,
  recommendedCategories,
  type Habits,
} from '../domain/eco'
import { useDailyTip } from '../hooks/useDailyAITip'
import {
  notificationsSupported,
  permission as getPermission,
  requestPermission,
  showTipNotification,
} from '../lib/notify'

export function ConseilsPerso() {
  const habits = useStore((s) => s.habits)
  const setHabits = useStore((s) => s.setHabits)
  const notif = useStore((s) => s.notif)
  const setNotif = useStore((s) => s.setNotif)

  const [perm, setPerm] = useState(getPermission())
  const tip = useDailyTip()
  const cats = recommendedCategories(habits)
  const answered = Object.keys(habits).length

  const setHabit = (key: keyof Habits, value: boolean) =>
    setHabits({ ...habits, [key]: value })

  const enable = async () => {
    if (notif.enabled) {
      setNotif({ enabled: false })
      return
    }
    let p = getPermission()
    if (p !== 'granted') p = await requestPermission()
    setPerm(p)
    if (p === 'granted') setNotif({ enabled: true })
  }

  const testNow = async () => {
    let p = getPermission()
    if (p !== 'granted') p = await requestPermission()
    setPerm(p)
    if (p === 'granted') await showTipNotification(tip)
  }

  return (
    <div className="space-y-4">
      {/* Habitudes */}
      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold text-brand-strong">
          <SlidersHorizontal size={18} /> Personnalise tes conseils
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          Réponds à quelques questions : on ciblera les conseils sur tes habitudes.
        </p>

        <div className="mt-3 space-y-2.5">
          {HABIT_QUESTIONS.map((q) => {
            const val = habits[q.key]
            return (
              <div key={q.key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink">{q.question}</span>
                <div className="flex shrink-0 gap-1">
                  <YesNo active={val === true} onClick={() => setHabit(q.key, true)}>Oui</YesNo>
                  <YesNo active={val === false} onClick={() => setHabit(q.key, false)}>Non</YesNo>
                </div>
              </div>
            )
          })}
        </div>

        {answered > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
            <span className="text-xs text-faint">Conseils ciblés :</span>
            {cats.slice(0, 4).map((c) => (
              <span key={c} className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                {CATEGORY_LABEL[c].emoji} {CATEGORY_LABEL[c].label}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold text-brand-strong">
          <Bell size={18} /> Conseil quotidien par notification
        </h2>

        {!notificationsSupported() ? (
          <p className="mt-2 text-sm text-amber-600">
            Ton navigateur ne supporte pas les notifications. Essaie depuis Chrome sur Android.
          </p>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-ink">Recevoir un conseil chaque jour</span>
              <button
                onClick={enable}
                className={`relative h-7 w-12 rounded-full transition ${
                  notif.enabled ? 'bg-brand' : 'bg-faint/40'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition ${
                    notif.enabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <label className="text-sm text-ink">Heure d'envoi</label>
              <select
                value={notif.hour}
                onChange={(e) => setNotif({ hour: Number(e.target.value) })}
                className="rounded-xl border border-line px-3 py-1.5 text-sm"
              >
                {[6, 7, 8, 9, 12, 18, 19, 20, 21].map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}h00</option>
                ))}
              </select>
            </div>

            {perm === 'denied' && (
              <p className="mt-2 text-xs text-amber-600">
                Les notifications sont bloquées. Autorise-les dans les réglages du navigateur.
              </p>
            )}

            <button
              onClick={testNow}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0fa3a3] py-2.5 text-sm font-semibold text-white"
            >
              {notif.enabled ? <BellRing size={16} /> : <Send size={16} />} Tester le conseil maintenant
            </button>
          </>
        )}

        {/* aperçu du conseil personnalisé du jour */}
        <div className="mt-3 rounded-xl bg-gradient-to-br from-[#1b7a43] to-[#0f4d2a] p-3 text-white">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80">
            <Sparkles size={12} /> Ton conseil du jour
          </div>
          <div className="mt-1 text-sm font-bold">
            {tip.emoji} {tip.title} {tip.source === 'ia' && <span className="opacity-80">✨</span>}
          </div>
          <p className="mt-0.5 text-xs opacity-95">{tip.text}</p>
        </div>
      </section>
    </div>
  )
}

function YesNo({
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
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-[#1b7a43] text-white' : 'bg-hover text-muted'
      }`}
    >
      {children}
    </button>
  )
}
