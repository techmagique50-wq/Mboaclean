// ── Registre des villes ──────────────────────────────────────────────────────
// Pour ajouter une ville : ajoute une entrée ici (nom, centre carte, dépôt de
// collecte). Tout le reste de l'app (filtres, dashboard, signalement) s'adapte.

export interface Depot {
  lat: number
  lng: number
  name: string
}

export interface City {
  name: string
  center: [number, number] // [lat, lng] — centre de la carte
  depot: Depot // garage / point de départ des tournées (HYSACAM)
}

export const CITIES: City[] = [
  { name: 'Yaoundé', center: [3.866, 11.516], depot: { lat: 3.83, lng: 11.54, name: 'Garage HYSACAM (Nsam)' } },
  { name: 'Douala', center: [4.05, 9.7], depot: { lat: 4.03, lng: 9.74, name: 'Garage HYSACAM (Douala)' } },
  { name: 'Bafoussam', center: [5.4778, 10.4174], depot: { lat: 5.46, lng: 10.43, name: 'Dépôt Bafoussam' } },
  { name: 'Bamenda', center: [5.9597, 10.1459], depot: { lat: 5.95, lng: 10.16, name: 'Dépôt Bamenda' } },
  { name: 'Garoua', center: [9.3017, 13.3921], depot: { lat: 9.3, lng: 13.4, name: 'Dépôt Garoua' } },
  { name: 'Maroua', center: [10.591, 14.315], depot: { lat: 10.58, lng: 14.32, name: 'Dépôt Maroua' } },
  { name: 'Ngaoundéré', center: [7.327, 13.584], depot: { lat: 7.33, lng: 13.58, name: 'Dépôt Ngaoundéré' } },
  { name: 'Bertoua', center: [4.5775, 13.6846], depot: { lat: 4.57, lng: 13.69, name: 'Dépôt Bertoua' } },
  { name: 'Kribi', center: [2.937, 9.91], depot: { lat: 2.94, lng: 9.92, name: 'Dépôt Kribi' } },
  { name: 'Limbe', center: [4.022, 9.196], depot: { lat: 4.02, lng: 9.21, name: 'Dépôt Limbe' } },
  { name: 'Buea', center: [4.155, 9.241], depot: { lat: 4.15, lng: 9.25, name: 'Dépôt Buea' } },
  { name: 'Ebolowa', center: [2.915, 11.154], depot: { lat: 2.91, lng: 11.16, name: 'Dépôt Ebolowa' } },
  { name: 'Edéa', center: [3.798, 10.135], depot: { lat: 3.8, lng: 10.14, name: 'Dépôt Edéa' } },
  { name: 'Kumba', center: [4.636, 9.446], depot: { lat: 4.64, lng: 9.45, name: 'Dépôt Kumba' } },
]

export const CITY_NAMES = CITIES.map((c) => c.name)

const FALLBACK = CITIES[0]

export function getCity(name: string): City {
  return CITIES.find((c) => c.name === name) ?? FALLBACK
}

export function depotFor(name: string): Depot {
  return getCity(name).depot
}

export function cityCenter(name: string): [number, number] {
  return getCity(name).center
}
