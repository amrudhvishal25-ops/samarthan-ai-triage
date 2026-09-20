'use client'

import { useCallback } from 'react'
import {
  FraudType, UrgencyLevel, FreezeStep, ApplicableLaw,
  ComplaintStatus, ComplaintStatusEvent, COMPLAINT_STATUSES,
  RecommendedChannel,
} from '@/data/scenarios'
import { SupportedLanguage } from '@/lib/i18n/languages'

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
  summaryRegional?: string
  complaintDraft: string
  complaintDraftHi: string
  complaintDraftRegional?: string
  frauderContact: string
  bankName: string
  accountNumber: string
  upiId?: string
  ifscCode?: string
  utrNumber?: string
  timeline: string
  freezeSteps: FreezeStep[]
  applicableLaws: ApplicableLaw[]
  recommendedChannel: RecommendedChannel
  recommendedChannelTarget: string
  savedAt: string
  language: SupportedLanguage
  status: ComplaintStatus
  statusHistory: ComplaintStatusEvent[]
  evidenceImages: EvidenceImage[]
  updates: ComplaintUpdate[]
}

const STORAGE_KEY = 'samarthan_complaints'

function normalize(c: Partial<SavedComplaint>): SavedComplaint {
  const isRegional = c.language && c.language !== 'en' && c.language !== 'hi'
  return {
    ...c,
    // Coerce every field the UI does math/string ops on, so a partial or
    // legacy record can never crash the dashboard / complaints list.
    incidentId: c.incidentId ?? '',
    fraudType: c.fraudType ?? 'Other Cyber Crime',
    fraudsterIdentifier: c.fraudsterIdentifier ?? 'Not Identified',
    complainantName: c.complainantName ?? 'Anonymous Complainant',
    amount: Number(c.amount) || 0,
    urgencyLevel: c.urgencyLevel ?? 'HIGH',
    summary: c.summary ?? '',
    summaryHi: c.summaryHi ?? '',
    summaryRegional: c.summaryRegional ?? (isRegional ? c.summaryHi : undefined),
    complaintDraft: c.complaintDraft ?? '',
    complaintDraftHi: c.complaintDraftHi ?? '',
    complaintDraftRegional: c.complaintDraftRegional ?? (isRegional ? c.complaintDraftHi : undefined),
    frauderContact: c.frauderContact ?? 'Not Provided',
    bankName: c.bankName ?? 'Not Provided',
    accountNumber: c.accountNumber ?? 'Not Provided',
    upiId: c.upiId,
    ifscCode: c.ifscCode,
    utrNumber: c.utrNumber,
    timeline: c.timeline ?? 'Not Provided',
    language: c.language ?? 'en',
    savedAt: c.savedAt ?? new Date().toISOString(),
    freezeSteps: Array.isArray(c.freezeSteps) ? c.freezeSteps : [],
    applicableLaws: Array.isArray(c.applicableLaws) ? c.applicableLaws : [],
    statusHistory: Array.isArray(c.statusHistory) ? c.statusHistory : [],
    evidenceImages: Array.isArray(c.evidenceImages) ? c.evidenceImages : [],
    updates: (Array.isArray(c.updates) ? c.updates : []).map(u => ({
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
  const isRegional = row.language && row.language !== 'en' && row.language !== 'hi'

  const resolvedUtr = row.utr_number ||
    (row.frauder_contact || '').match(/(?:utr|ref|txn|transaction|imps|neft)?[ :#-]*([0-9]{12})\b/i)?.[1] ||
    (row.complaint_draft || '').match(/(?:utr|ref|transaction)?[ :#-]*([0-9]{12})\b/i)?.[1] ||
    undefined

  const resolvedIfsc = row.ifsc_code ||
    (row.frauder_contact || '').match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/)?.[1] ||
    (row.complaint_draft || '').match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/)?.[1] ||
    undefined

  const resolvedUpi = row.upi_id ||
    (row.frauder_contact || '').match(/[\w.-]+@[\w.-]+/)?.[0] ||
    (row.complaint_draft || '').match(/[\w.-]+@[\w.-]+/)?.[0] ||
    undefined

  const detectedBankMatch = (row.complaint_draft || row.summary || '').match(/\b(hdfc|sbi|state bank|icici|axis|kotak|pnb|punjab national|bank of baroda|canara|union bank|indusind|yes bank|idfc)\b/i)
  const resolvedBank = (row.bank_name && !row.bank_name.toLowerCase().includes('not provided') && !row.bank_name.toLowerCase().includes('bank nodal desk'))
    ? row.bank_name
    : (detectedBankMatch ? detectedBankMatch[0].toUpperCase() + (detectedBankMatch[0].toLowerCase().includes('bank') ? '' : ' Bank') : row.bank_name)

  const hasFinancialLoss = (Number(row.amount) || 0) > 0 || resolvedUtr || (resolvedBank && resolvedBank !== 'Not Provided' && resolvedBank !== 'Bank Nodal Desk')
  let resolvedChannel = row.recommended_channel
  let resolvedTarget = row.recommended_channel_target
  let resolvedFraudType = row.fraud_type

  if (hasFinancialLoss && resolvedChannel === 'agency' && (resolvedTarget === 'UIDAI' || resolvedTarget === 'Aadhaar')) {
    resolvedChannel = 'bank'
    resolvedTarget = (resolvedBank && resolvedBank !== 'Not Provided' && resolvedBank !== 'Bank Nodal Desk') ? resolvedBank : 'the bank'
  }
  if (hasFinancialLoss && resolvedFraudType === 'Identity Theft') {
    resolvedFraudType = 'Financial Fraud'
  }

  return normalize({
    incidentId: row.incident_id,
    fraudType: resolvedFraudType,
    fraudsterIdentifier: row.fraudster_identifier ?? row.victim_name ?? '',
    complainantName: row.complainant_name ?? '',
    amount: Number(row.amount) || 0,
    urgencyLevel: row.urgency_level,
    summary: row.summary,
    summaryHi: row.summary_hi,
    summaryRegional: row.summary_regional || (isRegional ? row.summary_hi : undefined),
    complaintDraft: row.complaint_draft,
    complaintDraftHi: row.complaint_draft_hi,
    complaintDraftRegional: row.complaint_draft_regional || (isRegional ? row.complaint_draft_hi : undefined),
    frauderContact: row.frauder_contact,
    bankName: resolvedBank || 'Not Provided',
    accountNumber: row.account_number,
    upiId: resolvedUpi,
    ifscCode: resolvedIfsc,
    utrNumber: resolvedUtr,
    timeline: row.timeline,
    freezeSteps: row.freeze_steps,
    applicableLaws: row.applicable_laws,
    recommendedChannel: resolvedChannel,
    recommendedChannelTarget: resolvedTarget,
    savedAt: row.saved_at,
    language: row.language,
    status: row.status,
    statusHistory: row.status_history,
    evidenceImages: row.evidence_images,
    updates: row.updates,
  })
}

function toRow(c: SavedComplaint) {
  const isRegional = c.language && c.language !== 'en' && c.language !== 'hi'
  return {
    incident_id: c.incidentId,
    fraud_type: c.fraudType,
    fraudster_identifier: c.fraudsterIdentifier,
    complainant_name: c.complainantName,
    amount: c.amount,
    urgency_level: c.urgencyLevel,
    summary: c.summary,
    summary_hi: (isRegional ? c.summaryRegional : c.summaryHi) || c.summaryHi || '',
    complaint_draft: c.complaintDraft,
    complaint_draft_hi: (isRegional ? c.complaintDraftRegional : c.complaintDraftHi) || c.complaintDraftHi || '',
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
    // QuotaExceededError - strip base64 evidence images and retry
    try {
      const slim = all.map(c => ({ ...c, evidenceImages: c.evidenceImages.map(img => ({ ...img, dataUrl: '' })) }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
    } catch { /* give up on local persistence */ }
  }
}

export function useComplaints() {
  const getAll = useCallback(async (_forceRefresh = false): Promise<SavedComplaint[]> => {
    // Reports never leave this browser. This deliberately avoids storing
    // sensitive complaint details in the shared demo backend.
    return readLocal()
  }, [])

  const save = useCallback(async (complaint: Omit<SavedComplaint, 'savedAt' | 'status' | 'statusHistory' | 'evidenceImages' | 'updates'>) => {
    const now = new Date().toISOString()
    // normalize() coerces every field to its correct type, so a partial or
    // oddly-typed triage result can never produce a numeric-column INSERT
    // failure (which would silently drop the complaint from the DB).
    const record: SavedComplaint = normalize({
      ...complaint,
      savedAt: now,
      status: 'SUBMITTED',
      statusHistory: [{ status: 'SUBMITTED', at: now }],
      evidenceImages: [],
      updates: [],
    })

    const all = readLocal()
    const idx = all.findIndex(c => c.incidentId === complaint.incidentId)
    if (idx >= 0) {
      // Preserve status, history, images, and updates when updating an existing complaint
      all[idx] = {
        ...record,
        status: all[idx].status || record.status,
        statusHistory: all[idx].statusHistory?.length ? all[idx].statusHistory : record.statusHistory,
        evidenceImages: all[idx].evidenceImages || [],
        updates: all[idx].updates || [],
        savedAt: all[idx].savedAt || record.savedAt,
      }
      writeLocal([...all])
    } else {
      writeLocal([record, ...all])
    }

  }, [])

  const getById = useCallback(async (incidentId: string): Promise<SavedComplaint | undefined> => {
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

    return nextImages
  }, [getById])

  const removeEvidenceImage = useCallback(async (incidentId: string, imageId: string): Promise<EvidenceImage[] | null> => {
    const current = await getById(incidentId)
    if (!current) return null
    const nextImages = current.evidenceImages.filter(img => img.id !== imageId)

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

    const all = readLocal()
    writeLocal(all.map(c => c.incidentId === incidentId ? { ...c, updates: nextUpdates } : c))

    return nextUpdates
  }, [getById])

  return { getAll, save, getById, advanceStatus, setStatusAtLeast, addEvidenceImage, removeEvidenceImage, addUpdate }
}
