// Récompenses échangeables contre des EcoPoints.
// La conversion réelle (crédit / Mobile Money) se fera via les API MTN MoMo /
// Orange Money en Phase 3 ; ici l'échange est simulé localement.

export type RewardType = 'credit' | 'momo' | 'bon' | 'don'

export interface Reward {
  id: string
  label: string
  detail: string
  emoji: string
  cost: number
  type: RewardType
}

export const REWARDS: Reward[] = [
  { id: 'credit_250', label: '250 FCFA de crédit', detail: 'Crédit téléphonique MTN / Orange', emoji: '📱', cost: 50, type: 'credit' },
  { id: 'credit_500', label: '500 FCFA de crédit', detail: 'Crédit téléphonique MTN / Orange', emoji: '📱', cost: 100, type: 'credit' },
  { id: 'momo_1000', label: '1 000 FCFA Mobile Money', detail: 'Transfert MTN MoMo / Orange Money', emoji: '💸', cost: 200, type: 'momo' },
  { id: 'bon_kit', label: 'Kit de tri', detail: 'Bon pour 2 poubelles de tri', emoji: '🗑️', cost: 150, type: 'bon' },
  { id: 'don_quartier', label: 'Don propreté', detail: 'Reverse à un projet de ton quartier', emoji: '🤝', cost: 80, type: 'don' },
]
