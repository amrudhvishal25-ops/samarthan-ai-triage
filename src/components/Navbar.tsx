'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, FileText, LogOut, User, ChevronDown, Zap } from 'lucide-react'
import { useAuth, DigiLockerUser } from '@/hooks/useAuth'
import DigiLockerModal from './DigiLockerModal'
import { BotMessageSquareIcon } from './BotMessageSquareIcon'

interface NavbarProps {
  language: 'en' | 'hi'
  onLanguageToggle: () => void
}

export default function Navbar({ language, onLanguageToggle }: NavbarProps) {
  const router = useRouter()
  const { getUser, signIn, signOut } = useAuth()
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

      <header className="border-b border-zinc-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-[74px] flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white group-hover:bg-primary-hover transition-colors">
              <BotMessageSquareIcon size={21} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-950 text-base md:text-lg tracking-tight">Samarthan</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-tint border border-primary/20 px-2 py-0.5 rounded">
                AI Triage
              </span>
            </div>
          </button>

          {/* Right side: 3 Action Items scaled up by ~31% */}
          <div className="flex items-center gap-2.5">

            {/* 1. My Complaints */}
            <button
              onClick={() => router.push('/complaints')}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 border border-border rounded-md px-4 py-2.5 h-10 transition-colors"
            >
              <FileText className="w-4 h-4 text-zinc-500" />
              <span className="hidden sm:inline">{hi ? 'मेरी शिकायतें' : 'My Complaints'}</span>
            </button>

            {/* 2. Language toggle */}
            <button
              onClick={onLanguageToggle}
              aria-label="Toggle language between English and Hindi"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 border border-border hover:bg-zinc-100/80 rounded-md px-3.5 sm:px-4 py-2.5 h-10 transition-colors"
            >
              <Globe className="w-4 h-4 text-zinc-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* 3. Auth button / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border border-border rounded-md px-4 py-2.5 h-10 transition-colors"
                >
                  <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-border rounded-lg shadow-sm overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                      <p className="text-xs font-semibold text-zinc-900">{user.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Aadhaar: {user.aadhaar}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-xs text-emerald-600 font-medium">DigiLocker Verified</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { router.push('/complaints'); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors text-left font-medium"
                    >
                      <FileText className="w-4 h-4 text-zinc-500" />
                      {hi ? 'मेरी शिकायतें' : 'My Complaints'}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      {hi ? 'साइन आउट' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    signIn({ name: 'Parichay Prabhu', aadhaar: '****-****-8421' })
                    setUser(getUser())
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 border border-border rounded-md px-3.5 py-2.5 h-10 transition-colors"
                  title="Direct 1-Click Login (Verified Citizen)"
                >
                  <Zap className="w-4 h-4 text-zinc-400" />
                  <span>{hi ? 'सीधा लॉगिन' : 'Direct Login'}</span>
                </button>

                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-md px-4 sm:px-5 py-2.5 h-10 transition-colors"
                >
                  <span className="hidden sm:inline">{hi ? 'डिजीलॉकर से साइन इन करें' : 'Sign in with DigiLocker'}</span>
                  <span className="sm:hidden">{hi ? 'लॉगिन' : 'Sign in'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
