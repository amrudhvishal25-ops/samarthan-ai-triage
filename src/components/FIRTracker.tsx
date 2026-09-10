import React, { useState } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { COMPLAINT_STATUSES, ComplaintStatus } from '@/data/scenarios'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { COMPLAINT_STATUS_LABELS_12, FIR_TRACKER_I18N } from '@/lib/i18n/componentTranslations'

interface FIRTrackerProps {
  hi?: boolean
  language?: SupportedLanguage
  status: ComplaintStatus
  onAdvance: () => Promise<void> | void
}

export default function FIRTracker({ hi, language, status, onAdvance }: FIRTrackerProps) {
  const [advancing, setAdvancing] = useState(false)
  const currentIdx = COMPLAINT_STATUSES.indexOf(status)
  const isFinal = currentIdx === COMPLAINT_STATUSES.length - 1
  const lang: SupportedLanguage = language || (hi ? 'hi' : 'en')
  const loc = FIR_TRACKER_I18N[lang] || FIR_TRACKER_I18N.en

  const handleAdvance = async () => {
    setAdvancing(true)
    try {
      await onAdvance()
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
      <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-wider">
        {loc.header}
      </h3>

      <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-6">
        {COMPLAINT_STATUSES.map((s, idx) => {
          const isCompleted = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isPending = idx > currentIdx

          return (
            <div key={s} className="relative pl-6">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400 shadow-xs'
                    : isCurrent
                    ? 'border-primary bg-primary dark:border-blue-400 dark:bg-blue-400 ring-4 ring-blue-500/20 animate-pulse'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                }`}
              />

              <div className={isPending ? 'opacity-40' : ''}>
                <h4
                  className={`text-sm font-semibold flex items-center gap-2 ${
                    isCompleted
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isCurrent
                      ? 'text-primary dark:text-blue-400 font-bold'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <span>{COMPLAINT_STATUS_LABELS_12[s]?.[lang] || COMPLAINT_STATUS_LABELS_12[s]?.en || s}</span>
                  {s !== 'SUBMITTED' && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 rounded-full px-2 py-0.5">
                      {loc.liveBadge}
                    </span>
                  )}
                </h4>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
          {loc.demoControls}
        </p>
        <button
          type="button"
          onClick={handleAdvance}
          disabled={advancing || isFinal}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-200 text-xs font-semibold py-2.5 transition-all shadow-xs"
        >
          {advancing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400" />
          )}
          {isFinal ? loc.resolvedBtn : loc.advanceBtn}
        </button>
      </div>
    </div>
  )
}
