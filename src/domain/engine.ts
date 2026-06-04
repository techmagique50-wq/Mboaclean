// ── Moteurs de décision MboaClean ────────────────────────────────────────────
// 1) Score d'urgence  2) Optimisation de tournée → carburant & CO₂ économisés.
// C'est ici qu'est la valeur vendue aux communes/HYSACAM.

import type { Report, Volume, ZoneSensitivity } from './types'

// ── Géo ──────────────────────────────────────────────────────────────────────

/** Distance en mètres entre deux points (formule de haversine). */
export function distanceM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// ── Score d'urgence ──────────────────────────────────────────────────────────

const VOLUME_WEIGHT: Record<Volume, number> = {
  petit: 10,
  moyen: 25,
  grand: 40,
  enorme: 55,
}

const ZONE_WEIGHT: Record<ZoneSensitivity, number> = {
  normale: 0,
  ecole: 20,
  marche: 15,
  sante: 20,
  cours_eau: 25,
}

export type UrgencyLevel = 'bas' | 'moyen' | 'haut'

export interface Urgency {
  score: number // 0–100
  level: UrgencyLevel
  recurrence: number // nb de signalements proches
}

/**
 * Score d'urgence = volume + sensibilité de la zone + récurrence (points noirs).
 * La récurrence détecte les zones chroniques (plusieurs signalements proches).
 */
export function urgency(report: Report, all: Report[]): Urgency {
  const recurrence = all.filter(
    (r) =>
      r.id !== report.id &&
      r.status !== 'resolu' &&
      distanceM(report, r) <= 150,
  ).length

  const recurrenceBonus = Math.min(25, recurrence * 5)
  const score = Math.min(
    100,
    VOLUME_WEIGHT[report.volume] + ZONE_WEIGHT[report.zone] + recurrenceBonus,
  )
  const level: UrgencyLevel = score >= 70 ? 'haut' : score >= 40 ? 'moyen' : 'bas'
  return { score, level, recurrence }
}

export const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  bas: '#1B7A43',
  moyen: '#E8A23D',
  haut: '#E8552D',
}

// ── Optimisation de tournée ──────────────────────────────────────────────────

export interface RoutePlan {
  ordered: Report[]
  optimizedKm: number
  naiveKm: number
  savedKm: number
  litersSaved: number
  fcfaSaved: number
  co2SavedKg: number
}

// hypothèses (modifiables) pour un camion de collecte
const TRUCK_L_PER_100KM = 35 // L / 100 km
const DIESEL_FCFA_PER_L = 840 // prix du gasoil au Cameroun (approx.)
const CO2_KG_PER_L = 2.64 // kg de CO₂ par litre de gasoil

function routeLength(points: { lat: number; lng: number }[]): number {
  let total = 0
  for (let i = 0; i < points.length - 1; i++) total += distanceM(points[i], points[i + 1])
  return total / 1000 // km
}

/**
 * Plan de tournée optimisé (plus proche voisin depuis le dépôt) comparé à
 * l'ordre « naïf » (chronologique). Quantifie le carburant et le CO₂ évités.
 */
export function planRoute(reports: Report[], depot: { lat: number; lng: number }): RoutePlan {
  const todo = reports.filter((r) => r.status !== 'resolu')

  // tournée naïve = ordre chronologique de signalement
  const naive = [...todo].sort((a, b) => a.createdAt - b.createdAt)
  const naiveKm = routeLength([depot, ...naive, depot])

  // tournée optimisée = plus proche voisin
  const remaining = [...todo]
  const ordered: Report[] = []
  let cur: { lat: number; lng: number } = depot
  while (remaining.length) {
    let bestI = 0
    let bestD = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceM(cur, remaining[i])
      if (d < bestD) {
        bestD = d
        bestI = i
      }
    }
    const next = remaining.splice(bestI, 1)[0]
    ordered.push(next)
    cur = next
  }
  const optimizedKm = routeLength([depot, ...ordered, depot])

  const savedKm = Math.max(0, naiveKm - optimizedKm)
  const litersSaved = (savedKm * TRUCK_L_PER_100KM) / 100
  return {
    ordered,
    optimizedKm,
    naiveKm,
    savedKm,
    litersSaved,
    fcfaSaved: litersSaved * DIESEL_FCFA_PER_L,
    co2SavedKg: litersSaved * CO2_KG_PER_L,
  }
}
