'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Globe, FileText, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth, DigiLockerUser } from '@/hooks/useAuth'
import DigiLockerModal from './DigiLockerModal'

interface NavbarProps {
  language: 'en' | 'hi'
  onLanguageToggle: () => void
}

export default function Navbar({ language, onLanguageToggle }: NavbarProps) {
  const router = useRouter()
  const { getUser, signOut } = useAuth()
  const [user, setUser] = useState<DigiLockerUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const hi = language === 'hi'

  // Reactively update when auth state changes
  useEffect(() => {
    setUser(getUser())
    const handler = () => setUser(getUser())
    window.addEventListener('samarthan_auth_change', handler)
    return () => window.removeEventListener('samarthan_auth_change', handler)
  }, [getUser])

  const handleSignOut = () => {
    signOut()
    setUserMenuOpen(false)
  }

  return (
    <>
      <DigiLockerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setUser(getUser())}
      />

      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => router.push('/')} className="flex items-center gap-2 h-auto min-h-0">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight">Samarthan</span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* My Complaints */}
            <button
              onClick={() => router.push('/complaints')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 transition-colors h-auto min-h-0"
            >
              <FileText className="w-3.5 h-3.5" />
              {hi ? 'मेरी शिकायतें' : 'My Complaints'}
            </button>

            {/* Language toggle */}
            <button
              onClick={onLanguageToggle}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 rounded-md px-3 py-1.5 transition-colors h-auto min-h-0"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Auth button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md px-3 py-1.5 transition-colors h-auto min-h-0"
                >
                  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                  {user.name.split(' ')[0]}
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-900">{user.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Aadhaar: {user.aadhaar}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <p className="text-xs text-green-600 font-medium">DigiLocker Verified</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { router.push('/complaints'); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors text-left h-auto min-h-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {hi ? 'मेरी शिकायतें' : 'My Complaints'}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left h-auto min-h-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {hi ? 'साइन आउट' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-700 rounded-md px-3 py-1.5 transition-colors h-auto min-h-0"
              >
                Sign in with DigiLocker
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
