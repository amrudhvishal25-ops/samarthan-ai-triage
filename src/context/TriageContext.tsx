'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { TriageResult } from '@/data/scenarios'

type Language = 'en' | 'hi'
type InputType = 'voice' | 'screenshot' | 'text'

interface TriageContextValue {
  language: Language
  setLanguage: (l: Language) => void
  scenarioId: string | null
  setScenarioId: (id: string | null) => void
  inputType: InputType
  setInputType: (t: InputType) => void
  triageResult: TriageResult | null
  setTriageResult: (r: TriageResult | null) => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
  sharedImage: File | null
  setSharedImage: (f: File | null) => void
  reset: () => void
}

const TriageContext = createContext<TriageContextValue | undefined>(undefined)

const STORAGE_KEY = 'samarthan_triage_v1'

export function TriageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [scenarioId, setScenarioId] = useState<string | null>(null)
  const [inputType, setInputType] = useState<InputType>('text')
  const [triageResult, setTriageResultState] = useState<TriageResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sharedImage, setSharedImage] = useState<File | null>(null)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.triageResult) setTriageResultState(parsed.triageResult)
        if (parsed.scenarioId) setScenarioId(parsed.scenarioId)
        if (parsed.language) setLanguage(parsed.language)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const setLanguage = (l: Language) => {
    setLanguageState(l)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : {}
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, language: l }))
    } catch { /* ignore storage errors */ }
  }

  const setTriageResult = (r: TriageResult | null) => {
    setTriageResultState(r)
    try {
      if (r) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ triageResult: r, scenarioId, language }))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore storage errors
    }
  }

  const reset = () => {
    setScenarioId(null)
    setInputType('text')
    setTriageResultState(null)
    setIsLoading(false)
    setSharedImage(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const value = React.useMemo(() => ({
    language, setLanguage,
    scenarioId, setScenarioId,
    inputType, setInputType,
    triageResult, setTriageResult,
    isLoading, setIsLoading,
    sharedImage, setSharedImage,
    reset,
  }), [language, scenarioId, inputType, triageResult, isLoading, sharedImage])

  return (
    <TriageContext.Provider value={value}>
      {children}
    </TriageContext.Provider>
  )
}

export function useTriage() {
  const ctx = useContext(TriageContext)
  if (!ctx) throw new Error('useTriage must be used within <TriageProvider>')
  return ctx
}
