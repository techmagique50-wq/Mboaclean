import type { Report } from './types'

/** Dépôt / garage HYSACAM (point de départ des tournées) — Yaoundé. */
export const DEPOT = { lat: 3.83, lng: 11.54, name: 'Garage HYSACAM (Nsam)' }

const DAY = 86_400_000
const T0 = 1_748_736_000_000 // base fixe (déterministe, pas de Date.now)

let n = 0
function r(p: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'sync' | 'history' | 'status'> & {
  daysAgo: number
  status?: Report['status']
}): Report {
  const createdAt = T0 - p.daysAgo * DAY
  const status = p.status ?? 'signale'
  const { daysAgo, ...rest } = p
  void daysAgo
  return {
    id: `r${++n}`,
    createdAt,
    updatedAt: createdAt,
    sync: 'synced',
    history: [{ status: 'signale', at: createdAt }],
    ...rest,
    status,
  }
}

export const seedReports: Report[] = [
  // ── Grappe « point noir chronique » : marché Mokolo (récurrence + zone marché)
  r({ lat: 3.874, lng: 11.507, ville: 'Yaoundé', quartier: 'Mokolo', wasteType: 'menager', volume: 'enorme', zone: 'marche', reporterName: 'Awa N.', daysAgo: 6, description: 'Tas énorme à côté du marché, odeurs très fortes.' }),
  r({ lat: 3.8745, lng: 11.5073, ville: 'Yaoundé', quartier: 'Mokolo', wasteType: 'organique', volume: 'grand', zone: 'marche', reporterName: 'Brice T.', daysAgo: 3 }),
  r({ lat: 3.8738, lng: 11.5065, ville: 'Yaoundé', quartier: 'Mokolo', wasteType: 'plastique', volume: 'moyen', zone: 'marche', reporterName: 'Mireille K.', daysAgo: 1 }),

  // ── École : Ngoa-Ekellé
  r({ lat: 3.859, lng: 11.498, ville: 'Yaoundé', quartier: 'Ngoa-Ekellé', wasteType: 'menager', volume: 'grand', zone: 'ecole', reporterName: 'Junior M.', daysAgo: 2, description: "Dépôt devant l'entrée d'une école primaire." }),

  // ── Cours d'eau : Tongolo
  r({ lat: 3.872, lng: 11.521, ville: 'Yaoundé', quartier: 'Tongolo', wasteType: 'plastique', volume: 'grand', zone: 'cours_eau', reporterName: 'Aïcha B.', daysAgo: 4, description: 'Plastiques qui bouchent le cours d\'eau, risque d\'inondation.' }),

  // ── Divers Yaoundé
  r({ lat: 3.848, lng: 11.523, ville: 'Yaoundé', quartier: 'Mvog-Mbi', wasteType: 'encombrant', volume: 'moyen', zone: 'normale', reporterName: 'Paul E.', daysAgo: 5, status: 'en_cours' }),
  r({ lat: 3.879, lng: 11.511, ville: 'Yaoundé', quartier: 'Briqueterie', wasteType: 'menager', volume: 'grand', zone: 'normale', reporterName: 'Fadi O.', daysAgo: 3 }),
  r({ lat: 3.88, lng: 11.516, ville: 'Yaoundé', quartier: 'Nlongkak', wasteType: 'gravats', volume: 'grand', zone: 'normale', reporterName: 'Sandra L.', daysAgo: 7 }),
  r({ lat: 3.887, lng: 11.532, ville: 'Yaoundé', quartier: 'Essos', wasteType: 'menager', volume: 'moyen', zone: 'normale', reporterName: 'Hervé D.', daysAgo: 2 }),
  r({ lat: 3.865, lng: 11.54, ville: 'Yaoundé', quartier: 'Mimboman', wasteType: 'organique', volume: 'moyen', zone: 'normale', reporterName: 'Clarisse N.', daysAgo: 4, status: 'en_cours' }),
  r({ lat: 3.842, lng: 11.483, ville: 'Yaoundé', quartier: 'Biyem-Assi', wasteType: 'menager', volume: 'petit', zone: 'normale', reporterName: 'Yann P.', daysAgo: 8 }),
  r({ lat: 3.855, lng: 11.526, ville: 'Yaoundé', quartier: 'Madagascar', wasteType: 'dangereux', volume: 'moyen', zone: 'sante', reporterName: 'Dr Foe', daysAgo: 1, description: 'Déchets médicaux près du centre de santé.' }),

  // ── Résolus (avec preuve avant/après simulée)
  r({ lat: 3.908, lng: 11.53, ville: 'Yaoundé', quartier: 'Etoudi', wasteType: 'menager', volume: 'grand', zone: 'normale', reporterName: 'Alain K.', daysAgo: 12, status: 'resolu' }),
  r({ lat: 3.844, lng: 11.516, ville: 'Yaoundé', quartier: 'Centre-ville', wasteType: 'encombrant', volume: 'moyen', zone: 'normale', reporterName: 'Nadia S.', daysAgo: 14, status: 'resolu' }),

  // ── Douala (extension future)
  r({ lat: 4.05, lng: 9.7, ville: 'Douala', quartier: 'Akwa', wasteType: 'menager', volume: 'grand', zone: 'marche', reporterName: 'Eric M.', daysAgo: 2 }),
  r({ lat: 4.036, lng: 9.718, ville: 'Douala', quartier: 'New Bell', wasteType: 'plastique', volume: 'enorme', zone: 'normale', reporterName: 'Bertrand A.', daysAgo: 3 }),
]

// enrichir l'historique des "en cours" / "résolu"
for (const rep of seedReports) {
  if (rep.status === 'en_cours')
    rep.history.push({ status: 'en_cours', at: rep.createdAt + DAY })
  if (rep.status === 'resolu') {
    rep.history.push({ status: 'en_cours', at: rep.createdAt + DAY })
    rep.history.push({ status: 'resolu', at: rep.createdAt + 3 * DAY })
    rep.updatedAt = rep.createdAt + 3 * DAY
  }
}
