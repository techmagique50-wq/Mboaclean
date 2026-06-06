-- ============================================================================
--  MboaClean — Schéma de base de données (PostgreSQL + PostGIS, pour Supabase)
--  À exécuter dans Supabase : SQL Editor → coller → Run.
--  Idempotent autant que possible (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================================

-- 1) Extensions ---------------------------------------------------------------
create extension if not exists postgis;          -- géolocalisation
create extension if not exists "pgcrypto";       -- gen_random_uuid()

-- 2) Types énumérés -----------------------------------------------------------
do $$ begin
  create type role_type        as enum ('citoyen', 'decideur', 'ramasseur');
exception when duplicate_object then null; end $$;

do $$ begin
  create type waste_type       as enum ('menager','plastique','encombrant','gravats','organique','dangereux','autre');
exception when duplicate_object then null; end $$;

do $$ begin
  create type volume_type      as enum ('petit','moyen','grand','enorme');
exception when duplicate_object then null; end $$;

do $$ begin
  create type zone_type        as enum ('normale','ecole','marche','cours_eau','sante');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status    as enum ('signale','en_cours','resolu');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pickup_status    as enum ('ouverte','acceptee','terminee','annulee');
exception when duplicate_object then null; end $$;

-- 3) Fonctions utilitaires ----------------------------------------------------
-- met à jour updated_at automatiquement
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- 4) Table profiles (étend auth.users) ---------------------------------------
-- id = clé interne ; user_id = lien vers le compte d'authentification Supabase.
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid unique references auth.users(id) on delete cascade,
  name         text not null default 'Utilisateur',
  email        text,
  role         role_type not null default 'citoyen',
  ville        text not null default 'Yaoundé',
  quartier     text default '',
  organisation text,                 -- décideurs (commune / HYSACAM)
  phone        text,                 -- ramasseurs : n° Mobile Money
  operator     text,                 -- MTN MoMo / Orange Money
  ecopoints    integer not null default 0,
  preferences  jsonb not null default '{}'::jsonb,  -- habitudes, notif, thème…
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- crée automatiquement un profil à l'inscription d'un utilisateur
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, name, role, ville)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::role_type, 'citoyen'),
    coalesce(new.raw_user_meta_data->>'ville', 'Yaoundé')
  );
  return new;
end $$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- helpers de sécurité (rôle / profil courant)
create or replace function current_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from profiles where user_id = auth.uid()
$$;

create or replace function current_role_type()
returns role_type language sql stable security definer set search_path = public as $$
  select role from profiles where user_id = auth.uid()
$$;

-- 5) Table reports (dépôts sauvages signalés) --------------------------------
create table if not exists reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references profiles(id) on delete set null,
  reporter_name text,
  ville        text not null,
  quartier     text not null default 'Non précisé',
  lat          double precision not null,
  lng          double precision not null,
  -- colonne géo générée pour les requêtes spatiales (proximité, zones, heatmap)
  geom         geography(Point,4326)
                 generated always as (st_setsrid(st_makepoint(lng,lat),4326)::geography) stored,
  waste_type   waste_type not null default 'menager',
  volume       volume_type not null default 'moyen',
  zone         zone_type not null default 'normale',
  description  text,
  photo_url       text,
  before_photo_url text,
  after_photo_url  text,
  status       report_status not null default 'signale',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_reports_updated on reports;
create trigger trg_reports_updated before update on reports
  for each row execute function set_updated_at();

create index if not exists idx_reports_geom   on reports using gist (geom);
create index if not exists idx_reports_ville   on reports (ville);
create index if not exists idx_reports_status  on reports (status);
create index if not exists idx_reports_created on reports (created_at desc);

-- historique de statut d'un signalement
create table if not exists report_events (
  id         bigint generated always as identity primary key,
  report_id  uuid not null references reports(id) on delete cascade,
  status     report_status not null,
  at         timestamptz not null default now()
);
create index if not exists idx_report_events_report on report_events (report_id);

-- 6) Table pickups (ramassage à domicile : ménage ↔ ramasseur) ---------------
create table if not exists pickups (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid references profiles(id) on delete set null,
  household_name text not null default 'Ménage',
  ville         text not null,
  quartier      text not null default 'Non précisé',
  lat           double precision not null,
  lng           double precision not null,
  geom          geography(Point,4326)
                  generated always as (st_setsrid(st_makepoint(lng,lat),4326)::geography) stored,
  waste_type    waste_type not null default 'menager',
  note          text,
  fee           integer not null default 0,   -- montant proposé (FCFA)
  status        pickup_status not null default 'ouverte',
  collector_id  uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_pickups_updated on pickups;
create trigger trg_pickups_updated before update on pickups
  for each row execute function set_updated_at();

create index if not exists idx_pickups_geom    on pickups using gist (geom);
create index if not exists idx_pickups_ville    on pickups (ville);
create index if not exists idx_pickups_status   on pickups (status);
create index if not exists idx_pickups_collector on pickups (collector_id);

-- 7) Table redemptions (échanges d'EcoPoints) --------------------------------
create table if not exists redemptions (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid references profiles(id) on delete cascade,
  reward_id  text not null,
  label      text not null,
  cost       integer not null,
  phone      text,
  operator   text,
  created_at timestamptz not null default now()
);
create index if not exists idx_redemptions_account on redemptions (account_id);

-- 8) Sécurité par ligne (RLS) -------------------------------------------------
alter table profiles    enable row level security;
alter table reports     enable row level security;
alter table report_events enable row level security;
alter table pickups     enable row level security;
alter table redemptions enable row level security;

-- profiles : chacun lit/écrit le sien ; lecture publique du nom utile à l'affichage
drop policy if exists profiles_select_all  on profiles;
create policy profiles_select_all  on profiles for select using (true);
drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles for update using (user_id = auth.uid());
drop policy if exists profiles_insert_self on profiles;
create policy profiles_insert_self on profiles for insert with check (user_id = auth.uid());

-- reports : lecture publique (carte) ; création par tout utilisateur connecté ;
-- changement de statut réservé aux décideurs.
drop policy if exists reports_select_all on reports;
create policy reports_select_all on reports for select using (true);

drop policy if exists reports_insert_auth on reports;
create policy reports_insert_auth on reports for insert
  with check (auth.uid() is not null and reporter_id = current_profile_id());

drop policy if exists reports_update_decideur on reports;
create policy reports_update_decideur on reports for update
  using (current_role_type() = 'decideur');

-- report_events : lecture publique ; insertion par décideur (changement de statut)
drop policy if exists report_events_select_all on report_events;
create policy report_events_select_all on report_events for select using (true);
drop policy if exists report_events_insert_decideur on report_events;
create policy report_events_insert_decideur on report_events for insert
  with check (current_role_type() = 'decideur');

-- pickups :
--  - SELECT : le ménage voit les siens ; le ramasseur voit les demandes ouvertes
--    de sa ville + celles qu'il a prises ; le décideur voit sa ville.
--  - INSERT : le ménage crée les siens.
--  - UPDATE : le ménage modifie/annule les siens ; le ramasseur accepte/termine.
drop policy if exists pickups_select on pickups;
create policy pickups_select on pickups for select using (
  household_id = current_profile_id()
  or collector_id = current_profile_id()
  or (status = 'ouverte'
      and ville = (select ville from profiles where id = current_profile_id()))
);

drop policy if exists pickups_insert_household on pickups;
create policy pickups_insert_household on pickups for insert
  with check (household_id = current_profile_id());

drop policy if exists pickups_update on pickups;
create policy pickups_update on pickups for update using (
  household_id = current_profile_id()
  or collector_id = current_profile_id()
  or (status = 'ouverte' and current_role_type() = 'ramasseur')
);

-- redemptions : chacun voit / crée les siennes
drop policy if exists redemptions_select_self on redemptions;
create policy redemptions_select_self on redemptions for select
  using (account_id = current_profile_id());
drop policy if exists redemptions_insert_self on redemptions;
create policy redemptions_insert_self on redemptions for insert
  with check (account_id = current_profile_id());

-- 9) Vue pratique : demandes de ramassage + contact du ramasseur -------------
create or replace view pickups_view as
  select p.*,
         c.name     as collector_name,
         c.phone    as collector_phone,
         c.operator as collector_operator
  from pickups p
  left join profiles c on c.id = p.collector_id;

-- ============================================================================
--  Requête utile (exemple) : signalements actifs à moins de 150 m d'un point
--    select * from reports
--    where status <> 'resolu'
--      and st_dwithin(geom, st_makepoint(:lng,:lat)::geography, 150);
-- ============================================================================
