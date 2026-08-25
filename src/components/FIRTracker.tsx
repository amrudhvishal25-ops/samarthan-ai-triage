import React, { useState } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { COMPLAINT_STATUSES, COMPLAINT_STATUS_LABELS, ComplaintStatus } from '@/data/scenarios'

interface FIRTrackerProps {
  hi: boolean
  status: ComplaintStatus
  onAdvance: () => Promise<void> | void
}

export default function FIRTracker({ hi, status, onAdvance }: FIRTrackerProps) {
  const [advancing, setAdvancing] = useState(false)
  const currentIdx = COMPLAINT_STATUSES.indexOf(status)
  const isFinal = currentIdx === COMPLAINT_STATUSES.length - 1

  const handleAdvance = async () => {
    setAdvancing(true)
    try {
      await onAdvance()
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">
        {hi ? 'शिकायत स्टेटस' : 'Resolution Tracker'}
      </h3>

      <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
        {COMPLAINT_STATUSES.map((s, idx) => {
          const label = COMPLAINT_STATUS_LABELS[s]
          const isCompleted = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isPending = idx > currentIdx

          return (
            <div key={s} className="relative pl-6">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                isCompleted ? 'border-green-500 bg-green-500' :
                isCurrent ? 'border-blue-500 bg-blue-500 animate-pulse' :
                'border-gray-300'
              }`} />

              <div className={isPending ? 'opacity-50' : ''}>
                <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
                  {hi ? label.hi : label.en}
                  {label.simulated && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      {hi ? 'डेमो' : 'Simulated'}
                    </span>
                  )}
                </h4>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          {hi ? 'डेमो नियंत्रण' : 'Demo Controls'}
        </p>
        <button
          onClick={handleAdvance}
          disabled={advancing || isFinal}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 text-xs font-semibold py-2.5 transition-all"
        >
          {advancing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
          {isFinal
            ? (hi ? 'शिकायत का समाधान हो गया' : 'Complaint resolved')
            : (hi ? 'अगले चरण पर बढ़ें' : 'Advance to next stage')}
        </button>
      </div>
    </div>
  )
}
