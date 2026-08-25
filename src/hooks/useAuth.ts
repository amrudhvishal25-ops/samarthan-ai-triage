'use client'

import { useCallback } from 'react'

export interface DigiLockerUser {
  name: string
  aadhaar: string   // masked e.g. ****-****-1234
  dob: string
  verified: boolean
}

const STORAGE_KEY = 'samarthan_user'

// Simulated DigiLocker user pool — in prod this comes from the OAuth callback
const MOCK_USER: DigiLockerUser = {
  name: 'Pratham Kamath',
  aadhaar: '****-****-8421',
  dob: '15/03/1994',
  verified: true,
}

export function useAuth() {
  const getUser = useCallback((): DigiLockerUser | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.name === 'Aarav Sharma' || !parsed.name) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER))
          return MOCK_USER
        }
        return parsed
      }
      // Auto-initialize on first visit — simulate a pre-authenticated DigiLocker session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER))
      return MOCK_USER
    } catch {
      return null
    }
  }, [])

  const signIn = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER))
    window.dispatchEvent(new Event('samarthan_auth_change'))
  }, [])

  const signOut = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('samarthan_auth_change'))
  }, [])

  return { getUser, signIn, signOut }
}
