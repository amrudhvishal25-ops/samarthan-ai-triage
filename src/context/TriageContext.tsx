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
  reset: () => void
}

const TriageContext = createContext<TriageContextValue | undefined>(undefined)

const STORAGE_KEY = 'samarthan_triage_v1'

export function TriageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [scenarioId, setScenarioId] = useState<string | null>(null)
  const [inputType, setInputType] = useState<InputType>('text')
  const [triageResult, setTriageResultState] = useState<TriageResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const setTriageResult = (r: TriageResult | null) => {
    setTriageResultState(r)
    try {
      if (r) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ triageResult: r, scenarioId, language }))
      }
    } catch {
      // ignore storage errors
    }
  }

  const reset = () => {
    setScenarioId(null)
    setTriageResultState(null)
    setIsLoading(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  return (
    <TriageContext.Provider
      value={{
        language, setLanguage,
        scenarioId, setScenarioId,
        inputType, setInputType,
        triageResult, setTriageResult,
        isLoading, setIsLoading,
        reset,
      }}
    >
      {children}
    </TriageContext.Provider>
  )
}

export function useTriage() {
  const ctx = useContext(TriageContext)
  if (!ctx) throw new Error('useTriage must be used within <TriageProvider>')
  return ctx
}
