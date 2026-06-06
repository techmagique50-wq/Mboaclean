// ── Couche d'accès aux données Supabase ──────────────────────────────────────
// Convertit les lignes DB (snake_case) ↔ types de l'app, et expose le CRUD.
// N'est appelée que lorsque Supabase est configuré (sinon repli local).

import { supabase } from './supabase'
import type { PickupRequest, PickupStatus, Report, ReportStatus } from '../domain/types'
import type { Account, Redemption } from '../store'

type Row = Record<string, any>

function sb() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

const ts = (s: string | null) => (s ? Date.parse(s) : Date.now())

// ── Mappers ──────────────────────────────────────────────────────────────────
export function rowToAccount(r: Row): Account {
  return {
    id: r.id,
    name: r.name,
    email: r.email ?? '',
    password: '',
    role: r.role,
    ville: r.ville,
    quartier: r.quartier ?? '',
    organisation: r.organisation ?? undefined,
    phone: r.phone ?? undefined,
    operator: r.operator ?? undefined,
    ecoPoints: r.ecopoints ?? 0,
  }
}

function rowToReport(r: Row): Report {
  const created = ts(r.created_at)
  const updated = ts(r.updated_at)
  const history = [{ status: 'signale' as ReportStatus, at: created }]
  if (r.status !== 'signale') history.push({ status: r.status, at: updated })
  return {
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    ville: r.ville,
    quartier: r.quartier,
    wasteType: r.waste_type,
    volume: r.volume,
    zone: r.zone,
    description: r.description ?? undefined,
    photo: r.photo_url ?? undefined,
    beforePhoto: r.before_photo_url ?? undefined,
    afterPhoto: r.after_photo_url ?? undefined,
    status: r.status,
    createdAt: created,
    updatedAt: updated,
    reporterName: r.reporter_name ?? 'Anonyme',
    sync: 'synced',
    history,
  }
}

function rowToPickup(r: Row): PickupRequest {
  return {
    id: r.id,
    householdId: r.household_id ?? '',
    householdName: r.household_name,
    ville: r.ville,
    quartier: r.quartier,
    lat: r.lat,
    lng: r.lng,
    wasteType: r.waste_type,
    note: r.note ?? undefined,
    fee: r.fee,
    status: r.status,
    collectorId: r.collector_id ?? undefined,
    collectorName: r.collector_name ?? undefined,
    collectorPhone: r.collector_phone ?? undefined,
    collectorOperator: r.collector_operator ?? undefined,
    createdAt: ts(r.created_at),
    updatedAt: ts(r.updated_at),
  }
}

function rowToRedemption(r: Row): Redemption {
  return {
    id: r.id,
    accountId: r.account_id,
    rewardId: r.reward_id,
    label: r.label,
    cost: r.cost,
    at: ts(r.created_at),
    phone: r.phone ?? undefined,
    operator: r.operator ?? undefined,
  }
}

// ── Profil ───────────────────────────────────────────────────────────────────
export async function fetchProfile(userId: string): Promise<Account | null> {
  const { data } = await sb().from('profiles').select('*').eq('user_id', userId).maybeSingle()
  return data ? rowToAccount(data) : null
}

export async function updateProfile(id: string, patch: Partial<Account>): Promise<void> {
  const row: Row = {}
  if (patch.ecoPoints !== undefined) row.ecopoints = patch.ecoPoints
  if (patch.name !== undefined) row.name = patch.name
  if (patch.ville !== undefined) row.ville = patch.ville
  if (patch.quartier !== undefined) row.quartier = patch.quartier
  if (patch.organisation !== undefined) row.organisation = patch.organisation
  if (patch.phone !== undefined) row.phone = patch.phone
  if (patch.operator !== undefined) row.operator = patch.operator
  if (Object.keys(row).length) await sb().from('profiles').update(row).eq('id', id)
}

// ── Reports ──────────────────────────────────────────────────────────────────
export async function fetchReports(): Promise<Report[]> {
  const { data } = await sb().from('reports').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(rowToReport)
}

export async function insertReport(
  data: Pick<Report, 'lat' | 'lng' | 'ville' | 'quartier' | 'wasteType' | 'volume' | 'zone' | 'description' | 'photo'>,
  reporterId: string,
  reporterName: string,
): Promise<Report | null> {
  const { data: row } = await sb()
    .from('reports')
    .insert({
      reporter_id: reporterId,
      reporter_name: reporterName,
      lat: data.lat,
      lng: data.lng,
      ville: data.ville,
      quartier: data.quartier,
      waste_type: data.wasteType,
      volume: data.volume,
      zone: data.zone,
      description: data.description ?? null,
      photo_url: data.photo ?? null,
    })
    .select('*')
    .single()
  if (row) await sb().from('report_events').insert({ report_id: row.id, status: 'signale' })
  return row ? rowToReport(row) : null
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  afterPhoto?: string,
): Promise<void> {
  const patch: Row = { status }
  if (afterPhoto) patch.after_photo_url = afterPhoto
  await sb().from('reports').update(patch).eq('id', id)
  await sb().from('report_events').insert({ report_id: id, status })
}

// ── Pickups ──────────────────────────────────────────────────────────────────
export async function fetchPickups(): Promise<PickupRequest[]> {
  const { data } = await sb().from('pickups_view').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(rowToPickup)
}

export async function insertPickup(
  data: Pick<PickupRequest, 'ville' | 'quartier' | 'lat' | 'lng' | 'wasteType' | 'note' | 'fee'>,
  householdId: string,
  householdName: string,
): Promise<PickupRequest | null> {
  const { data: row } = await sb()
    .from('pickups')
    .insert({
      household_id: householdId,
      household_name: householdName,
      ville: data.ville,
      quartier: data.quartier,
      lat: data.lat,
      lng: data.lng,
      waste_type: data.wasteType,
      note: data.note ?? null,
      fee: data.fee,
    })
    .select('*')
    .single()
  return row ? rowToPickup(row) : null
}

export async function acceptPickupDb(id: string, collectorId: string): Promise<void> {
  await sb().from('pickups').update({ status: 'acceptee', collector_id: collectorId }).eq('id', id)
}

export async function setPickupStatus(id: string, status: PickupStatus): Promise<void> {
  await sb().from('pickups').update({ status }).eq('id', id)
}

// ── Redemptions ──────────────────────────────────────────────────────────────
export async function fetchRedemptions(accountId: string): Promise<Redemption[]> {
  const { data } = await sb()
    .from('redemptions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(rowToRedemption)
}

export async function insertRedemption(
  accountId: string,
  reward: { id: string; label: string; cost: number },
  contact?: { phone?: string; operator?: string },
): Promise<void> {
  await sb().from('redemptions').insert({
    account_id: accountId,
    reward_id: reward.id,
    label: reward.label,
    cost: reward.cost,
    phone: contact?.phone ?? null,
    operator: contact?.operator ?? null,
  })
}
