// ── Modèle de données MboaClean ──────────────────────────────────────────────

export type WasteType =
  | 'menager'
  | 'plastique'
  | 'encombrant'
  | 'gravats'
  | 'organique'
  | 'dangereux'
  | 'autre'

export type Volume = 'petit' | 'moyen' | 'grand' | 'enorme'

/** Sensibilité de la zone : pondère l'urgence. */
export type ZoneSensitivity = 'normale' | 'ecole' | 'marche' | 'cours_eau' | 'sante'

export type ReportStatus = 'signale' | 'en_cours' | 'resolu'

export type SyncState = 'synced' | 'pending'

export type Role = 'citoyen' | 'decideur' | 'ramasseur'

// ── Marketplace de ramassage (ménage ↔ ramasseur privé) ──────────────────────

export type PickupStatus = 'ouverte' | 'acceptee' | 'terminee' | 'annulee'

/** Demande de ramassage payante émise par un ménage, prise par un ramasseur. */
export interface PickupRequest {
  id: string
  householdId: string
  householdName: string
  ville: string
  quartier: string
  lat: number
  lng: number
  wasteType: WasteType
  note?: string
  fee: number // montant proposé par le ménage (FCFA), payé en direct au ramasseur
  status: PickupStatus
  collectorId?: string
  collectorName?: string
  collectorPhone?: string
  collectorOperator?: string
  createdAt: number
  updatedAt: number
}

export const PICKUP_STATUS_LABEL: Record<PickupStatus, { label: string; color: string }> = {
  ouverte: { label: 'Ouverte', color: '#E8552D' },
  acceptee: { label: 'Acceptée', color: '#0FA3A3' },
  terminee: { label: 'Terminée', color: '#1B7A43' },
  annulee: { label: 'Annulée', color: '#8a9b91' },
}

export interface StatusChange {
  status: ReportStatus
  at: number
}

export interface Report {
  id: string
  lat: number
  lng: number
  ville: string
  quartier: string
  wasteType: WasteType
  volume: Volume
  zone: ZoneSensitivity
  description?: string
  photo?: string // dataURL compressée
  beforePhoto?: string
  afterPhoto?: string
  status: ReportStatus
  createdAt: number
  updatedAt: number
  reporterName: string
  sync: SyncState
  history: StatusChange[]
}

export interface User {
  name: string
  role: Role
  quartier: string
  ecoPoints: number
}

// ── Libellés ─────────────────────────────────────────────────────────────────

export const WASTE_LABEL: Record<WasteType, { label: string; emoji: string }> = {
  menager: { label: 'Ordures ménagères', emoji: '🗑️' },
  plastique: { label: 'Plastiques', emoji: '♳' },
  encombrant: { label: 'Encombrants', emoji: '🛋️' },
  gravats: { label: 'Gravats / déblais', emoji: '🧱' },
  organique: { label: 'Déchets organiques', emoji: '🍂' },
  dangereux: { label: 'Déchets dangereux', emoji: '☣️' },
  autre: { label: 'Autre', emoji: '❓' },
}

export const VOLUME_LABEL: Record<Volume, { label: string; emoji: string }> = {
  petit: { label: 'Petit (un sac)', emoji: '🛍️' },
  moyen: { label: 'Moyen (brouette)', emoji: '🛒' },
  grand: { label: 'Grand (tas)', emoji: '🚛' },
  enorme: { label: 'Énorme (dépôt sauvage)', emoji: '🏔️' },
}

export const ZONE_LABEL: Record<ZoneSensitivity, { label: string; emoji: string }> = {
  normale: { label: 'Zone normale', emoji: '🏠' },
  ecole: { label: "Près d'une école", emoji: '🏫' },
  marche: { label: "Près d'un marché", emoji: '🛒' },
  cours_eau: { label: "Près d'un cours d'eau", emoji: '💧' },
  sante: { label: "Près d'un centre de santé", emoji: '🏥' },
}

export const STATUS_LABEL: Record<ReportStatus, { label: string; color: string }> = {
  signale: { label: 'Signalé', color: '#E8552D' },
  en_cours: { label: 'En cours', color: '#0FA3A3' },
  resolu: { label: 'Résolu', color: '#1B7A43' },
}
