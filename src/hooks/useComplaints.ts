'use client'

import { useCallback } from 'react'
import {
  FraudType, UrgencyLevel, FreezeStep, ApplicableLaw,
  ComplaintStatus, ComplaintStatusEvent, COMPLAINT_STATUSES,
  RecommendedChannel,
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
  fraudsterIdentifier: string
  complainantName: string
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
  recommendedChannel: RecommendedChannel
  recommendedChannelTarget: string
  savedAt: string
  language: 'en' | 'hi'
  status: ComplaintStatus
  statusHistory: ComplaintStatusEvent[]
  evidenceImages: EvidenceImage[]
  updates: ComplaintUpdate[]
}

const STORAGE_KEY = 'samarthan_complaints'

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
    recommendedChannel: c.recommendedChannel ?? 'helpline',
    recommendedChannelTarget: c.recommendedChannelTarget ?? '1930',
  } as SavedComplaint
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: Record<string, any>): SavedComplaint {
  return normalize({
    incidentId: row.incident_id,
    fraudType: row.fraud_type,
    fraudsterIdentifier: row.fraudster_identifier ?? row.victim_name ?? '',
    complainantName: row.complainant_name ?? '',
    amount: Number(row.amount) || 0,
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
    recommendedChannel: row.recommended_channel,
    recommendedChannelTarget: row.recommended_channel_target,
    savedAt: row.saved_at,
    language: row.language,
    status: row.status,
    statusHistory: row.status_history,
    evidenceImages: row.evidence_images,
    updates: row.updates,
  })
}

function toRow(c: SavedComplaint) {
  return {
    incident_id: c.incidentId,
    fraud_type: c.fraudType,
    fraudster_identifier: c.fraudsterIdentifier,
    complainant_name: c.complainantName,
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
    recommended_channel: c.recommendedChannel,
    recommended_channel_target: c.recommendedChannelTarget,
    saved_at: c.savedAt,
    language: c.language,
    status: c.status,
    status_history: c.statusHistory,
    evidence_images: c.evidenceImages,
    updates: c.updates,
  }
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // QuotaExceededError — strip base64 evidence images and retry
    try {
      const slim = all.map(c => ({ ...c, evidenceImages: c.evidenceImages.map(img => ({ ...img, dataUrl: '' })) }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
    } catch { /* give up on local persistence */ }
  }
}

function invalidateCache() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).__complaintsCache
}

async function apiGet(id?: string): Promise<Response> {
  const url = id ? `/api/complaints?id=${encodeURIComponent(id)}` : '/api/complaints'
  return fetch(url)
}

async function apiPost(body: unknown): Promise<Response> {
  return fetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

async function apiPatch(body: unknown): Promise<Response> {
  return fetch('/api/complaints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

const CACHE_TTL = 30000 // 30s

export function useComplaints() {
  const getAll = useCallback(async (): Promise<SavedComplaint[]> => {
    // Check memory cache first
    const cached = (globalThis as any).__complaintsCache
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.data
    }

    try {
      const res = await apiGet()
      if (res.ok) {
        const rows = await res.json()
        const remote: SavedComplaint[] = rows.map(fromRow)
        writeLocal(remote)
        // Cache in memory
        ;(globalThis as any).__complaintsCache = { data: remote, time: Date.now() }
        return remote
      }
    } catch { /* fall through */ }
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

    const all = readLocal()
    if (!all.some(c => c.incidentId === complaint.incidentId)) {
      writeLocal([record, ...all])
    }

    try {
      await apiPost(toRow(record))
    } catch { /* localStorage already saved */ }

    invalidateCache()
  }, [])

  const getById = useCallback(async (incidentId: string): Promise<SavedComplaint | undefined> => {
    try {
      const res = await apiGet(incidentId)
      if (res.ok) {
        const row = await res.json()
        if (row) return fromRow(row)
      }
    } catch { /* fall through */ }
    return readLocal().find(c => c.incidentId === incidentId)
  }, [])

  const writeStatus = useCallback(async (
    incidentId: string, current: SavedComplaint, next: ComplaintStatus,
  ): Promise<ComplaintStatus> => {
    const event: ComplaintStatusEvent = { status: next, at: new Date().toISOString() }
    const nextHistory = [...current.statusHistory, event]

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId
      ? { ...c, status: next, statusHistory: nextHistory }
      : c))

    try {
      await apiPatch({ incident_id: incidentId, status: next, status_history: nextHistory })
    } catch { /* localStorage already updated */ }

    invalidateCache()
    return next
  }, [])

  const advanceStatus = useCallback(async (incidentId: string): Promise<ComplaintStatus | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const idx = COMPLAINT_STATUSES.indexOf(current.status)
    if (idx === -1 || idx === COMPLAINT_STATUSES.length - 1) return current.status
    return writeStatus(incidentId, current, COMPLAINT_STATUSES[idx + 1])
  }, [getById, writeStatus])

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

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId ? { ...c, evidenceImages: nextImages } : c))

    try {
      await apiPatch({ incident_id: incidentId, evidence_images: nextImages })
    } catch { /* localStorage already updated */ }

    invalidateCache()
    return nextImages
  }, [getById])

  const removeEvidenceImage = useCallback(async (incidentId: string, imageId: string): Promise<EvidenceImage[] | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const nextImages = current.evidenceImages.filter(img => img.id !== imageId)

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId ? { ...c, evidenceImages: nextImages } : c))

    try {
      await apiPatch({ incident_id: incidentId, evidence_images: nextImages })
    } catch { /* localStorage already updated */ }

    invalidateCache()
    return nextImages
  }, [getById])

  const addUpdate = useCallback(async (
    incidentId: string, note: string, actionPoints: string[] = [], actionPointsHi: string[] = [],
  ): Promise<ComplaintUpdate[] | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const entry: ComplaintUpdate = { id: crypto.randomUUID(), note, actionPoints, actionPointsHi, addedAt: new Date().toISOString() }
    const nextUpdates = [...current.updates, entry]

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId ? { ...c, updates: nextUpdates } : c))

    try {
      await apiPatch({ incident_id: incidentId, updates: nextUpdates })
    } catch { /* localStorage already updated */ }

    invalidateCache()
    return nextUpdates
  }, [getById])

  return { getAll, save, getById, advanceStatus, setStatusAtLeast, addEvidenceImage, removeEvidenceImage, addUpdate }
}
