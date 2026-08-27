'use client'

import { useState } from 'react'
import { MessageSquarePlus, Clock, Loader2, ListChecks } from 'lucide-react'
import { ComplaintUpdate } from '@/hooks/useComplaints'

interface ComplaintUpdatesProps {
  hi: boolean
  updates: ComplaintUpdate[]
  onAdd: (note: string) => Promise<void> | void
}

export default function ComplaintUpdates({ hi, updates = [], onAdd }: ComplaintUpdatesProps) {
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

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const allActionPoints = updates.flatMap(u => hi ? u.actionPointsHi : u.actionPoints)

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide flex items-center gap-2">
        <MessageSquarePlus className="w-4 h-4 text-blue-500" />
        {hi ? 'नई जानकारी जोड़ें' : 'Add an Update'}
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {hi
          ? 'क्या याद आया कुछ नया? नई जानकारी, लेन-देन, या संपर्क यहाँ जोड़ें — यह आपकी शिकायत के साथ सुरक्षित रहेगा।'
          : 'Remembered something new? Add a fresh detail, transaction, or contact here — it stays attached to this complaint.'}
      </p>

      <div className="flex gap-2 mb-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={hi ? 'उदाहरण: मुझे एक और मैसेज मिला उसी नंबर से…' : 'e.g. I got another message from the same number…'}
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 placeholder-zinc-400 resize-none outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !note.trim()}
          className="flex-shrink-0 self-end flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-xs font-semibold transition-all"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (hi ? 'जोड़ें' : 'Add')}
        </button>
      </div>

      {allActionPoints.length > 0 && (
        <div className="mb-4 border border-amber-200 bg-amber-50 rounded-xl p-3.5">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <ListChecks className="w-3.5 h-3.5" />
            {hi ? 'फॉलो-अप कार्रवाई (1930/बैंक/पुलिस को बताएं)' : 'Follow-Up Actions (mention to 1930/bank/police)'}
          </p>
          <ul className="space-y-1">
            {allActionPoints.map((point, i) => (
              <li key={i} className="text-xs text-amber-900 leading-relaxed flex gap-1.5">
                <span className="text-amber-500">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {updates.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-dashed border-gray-200">
          {[...updates].reverse().map((u) => {
            const points = hi ? u.actionPointsHi : u.actionPoints
            return (
              <div key={u.id} className="flex items-start gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 leading-relaxed">{u.note}</p>
                  <p className="text-gray-400 mt-0.5">{formatDate(u.addedAt)}</p>
                  {points.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {points.map((p, i) => (
                        <li key={i} className="text-gray-500 flex gap-1.5">
                          <span className="text-gray-300">→</span>
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
