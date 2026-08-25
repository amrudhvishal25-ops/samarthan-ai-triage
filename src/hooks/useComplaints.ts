'use client'

import { useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  FraudType, UrgencyLevel, FreezeStep,
  ComplaintStatus, ComplaintStatusEvent, COMPLAINT_STATUSES,
} from '@/data/scenarios'

export interface EvidenceImage {
  id: string
  name: string
  dataUrl: string
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
  savedAt: string
  language: 'en' | 'hi'
  status: ComplaintStatus
  statusHistory: ComplaintStatusEvent[]
  evidenceImages: EvidenceImage[]
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
  saved_at: string
  language: 'en' | 'hi'
  status: ComplaintStatus
  status_history: ComplaintStatusEvent[]
  evidence_images: EvidenceImage[]
}

function fromRow(row: ComplaintRow): SavedComplaint {
  return {
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
    savedAt: row.saved_at,
    language: row.language,
    status: row.status,
    statusHistory: row.status_history,
    evidenceImages: row.evidence_images ?? [],
  }
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
    saved_at: c.savedAt,
    language: c.language,
    status: c.status,
    status_history: c.statusHistory,
    evidence_images: c.evidenceImages,
  }
}

function readLocal(): SavedComplaint[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
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

  const save = useCallback(async (complaint: Omit<SavedComplaint, 'savedAt' | 'status' | 'statusHistory' | 'evidenceImages'>) => {
    const now = new Date().toISOString()
    const record: SavedComplaint = {
      ...complaint,
      savedAt: now,
      status: 'SUBMITTED',
      statusHistory: [{ status: 'SUBMITTED', at: now }],
      evidenceImages: [],
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

  return { getAll, save, getById, advanceStatus, setStatusAtLeast, addEvidenceImage, removeEvidenceImage }
}
