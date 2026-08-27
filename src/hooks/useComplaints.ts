'use client'

import { useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  FraudType, UrgencyLevel, FreezeStep, ApplicableLaw,
  ComplaintStatus, ComplaintStatusEvent, COMPLAINT_STATUSES,
} from '@/data/scenarios'

export interface EvidenceImage {
  id: string
  name: string
  dataUrl: string
  addedAt: string
}

export interface ComplaintUpdate {
  id: string
  note: string
  actionPoints: string[]
  actionPointsHi: string[]
  addedAt: string
}

export interface SavedComplaint {
  incidentId: string
  fraudType: FraudType
  victimName: string
  amount: number
  urgencyLevel: UrgencyLevel
  summary: string
  summaryHi: string
  complaintDraft: string
  complaintDraftHi: string
  frauderContact: string
  bankName: string
  accountNumber: string
  upiId?: string
  timeline: string
  freezeSteps: FreezeStep[]
  applicableLaws: ApplicableLaw[]
  savedAt: string
  language: 'en' | 'hi'
  status: ComplaintStatus
  statusHistory: ComplaintStatusEvent[]
  evidenceImages: EvidenceImage[]
  updates: ComplaintUpdate[]
}

const STORAGE_KEY = 'samarthan_complaints'
const TABLE = 'complaints'

// Postgres row shape (snake_case) <-> SavedComplaint (camelCase)
interface ComplaintRow {
  incident_id: string
  fraud_type: FraudType
  victim_name: string
  amount: number
  urgency_level: UrgencyLevel
  summary: string
  summary_hi: string
  complaint_draft: string
  complaint_draft_hi: string
  frauder_contact: string
  bank_name: string
  account_number: string
  upi_id: string | null
  timeline: string
  freeze_steps: FreezeStep[]
  applicable_laws: ApplicableLaw[]
  saved_at: string
  language: 'en' | 'hi'
  status: ComplaintStatus
  status_history: ComplaintStatusEvent[]
  evidence_images: EvidenceImage[]
  updates: ComplaintUpdate[]
}

function fromRow(row: ComplaintRow): SavedComplaint {
  return normalize({
    incidentId: row.incident_id,
    fraudType: row.fraud_type,
    victimName: row.victim_name,
    amount: row.amount,
    urgencyLevel: row.urgency_level,
    summary: row.summary,
    summaryHi: row.summary_hi,
    complaintDraft: row.complaint_draft,
    complaintDraftHi: row.complaint_draft_hi,
    frauderContact: row.frauder_contact,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    upiId: row.upi_id ?? undefined,
    timeline: row.timeline,
    freezeSteps: row.freeze_steps,
    applicableLaws: row.applicable_laws,
    savedAt: row.saved_at,
    language: row.language,
    status: row.status,
    statusHistory: row.status_history,
    evidenceImages: row.evidence_images,
    updates: row.updates,
  })
}

function toRow(c: SavedComplaint): ComplaintRow {
  return {
    incident_id: c.incidentId,
    fraud_type: c.fraudType,
    victim_name: c.victimName,
    amount: c.amount,
    urgency_level: c.urgencyLevel,
    summary: c.summary,
    summary_hi: c.summaryHi,
    complaint_draft: c.complaintDraft,
    complaint_draft_hi: c.complaintDraftHi,
    frauder_contact: c.frauderContact,
    bank_name: c.bankName,
    account_number: c.accountNumber,
    upi_id: c.upiId ?? null,
    timeline: c.timeline,
    freeze_steps: c.freezeSteps,
    applicable_laws: c.applicableLaws,
    saved_at: c.savedAt,
    language: c.language,
    status: c.status,
    status_history: c.statusHistory,
    evidence_images: c.evidenceImages,
    updates: c.updates,
  }
}

// Fills in fields that didn't exist yet when a complaint was first saved
// (e.g. records written before evidenceImages/applicableLaws/updates were
// added to the schema), so older localStorage entries don't crash the UI.
function normalize(c: Partial<SavedComplaint>): SavedComplaint {
  return {
    ...c,
    freezeSteps: c.freezeSteps ?? [],
    applicableLaws: c.applicableLaws ?? [],
    statusHistory: c.statusHistory ?? [],
    evidenceImages: c.evidenceImages ?? [],
    updates: (c.updates ?? []).map(u => ({
      ...u,
      actionPoints: u.actionPoints ?? [],
      actionPointsHi: u.actionPointsHi ?? [],
    })),
    status: c.status ?? 'SUBMITTED',
  } as SavedComplaint
}

function readLocal(): SavedComplaint[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(normalize) : []
  } catch {
    return []
  }
}

function writeLocal(all: SavedComplaint[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function useComplaints() {
  const getAll = useCallback(async (): Promise<SavedComplaint[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('saved_at', { ascending: false })
      if (error) throw error
      return (data as ComplaintRow[]).map(fromRow)
    }
    return readLocal()
  }, [])

  const save = useCallback(async (complaint: Omit<SavedComplaint, 'savedAt' | 'status' | 'statusHistory' | 'evidenceImages' | 'updates'>) => {
    const now = new Date().toISOString()
    const record: SavedComplaint = {
      ...complaint,
      savedAt: now,
      status: 'SUBMITTED',
      statusHistory: [{ status: 'SUBMITTED', at: now }],
      evidenceImages: [],
      updates: [],
    }

    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from(TABLE)
        .select('incident_id')
        .eq('incident_id', complaint.incidentId)
        .maybeSingle()
      if (existing) return
      const { error } = await supabase.from(TABLE).insert(toRow(record))
      if (error) throw error
      return
    }

    const all = readLocal()
    if (all.some(c => c.incidentId === complaint.incidentId)) return
    writeLocal([record, ...all])
  }, [])

  const getById = useCallback(async (incidentId: string): Promise<SavedComplaint | undefined> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('incident_id', incidentId)
        .maybeSingle()
      if (error) throw error
      return data ? fromRow(data as ComplaintRow) : undefined
    }
    return readLocal().find(c => c.incidentId === incidentId)
  }, [])

  const writeStatus = useCallback(async (
    incidentId: string, current: SavedComplaint, next: ComplaintStatus,
  ): Promise<ComplaintStatus> => {
    const event: ComplaintStatusEvent = { status: next, at: new Date().toISOString() }
    const nextHistory = [...current.statusHistory, event]

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from(TABLE)
        .update({ status: next, status_history: nextHistory })
        .eq('incident_id', incidentId)
      if (error) throw error
      return next
    }

    const all = readLocal()
    const updated = all.map(c => c.incidentId === incidentId
      ? { ...c, status: next, statusHistory: nextHistory }
      : c)
    writeLocal(updated)
    return next
  }, [])

  const advanceStatus = useCallback(async (incidentId: string): Promise<ComplaintStatus | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const idx = COMPLAINT_STATUSES.indexOf(current.status)
    if (idx === -1 || idx === COMPLAINT_STATUSES.length - 1) return current.status
    return writeStatus(incidentId, current, COMPLAINT_STATUSES[idx + 1])
  }, [getById, writeStatus])

  // Moves status forward to `target` only if the complaint hasn't already
  // reached or passed it. No-op (returns current status) otherwise.
  const setStatusAtLeast = useCallback(async (incidentId: string, target: ComplaintStatus): Promise<ComplaintStatus | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const currentIdx = COMPLAINT_STATUSES.indexOf(current.status)
    const targetIdx = COMPLAINT_STATUSES.indexOf(target)
    if (targetIdx <= currentIdx) return current.status
    return writeStatus(incidentId, current, target)
  }, [getById, writeStatus])

  const addEvidenceImage = useCallback(async (incidentId: string, image: Omit<EvidenceImage, 'id' | 'addedAt'>): Promise<EvidenceImage[] | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const entry: EvidenceImage = { ...image, id: crypto.randomUUID(), addedAt: new Date().toISOString() }
    const nextImages = [...current.evidenceImages, entry]

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from(TABLE)
        .update({ evidence_images: nextImages })
        .eq('incident_id', incidentId)
      if (error) throw error
      return nextImages
    }

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId ? { ...c, evidenceImages: nextImages } : c))
    return nextImages
  }, [getById])

  const removeEvidenceImage = useCallback(async (incidentId: string, imageId: string): Promise<EvidenceImage[] | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const nextImages = current.evidenceImages.filter(img => img.id !== imageId)

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from(TABLE)
        .update({ evidence_images: nextImages })
        .eq('incident_id', incidentId)
      if (error) throw error
      return nextImages
    }

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId ? { ...c, evidenceImages: nextImages } : c))
    return nextImages
  }, [getById])

  const addUpdate = useCallback(async (
    incidentId: string, note: string, actionPoints: string[] = [], actionPointsHi: string[] = [],
  ): Promise<ComplaintUpdate[] | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const entry: ComplaintUpdate = { id: crypto.randomUUID(), note, actionPoints, actionPointsHi, addedAt: new Date().toISOString() }
    const nextUpdates = [...current.updates, entry]

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from(TABLE)
        .update({ updates: nextUpdates })
        .eq('incident_id', incidentId)
      if (error) throw error
      return nextUpdates
    }

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId ? { ...c, updates: nextUpdates } : c))
    return nextUpdates
  }, [getById])

  return { getAll, save, getById, advanceStatus, setStatusAtLeast, addEvidenceImage, removeEvidenceImage, addUpdate }
}
