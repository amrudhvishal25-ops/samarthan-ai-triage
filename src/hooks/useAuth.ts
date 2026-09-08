'use client'

import { useCallback } from 'react'

export interface DigiLockerUser {
  name: string
  aadhaar: string   // masked e.g. ****-****-1234
  dob: string
  verified: boolean
}

export const DEFAULT_USER: DigiLockerUser = {
  name: 'Parichay Prabhu',
  aadhaar: '****-****-8421',
  dob: '15/03/1994',
  verified: true,
}

const STORAGE_KEY = 'samarthan_user'

export function useAuth() {
  const getUser = useCallback((): DigiLockerUser | null => {
    if (typeof window === 'undefined') return DEFAULT_USER
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'SIGNED_OUT') return null
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER))
        return DEFAULT_USER
      }
      return JSON.parse(raw)
    } catch {
      return DEFAULT_USER
    }
  }, [])

  const signIn = useCallback((customUser?: Partial<DigiLockerUser>) => {
    if (typeof window === 'undefined') return
    const user: DigiLockerUser = {
      name: customUser?.name?.trim() || 'Parichay Prabhu',
      aadhaar: customUser?.aadhaar?.trim() || '****-****-8421',
      dob: customUser?.dob || '15/03/1994',
      verified: true,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('samarthan_auth_change'))
    return user
  }, [])

  const signOut = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, 'SIGNED_OUT')
    window.dispatchEvent(new Event('samarthan_auth_change'))
  }, [])

  return { getUser, signIn, signOut }
}
