// ── Moteur de congestion & créneau d'intervention ────────────────────────────
// Estime le trafic SANS caméras ni GPS sur les camions : modèle d'heures de
// pointe + points chauds (marchés, écoles), connu localement. S'affinera plus
// tard avec le crowdsourcing citoyen et le smartphone de l'agent.

import type { ZoneSensitivity } from './types'

// Profil horaire de congestion (0–23), 0 = fluide, 1 = saturé.
// Calé sur les villes camerounaises : pointes matin (6–9h) et soir (16–19h).
const HOURLY_BASE: number[] = [
  0.05, 0.05, 0.05, 0.05, 0.1, 0.25, // 0–5
  0.55, 0.85, 0.95, 0.7, 0.5, 0.5, // 6–11
  0.6, 0.6, 0.5, 0.55, 0.75, 0.95, // 12–17
  0.95, 0.75, 0.45, 0.3, 0.15, 0.08, // 18–23
]

/** Surcharge liée au type de zone (marché bondé en journée, école aux entrées/sorties). */
function zoneSurcharge(zone: ZoneSensitivity, hour: number): number {
  if (zone === 'marche') return hour >= 8 && hour <= 18 ? 0.2 : 0
  if (zone === 'ecole') return [7, 12, 13, 17].includes(hour) ? 0.3 : 0
  return 0
}

/** Congestion estimée (0–1) à une heure donnée pour une zone. */
export function congestionAt(zone: ZoneSensitivity, hour: number): number {
  const h = ((hour % 24) + 24) % 24
  return Math.min(1, HOURLY_BASE[h] + zoneSurcharge(zone, h))
}

export type CongestionLevel = 'fluide' | 'modéré' | 'dense'
export function congestionLevel(c: number): CongestionLevel {
  return c >= 0.7 ? 'dense' : c >= 0.4 ? 'modéré' : 'fluide'
}

// Fenêtre horaire d'intervention autorisée (sécurité + visibilité).
const WORK_START = 5
const WORK_END = 20

export interface InterventionWindow {
  hour: number // heure de début conseillée
  endHour: number
  level: CongestionLevel
  congestion: number
  reason: string
}

/** Meilleur créneau d'intervention : minimise la congestion sans gêner la circulation. */
export function bestInterventionWindow(zone: ZoneSensitivity): InterventionWindow {
  let bestHour = WORK_START
  let bestC = Infinity
  for (let h = WORK_START; h <= WORK_END; h++) {
    const c = congestionAt(zone, h)
    if (c < bestC) {
      bestC = c
      bestHour = h
    }
  }
  const endHour = Math.min(WORK_END, bestHour + 2)
  let reason: string
  if (zone === 'marche' && bestHour <= 7) reason = "tôt le matin, avant l'ouverture du marché"
  else if (zone === 'ecole' && bestHour <= 7) reason = "avant l'arrivée des élèves"
  else if (bestHour <= 6) reason = 'tôt le matin, avant les heures de pointe'
  else reason = 'hors des heures de pointe'
  return { hour: bestHour, endHour, level: congestionLevel(bestC), congestion: bestC, reason }
}

// ── Temps de trajet selon l'heure ────────────────────────────────────────────

const FREE_FLOW_KMH = 28 // vitesse urbaine fluide
const SLOWDOWN = 0.68 // part de vitesse perdue à congestion maximale

export function speedKmh(congestion: number): number {
  return Math.max(6, FREE_FLOW_KMH * (1 - SLOWDOWN * congestion))
}

/** Durée de trajet (minutes) pour `km` à une heure donnée (zone = trafic moyen). */
export function travelMinutes(km: number, hour: number, zone: ZoneSensitivity = 'normale'): number {
  return (km / speedKmh(congestionAt(zone, hour))) * 60
}

export interface DepartureAdvice {
  bestHour: number
  peakHour: number
  minutesBest: number
  minutesPeak: number
  minutesSaved: number
}

/** Conseil de départ : compare le meilleur créneau à l'heure de pointe. */
export function departureAdvice(km: number): DepartureAdvice {
  let bestHour = WORK_START
  let peakHour = 8
  let lo = Infinity
  let hi = -Infinity
  for (let h = WORK_START; h <= WORK_END; h++) {
    const c = congestionAt('normale', h)
    if (c < lo) {
      lo = c
      bestHour = h
    }
    if (h >= 6 && h <= 19 && c > hi) {
      hi = c
      peakHour = h
    }
  }
  const minutesBest = travelMinutes(km, bestHour)
  const minutesPeak = travelMinutes(km, peakHour)
  return {
    bestHour,
    peakHour,
    minutesBest,
    minutesPeak,
    minutesSaved: Math.max(0, minutesPeak - minutesBest),
  }
}

export function fmtHour(h: number): string {
  return `${String(h).padStart(2, '0')}h`
}
