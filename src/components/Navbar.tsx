'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, FileText, LogOut, User, ChevronDown, Zap, Sun, Moon } from 'lucide-react'
import { useAuth, DigiLockerUser } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { SupportedLanguage, LANGUAGE_MAP } from '@/lib/i18n/languages'
import { getTranslation } from '@/lib/i18n/translations'
import { useTriage } from '@/context/TriageContext'
import DigiLockerModal from './DigiLockerModal'
import LanguagePickerModal from './LanguagePickerModal'
import { BotMessageSquareIcon } from './BotMessageSquareIcon'

interface NavbarProps {
  language?: SupportedLanguage
  onLanguageToggle?: () => void
  onSelectLanguage?: (lang: SupportedLanguage) => void
}

export default function Navbar({ language: propLanguage, onLanguageToggle, onSelectLanguage }: NavbarProps) {
  const router = useRouter()
  const { getUser, signIn, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language: contextLanguage, setLanguage: setContextLanguage } = useTriage()
  
  const currentLanguage = propLanguage || contextLanguage || 'en'
  const handleSelectLanguage = (l: SupportedLanguage) => {
    if (onSelectLanguage) onSelectLanguage(l)
    setContextLanguage(l)
  }

  const [user, setUser] = useState<DigiLockerUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const t = getTranslation(currentLanguage)
  const currentLangMeta = LANGUAGE_MAP[currentLanguage] || LANGUAGE_MAP.en
  const hi = currentLanguage === 'hi'

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

      <LanguagePickerModal
        open={langPickerOpen}
        currentLanguage={currentLanguage}
        onSelect={handleSelectLanguage}
        onClose={() => setLangPickerOpen(false)}
      />

      {/* Unified Sticky Header Container (prevents banner wrapping overlaps on mobile) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        {/* Subtle National Tricolor Ribbon */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        {/* Build What Moves India Hackathon Simulation Disclaimer Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[10.5px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
              🏆 Build What Moves India Hackathon
            </span>
            <span className="text-amber-600/60 dark:text-amber-400/60 hidden sm:inline">•</span>
            <span>{t.disclaimer}</span>
          </div>
        </div>

        <header className="border-b border-zinc-200/80 transition-all">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 h-[58px] sm:h-[72px] flex items-center justify-between">

            {/* Logo */}
            <button onClick={() => router.push('/')} className="flex items-center gap-2 sm:gap-3 group text-start">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-primary flex items-center justify-center text-white group-hover:bg-primary-hover transition-colors shadow-xs shrink-0">
                <BotMessageSquareIcon size={19} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-zinc-950 dark:text-white text-sm sm:text-base md:text-lg tracking-tight">
                    {t.appName}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary-tint dark:bg-blue-950/60 border border-primary/20 dark:border-blue-800/60 px-1.5 py-0.5 rounded font-mono">
                    {t.citizenHelpdesk}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 -mt-0.5 hidden md:block">
                  {t.subTitle}
                </span>
              </div>
            </button>

            {/* Right side: Action Items */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">

              {/* 1. My Complaints */}
              <button
                onClick={() => router.push('/complaints')}
                aria-label={t.nav.myComplaints}
                title={t.nav.myComplaints}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 border border-border rounded-md px-2.5 sm:px-4 py-2 sm:py-2.5 h-9 sm:h-10 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="hidden md:inline">{t.nav.myComplaints}</span>
              </button>

              {/* 2. Language Selector Button (Opens 12-language modal) */}
              <button
                onClick={() => setLangPickerOpen(true)}
                aria-label={t.nav.selectLanguage}
                title={t.nav.selectLanguage}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-zinc-700 border border-border hover:bg-zinc-100/80 rounded-md px-2.5 sm:px-3 py-2 sm:py-2.5 h-9 sm:h-10 transition-colors cursor-pointer shrink-0"
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 shrink-0" />
                <span className="font-semibold whitespace-nowrap">{currentLangMeta.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:inline" />
              </button>

              {/* 3. Theme Toggle (Light / Dark Mode) */}
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? (hi ? 'लाइट मोड' : 'Switch to Light Mode') : (hi ? 'डार्क मोड' : 'Switch to Dark Mode')}
                className="inline-flex items-center justify-center text-zinc-700 hover:text-zinc-950 border border-border hover:bg-zinc-100/80 rounded-md w-9 sm:w-10 h-9 sm:h-10 transition-colors cursor-pointer shrink-0"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-600" />
                )}
              </button>

              {/* 4. Auth button / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border border-border rounded-md px-2.5 sm:px-4 py-2 sm:py-2.5 h-9 sm:h-10 transition-colors cursor-pointer shrink-0"
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-orange-500 flex items-center justify-center shrink-0">
                      <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <span className="max-w-[70px] sm:max-w-none truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-1.5 w-56 bg-white border border-border rounded-lg shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                        <p className="text-xs font-semibold text-zinc-900">{user.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Aadhaar: {user.aadhaar}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <p className="text-xs text-emerald-600 font-medium">{t.nav.digiLockerVerified}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { router.push('/complaints'); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors text-left font-medium"
                      >
                        <FileText className="w-4 h-4 text-zinc-500" />
                        {t.nav.myComplaints}
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        {t.nav.signOut}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => {
                      signIn({ name: 'Parichay Prabhu', aadhaar: '****-****-8421' })
                      setUser(getUser())
                    }}
                    className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 border border-border rounded-md px-3.5 py-2.5 h-10 transition-colors"
                    title="Direct 1-Click Login (Verified Citizen)"
                  >
                    <Zap className="w-4 h-4 text-zinc-400" />
                    <span>⚡ Instant</span>
                  </button>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-md px-3 sm:px-5 py-2 sm:py-2.5 h-9 sm:h-10 transition-colors cursor-pointer shrink-0"
                  >
                    <span className="hidden sm:inline">{t.nav.signInDigiLocker}</span>
                    <span className="sm:hidden">DigiLocker</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  )
}
