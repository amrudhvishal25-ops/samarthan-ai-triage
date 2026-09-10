'use client'

import { useState } from 'react'
import { MessageSquarePlus, Clock, Loader2, ListChecks } from 'lucide-react'
import { ComplaintUpdate } from '@/hooks/useComplaints'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { COMPLAINT_UPDATES_I18N } from '@/lib/i18n/componentTranslations'

interface ComplaintUpdatesProps {
  hi?: boolean
  language?: SupportedLanguage
  updates: ComplaintUpdate[]
  onAdd: (note: string) => Promise<void> | void
}

export default function ComplaintUpdates({ hi, language, updates = [], onAdd }: ComplaintUpdatesProps) {
  const lang: SupportedLanguage = language || (hi ? 'hi' : 'en')
  const loc = COMPLAINT_UPDATES_I18N[lang] || COMPLAINT_UPDATES_I18N.en
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!note.trim()) return
    setSubmitting(true)
    try {
      await onAdd(note.trim())
      setNote('')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const allActionPoints = updates.flatMap(u => (hi ? u.actionPointsHi : u.actionPoints) || [])

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-wide flex items-center gap-2">
        <MessageSquarePlus className="w-4 h-4 text-blue-500" />
        {loc.header}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        {loc.subtitle}
      </p>

      <div className="flex flex-col gap-2 mb-4">
        <label htmlFor="update-note" className="sr-only">{loc.header}</label>
        <div className="flex gap-2">
          <textarea
            id="update-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={loc.placeholder}
            className="flex-1 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !note.trim()}
            className="flex-shrink-0 self-end flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md px-4 py-3 min-h-[44px] text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : loc.addBtn}
          </button>
        </div>
      </div>

      {/* Follow-Up Action Box — High contrast, crystal clear in both light and dark mode */}
      {allActionPoints.length > 0 && (
        <div className="mb-4 border border-amber-300 dark:border-amber-500/40 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-2 mb-2.5">
            <ListChecks className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{loc.followUpTitle}</span>
          </p>
          <ul className="space-y-2">
            {allActionPoints.map((point, i) => (
              <li key={i} className="text-xs text-amber-950 dark:text-amber-100 font-medium leading-relaxed flex items-start gap-2">
                <span className="text-amber-500 dark:text-amber-400 text-sm leading-none mt-0.5">•</span>
                <span className="flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Updates Timeline List */}
      {updates.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          {[...updates].reverse().map((u) => {
            const points = hi ? u.actionPointsHi : u.actionPoints
            const formattedDate = formatDate(u.addedAt)
            return (
              <div key={u.id} className="flex items-start gap-2.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">{u.note}</p>
                  {formattedDate && (
                    <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-0.5">{formattedDate}</p>
                  )}
                  {points && points.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {points.map((p, i) => (
                        <li key={i} className="text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5 leading-relaxed">
                          <span className="text-zinc-400 dark:text-zinc-600">→</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
