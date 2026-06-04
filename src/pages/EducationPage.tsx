import { useRef, useState } from 'react'
import { Bot, Lightbulb, Loader2, Send, Sparkles } from 'lucide-react'
import {
  CATEGORY_LABEL,
  STARTER_QUESTIONS,
  TIPS,
  askAssistant,
  type TipCategory,
} from '../domain/eco'
import { useStore } from '../store'
import { aiChat, isAIAvailable } from '../lib/ai'
import { effectiveDailyTip, useDailyTip } from '../hooks/useDailyAITip'
import { PageTitle } from '../ui/ui'

export function EducationPage() {
  const [tab, setTab] = useState<'conseils' | 'assistant'>('conseils')

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle
        title="Sensibilisation"
        subtitle="Protéger l'environnement, ça s'apprend ensemble 🌍"
      />

      <div className="mb-4 flex gap-2">
        <TabBtn active={tab === 'conseils'} onClick={() => setTab('conseils')} icon={<Lightbulb size={16} />}>
          Conseils
        </TabBtn>
        <TabBtn active={tab === 'assistant'} onClick={() => setTab('assistant')} icon={<Bot size={16} />}>
          Assistant
        </TabBtn>
      </div>

      {tab === 'conseils' ? <ConseilsTab /> : <AssistantTab />}
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${
        active ? 'bg-[#1b7a43] text-white' : 'bg-card text-muted ring-1 ring-line'
      }`}
    >
      {icon} {children}
    </button>
  )
}

// ── Onglet conseils ───────────────────────────────────────────────────────────

function ConseilsTab() {
  const tip = useDailyTip()
  const [cat, setCat] = useState<TipCategory | 'tous'>('tous')
  const list = TIPS.filter((t) => cat === 'tous' || t.category === cat)

  return (
    <div>
      {/* conseil du jour */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1b7a43] to-[#0f4d2a] p-5 text-white">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide opacity-80">
          <span className="flex items-center gap-2"><Sparkles size={14} /> Conseil du jour</span>
          {tip.source === 'ia' && <span className="rounded-full bg-white/20 px-2 py-0.5">✨ IA</span>}
        </div>
        <h2 className="mt-1.5 text-lg font-bold">
          {tip.emoji} {tip.title}
        </h2>
        <p className="mt-1 text-sm opacity-95">{tip.text}</p>
      </div>

      {/* filtres catégories */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={cat === 'tous'} onClick={() => setCat('tous')}>
          Tous
        </Chip>
        {(Object.keys(CATEGORY_LABEL) as TipCategory[]).map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {CATEGORY_LABEL[c].emoji} {CATEGORY_LABEL[c].label}
          </Chip>
        ))}
      </div>

      {/* liste de conseils */}
      <div className="mt-4 space-y-2">
        {list.map((t) => (
          <div key={t.id} className="rounded-2xl border border-line bg-card p-4">
            <h3 className="flex items-center gap-2 font-semibold text-brand-strong">
              <span>{CATEGORY_LABEL[t.category].emoji}</span> {t.title}
            </h3>
            <p className="mt-1 text-sm text-muted">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Onglet assistant ──────────────────────────────────────────────────────────

interface ChatMsg {
  id: number
  from: 'user' | 'bot'
  text: string
  suggestions?: string[]
}

function AssistantTab() {
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => {
    const tip = effectiveDailyTip(useStore.getState().aiTip, useStore.getState().habits)
    return [
      {
        id: 0,
        from: 'bot',
        text: `Bonjour 👋 Je suis l'assistant éco de MboaClean.\n\n💡 Conseil du jour — ${tip.title} : ${tip.text}\n\nPose-moi une question sur les déchets ou l'environnement.`,
        suggestions: STARTER_QUESTIONS,
      },
    ]
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const idRef = useRef(1)
  const endRef = useRef<HTMLDivElement>(null)

  const scroll = () => setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

  const ask = async (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    const history = msgs.map((m) => ({ from: m.from, text: m.text }))
    setMsgs((m) => [...m, { id: idRef.current++, from: 'user', text: q }])
    setInput('')
    scroll()

    if (isAIAvailable()) {
      setTyping(true)
      try {
        const answer = await aiChat(history, q)
        setMsgs((m) => [...m, { id: idRef.current++, from: 'bot', text: answer }])
      } catch {
        const reply = askAssistant(q) // repli local
        setMsgs((m) => [
          ...m,
          { id: idRef.current++, from: 'bot', text: reply.answer, suggestions: reply.suggestions },
        ])
      } finally {
        setTyping(false)
        scroll()
      }
    } else {
      const reply = askAssistant(q)
      setMsgs((m) => [
        ...m,
        { id: idRef.current++, from: 'bot', text: reply.answer, suggestions: reply.suggestions },
      ])
      scroll()
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 14rem)' }}>
      <div className="flex-1 space-y-3 overflow-y-auto pb-2">
        {msgs.map((m) => (
          <div key={m.id} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className="max-w-[85%]">
              <div
                className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.from === 'user' ? 'bg-[#1b7a43] text-white' : 'bg-card text-ink ring-1 ring-line'
                }`}
              >
                {m.from === 'bot' && (
                  <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#0fa3a3]">
                    <Bot size={13} /> Assistant éco
                  </span>
                )}
                {m.text}
              </div>
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand hover:brightness-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 text-sm text-muted ring-1 ring-line">
              <Loader2 size={14} className="animate-spin" /> écrit…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-line pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(input)}
          placeholder="Pose ta question sur l'environnement…"
          className="flex-1 rounded-full bg-card px-4 py-2.5 text-sm ring-1 ring-line focus:outline-none focus:ring-[#1b7a43]"
        />
        <button onClick={() => ask(input)} disabled={typing} className="rounded-full bg-[#1b7a43] p-2.5 text-white disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-faint">
        {isAIAvailable()
          ? '✨ Propulsé par IA gratuite (Gemini) — repli local automatique hors-ligne.'
          : 'Assistant local (hors-ligne). Ajoute une clé Gemini gratuite pour activer l\'IA.'}
      </p>
    </div>
  )
}

function Chip({
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
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? 'bg-[#1b7a43] text-white' : 'bg-card text-muted ring-1 ring-line'
      }`}
    >
      {children}
    </button>
  )
}
