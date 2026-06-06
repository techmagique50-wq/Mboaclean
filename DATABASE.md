# 🗄️ MboaClean — Base de données (Supabase / PostgreSQL + PostGIS)

La base est un **PostgreSQL hébergé sur Supabase** (palier **gratuit**), avec **PostGIS**
(géolocalisation), **authentification**, **API REST/Realtime automatique** et **sécurité par
ligne (RLS)**. L'app peut l'interroger **directement depuis le navigateur** — pas de serveur à gérer.

Fichiers :
- [`supabase/schema.sql`](supabase/schema.sql) — tables, types, géo, triggers, **RLS** (le schéma complet)
- [`supabase/seed.sql`](supabase/seed.sql) — données de démonstration (optionnel)

## 🧱 Modèle de données

| Table | Rôle |
|---|---|
| `profiles` | comptes (lié à l'auth Supabase) : rôle (citoyen/ramasseur/décideur), ville, quartier, EcoPoints, n° Mobile Money… |
| `reports` | dépôts sauvages signalés (photo, **lat/lng + `geom` PostGIS**, type, volume, zone, statut) |
| `report_events` | historique de statut d'un signalement |
| `pickups` | demandes de **ramassage à domicile** (ménage ↔ ramasseur, montant, statut) |
| `redemptions` | échanges d'EcoPoints (crédit / Mobile Money) |
| `pickups_view` | vue : demande + contact du ramasseur (jointure) |

Colonnes **`geom geography(Point,4326)`** générées automatiquement à partir de `lat/lng` →
requêtes spatiales prêtes (proximité, points noirs, heatmap), ex. :
```sql
select * from reports
where status <> 'resolu'
  and st_dwithin(geom, st_makepoint(11.5070, 3.8740)::geography, 150);  -- < 150 m
```

## 🚀 Mise en place (5 minutes, gratuit)

1. Crée un compte sur **https://supabase.com** → **New project** (choisis une région proche, ex. Europe).
2. Onglet **SQL Editor** → **New query** → colle tout [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. (Optionnel) Nouvelle requête → colle [`supabase/seed.sql`](supabase/seed.sql) → **Run** (données de démo).
4. **Settings → API** : copie **Project URL** et la clé **anon public**.

> PostGIS est déjà disponible sur Supabase ; le script l'active avec `create extension postgis`.

## 🔌 Connecter l'application

1. Installer le client :
   ```bash
   npm install @supabase/supabase-js
   ```
2. Ajouter dans `.env` (et `.env.example`) :
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
3. Créer `src/lib/supabase.ts` :
   ```ts
   import { createClient } from '@supabase/supabase-js'

   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
   )
   ```
4. Exemples d'usage :
   ```ts
   // Lire les signalements actifs d'une ville
   const { data } = await supabase
     .from('reports').select('*')
     .eq('ville', 'Yaoundé').neq('status', 'resolu')

   // Créer un signalement
   await supabase.from('reports').insert({
     reporter_id: profileId, ville, quartier, lat, lng, waste_type, volume, zone,
   })

   // Inscription (le rôle/ville passent au trigger qui crée le profil)
   await supabase.auth.signUp({
     email, password,
     options: { data: { name, role: 'ramasseur', ville: 'Yaoundé' } },
   })
   ```

## 🔐 Sécurité (RLS) — déjà configurée

- **reports** : lecture publique (carte) · création par tout utilisateur connecté · **changement de statut réservé au décideur**.
- **pickups** : le **ménage** voit/gère les siens · le **ramasseur** voit les demandes **ouvertes de sa ville** et celles qu'il a prises · accepter/terminer réservé au ramasseur.
- **redemptions** : chacun ne voit que les siennes.
- **profiles** : chacun modifie le sien ; lecture du nom publique (affichage).

## 📷 Photos (étape suivante)

Pour stocker les photos avant/après : Supabase **Storage** → créer un bucket public `reports`,
puis enregistrer l'URL publique dans `reports.photo_url` / `before_photo_url` / `after_photo_url`.

## 🔁 Migrer l'app du local vers la base

Aujourd'hui l'app stocke tout en **local (Zustand + localStorage)** — parfait pour la démo hors-ligne.
Brancher Supabase = remplacer les actions du store par des appels `supabase.*`, idéalement en
**gardant le cache local comme repli hors-ligne** (offline-first) et en synchronisant au retour du réseau.
Je peux faire ce câblage quand tu veux.
