# MboaClean ♻️🇨🇲

**La donnée citoyenne au service d'un Cameroun plus propre.** Les habitants signalent les dépôts sauvages (photo + GPS) ; les communes / HYSACAM reçoivent un tableau de bord qui **priorise les interventions et optimise les tournées** — donc **économise du carburant**.

> MVP Phase 1 — application web installable (PWA), légère et **hors-ligne**, partageable par lien WhatsApp.

## Ce que fait le MVP

### Côté citoyen
- **Signalement en 3 étapes** : photo → position GPS automatique → type / volume / zone → envoi.
- **Carte interactive** des signalements (marqueurs colorés par urgence) + **heatmap des points noirs**.
- **Suivi de statut** : signalé → en cours → résolu, avec **photos avant / après**.
- **Mode hors-ligne natif** : on signale sans réseau, **synchronisation différée** automatique au retour.
- **Gamification** : EcoPoints, badges, classement des quartiers (rétention).

### Côté décideur (commune / HYSACAM)
- **KPIs** : points actifs, taux de résolution, délai moyen.
- **File de priorité** triée par **score d'urgence** (volume + sensibilité de la zone + récurrence).
- **Tournée optimisée** (plus proche voisin) avec **carburant, FCFA et CO₂ économisés** chiffrés — l'argument de vente B2G.

> Bascule du rôle citoyen / décideur via le bouton en haut (mode démo, sans authentification).

## La valeur : le moteur de décision

Tout est dans [`src/domain/engine.ts`](src/domain/engine.ts) (TypeScript pur) :
- **Score d'urgence** : `volume + sensibilité de zone + récurrence (points noirs à <150 m)`.
- **Optimisation de tournée** : itinéraire plus proche voisin depuis le dépôt HYSACAM, comparé à une tournée non optimisée → litres / FCFA / CO₂ économisés.

Hypothèses (modifiables) : 35 L/100 km · 840 FCFA/L · 2,64 kg CO₂/L. Sur les données de démo Yaoundé : ≈ **5 L et 4 285 FCFA économisés par tournée** (~1,07 M FCFA/an sur 250 tournées).

## Stack

PWA légère, adaptée au contexte (Android d'entrée de gamme, faible connexion) :

- **Vite + React + TypeScript**, **Tailwind CSS v4**
- **Leaflet + react-leaflet** (OpenStreetMap, coût maîtrisé) + **leaflet.heat** (heatmap)
- **Zustand** + `persist` (état local → hors-ligne)
- **vite-plugin-pwa** (service worker, manifest, **tuiles de carte mises en cache** pour l'usage hors-ligne)
- **lucide-react** (icônes)

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production (génère le service worker PWA)
npx tsx scripts/test-engine.ts   # vérifie urgence + carburant économisé
```

Sur le téléphone (Chrome Android) : ouvrir l'URL → menu → **« Ajouter à l'écran d'accueil »**. L'app s'installe, fonctionne hors-ligne, se partage par lien.

## Structure

```
src/
  domain/
    types.ts      # modèle (Report, statuts, types de déchets, zones…)
    engine.ts     # ⭐ score d'urgence + optimisation de tournée (carburant/CO₂)
    seed.ts       # données de démo géolocalisées (Yaoundé + Douala)
  components/
    MapView.tsx   # carte Leaflet : marqueurs, heatmap, tracé de tournée
  pages/
    MapPage           # carte citoyenne + filtres + heatmap
    ReportPage        # signalement 3 étapes (photo/GPS/détails)
    ReportDetailPage  # détail, historique, avant/après, actions décideur
    ProfilePage       # EcoPoints, badges, classement, mes signalements
    DashboardPage     # ⭐ tableau de bord décideur (KPIs + tournée + économies)
  lib/photo.ts    # compression d'image (économie de data)
  store.ts        # état global (Zustand + persistance + online/offline)
  App.tsx         # layout, navigation par rôle, bandeau hors-ligne
```

## Feuille de route (rappel du dossier)

- **Phase 1 (ce MVP)** : signalement, carte, dashboard, hors-ligne, gamification → convaincre **1 commune pilote**.
- **Phase 2** : app **Flutter** native, notifications push (FCM).
- **Phase 3** : **EcoPoints ↔ Mobile Money** (MTN MoMo / Orange Money), **IA** de classification d'image, canal **USSD/SMS**.
- **Phase 4** : marketplace recyclage, données B2B, crédits carbone.

> Aujourd'hui : tout est **local** (pas de backend). Étape suivante naturelle : une API (NestJS/FastAPI) + PostGIS + stockage objet pour les photos, et l'authentification multi-rôles.
