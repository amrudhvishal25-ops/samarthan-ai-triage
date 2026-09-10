'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Globe } from 'lucide-react'
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/i18n/languages'

interface LanguagePickerModalProps {
  open: boolean
  currentLanguage: SupportedLanguage
  onSelect: (lang: SupportedLanguage) => void
  onClose: () => void
}

export default function LanguagePickerModal({
  open,
  currentLanguage,
  onSelect,
  onClose,
}: LanguagePickerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
              onClose()
            }
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="lang-modal-title" className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                    Select Your Language / भाषा चुनें
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Choose from 12 official Indian languages
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close language selector"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Languages Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelect(lang.code)
                      onClose()
                    }}
                    className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {lang.nativeName}
                        </span>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          ({lang.name})
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {lang.sampleState}
                      </span>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-400" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer Note */}
            <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-center shrink-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                🎙️ You can speak or write in any of these languages for automated AI triage and legal complaint drafting.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
