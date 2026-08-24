'use client'

import { useCallback } from 'react'
import { FraudType, UrgencyLevel, FreezeStep } from '@/data/scenarios'

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
}

const STORAGE_KEY = 'samarthan_complaints'

export function useComplaints() {
  const getAll = useCallback((): SavedComplaint[] => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [])

  const save = useCallback((complaint: Omit<SavedComplaint, 'savedAt'>) => {
    if (typeof window === 'undefined') return
    const all = getAll()
    // Avoid duplicate saves for the same incidentId
    const exists = all.some(c => c.incidentId === complaint.incidentId)
    if (exists) return
    const updated = [{ ...complaint, savedAt: new Date().toISOString() }, ...all]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [getAll])

  const getById = useCallback((incidentId: string): SavedComplaint | undefined => {
    return getAll().find(c => c.incidentId === incidentId)
  }, [getAll])

  return { getAll, save, getById }
}
