// ── Couche IA gratuite (Google Gemini) ───────────────────────────────────────
// Modèle gratuit `gemini-2.0-flash` appelé en simple fetch (aucune dépendance).
// Clé via VITE_GEMINI_API_KEY (palier gratuit). Repli automatique sur la base
// locale (src/domain/eco.ts) quand : pas de clé, hors-ligne, ou erreur API.
//
// ⚠️ Démo : une clé appelée depuis le navigateur est visible. Acceptable pour
// une clé gratuite ; en production, passer par un proxy backend.

import { CATEGORY_LABEL, HABIT_QUESTIONS, type Habits } from '../domain/eco'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const MODEL = 'gemini-2.0-flash'
const ENDPOINT = (m: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${API_KEY}`

/** Vrai si une clé IA est configurée. */
export function isAIConfigured(): boolean {
  return !!API_KEY
}

/** L'IA est-elle utilisable maintenant ? (clé + connexion) */
export function isAIAvailable(): boolean {
  return isAIConfigured() && (typeof navigator === 'undefined' || navigator.onLine)
}

const ASSISTANT_SYSTEM = `Tu es l'assistant écologique de MboaClean, une application camerounaise de gestion des déchets.
Réponds TOUJOURS en français, de façon brève (3 à 5 phrases maximum), concrète et bienveillante.
Adapte tes conseils au contexte camerounais : HYSACAM, saison des pluies et caniveaux bouchés, marchés, sachets plastiques, brûlage des ordures à éviter, Mobile Money.
Reste sur les thèmes environnement, déchets, recyclage, propreté et santé publique. Si la question est hors sujet, ramène poliment vers ces thèmes.
N'invente pas de chiffres précis ; reste pratique et actionnable.`

interface ChatTurn {
  from: 'user' | 'bot'
  text: string
}

async function gemini(body: unknown): Promise<string> {
  const res = await fetch(ENDPOINT(MODEL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  const data = await res.json()
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Réponse IA vide')
  return text.trim()
}

/**
 * Assistant conversationnel. `history` = tours précédents (hors message courant).
 * Lance une erreur si l'IA échoue → l'appelant bascule sur le repli local.
 */
export async function aiChat(history: ChatTurn[], message: string): Promise<string> {
  if (!isAIAvailable()) throw new Error('IA indisponible')
  const contents = [
    ...history.map((t) => ({
      role: t.from === 'user' ? 'user' : 'model',
      parts: [{ text: t.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ]
  return gemini({
    systemInstruction: { parts: [{ text: ASSISTANT_SYSTEM }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
  })
}

/** Description courte des habitudes pour personnaliser le conseil. */
function habitsSummary(habits: Habits): string {
  const parts: string[] = []
  for (const q of HABIT_QUESTIONS) {
    const v = habits[q.key]
    if (v === undefined) continue
    parts.push(`${q.question} ${v ? 'oui' : 'non'}`)
  }
  return parts.length ? parts.join(' ; ') : 'aucune habitude renseignée'
}

export interface AITip {
  title: string
  text: string
}

/**
 * Conseil de sensibilisation du jour, personnalisé selon les habitudes.
 * Renvoie {title, text}. Lance une erreur si l'IA échoue.
 */
export async function aiDailyTip(habits: Habits): Promise<AITip> {
  if (!isAIAvailable()) throw new Error('IA indisponible')
  const cats = Object.values(CATEGORY_LABEL)
    .map((c) => c.label)
    .join(', ')
  const prompt = `Génère UN conseil de sensibilisation environnementale pour aujourd'hui, au Cameroun, personnalisé selon les habitudes de l'utilisateur.
Habitudes : ${habitsSummary(habits)}.
Cible en priorité les habitudes à améliorer. Thèmes possibles : ${cats}.
Réponds STRICTEMENT en JSON, sans texte autour : {"title": "titre court (max 6 mots)", "text": "1 à 2 phrases concrètes et actionnables"}.`
  const raw = await gemini({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 200,
      responseMimeType: 'application/json',
    },
  })
  const parsed = JSON.parse(raw) as Partial<AITip>
  if (!parsed.title || !parsed.text) throw new Error('Conseil IA invalide')
  return { title: parsed.title, text: parsed.text }
}
