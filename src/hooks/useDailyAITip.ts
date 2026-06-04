import { useEffect, useRef } from 'react'
import { useStore, type AiTip } from '../store'
import { aiDailyTip, isAIAvailable } from '../lib/ai'
import { CATEGORY_LABEL, personalizedDailyTip, type Habits } from '../domain/eco'
import { todayKey } from '../lib/notify'

function habitsKey(h: Habits): string {
  return JSON.stringify(h)
}

/** Génère le conseil du jour via l'IA une fois par jour (et par jeu d'habitudes). */
export function useDailyAITip() {
  const habits = useStore((s) => s.habits)
  const aiTip = useStore((s) => s.aiTip)
  const setAiTip = useStore((s) => s.setAiTip)
  const attempted = useRef('')

  useEffect(() => {
    const today = todayKey()
    const hk = habitsKey(habits)
    const fresh = aiTip && aiTip.dateKey === today && aiTip.habitsKey === hk
    if (fresh || !isAIAvailable()) return

    const sig = `${today}|${hk}`
    if (attempted.current === sig) return // pas de reprise en boucle après un échec
    attempted.current = sig

    let cancelled = false
    aiDailyTip(habits)
      .then((t) => {
        if (!cancelled) setAiTip({ dateKey: today, habitsKey: hk, title: t.title, text: t.text })
      })
      .catch(() => {
        /* repli local assuré par effectiveDailyTip */
      })
    return () => {
      cancelled = true
    }
  }, [habits, aiTip, setAiTip])
}

export interface DailyTipView {
  title: string
  text: string
  emoji: string
  source: 'ia' | 'local'
}

/** Conseil du jour effectif : IA si frais et disponible, sinon repli local. */
export function effectiveDailyTip(aiTip: AiTip | null, habits: Habits): DailyTipView {
  const today = todayKey()
  if (aiTip && aiTip.dateKey === today && aiTip.habitsKey === habitsKey(habits)) {
    return { title: aiTip.title, text: aiTip.text, emoji: '🌱', source: 'ia' }
  }
  const t = personalizedDailyTip(habits)
  return { title: t.title, text: t.text, emoji: CATEGORY_LABEL[t.category].emoji, source: 'local' }
}

/** Hook réactif renvoyant le conseil du jour à afficher. */
export function useDailyTip(): DailyTipView {
  const habits = useStore((s) => s.habits)
  const aiTip = useStore((s) => s.aiTip)
  return effectiveDailyTip(aiTip, habits)
}
