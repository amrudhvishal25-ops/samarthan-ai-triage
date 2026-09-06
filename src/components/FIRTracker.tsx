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
    <div className="bg-white rounded-none border border-zinc-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-900 mb-6 uppercase tracking-wide">
        {hi ? 'शिकायत स्थिति ट्रैकर' : 'Complaint Status Tracker'}
      </h3>

      <div className="relative border-l-2 border-zinc-100 ml-3 space-y-6">
        {COMPLAINT_STATUSES.map((s, idx) => {
          const label = COMPLAINT_STATUS_LABELS[s]
          const isCompleted = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isPending = idx > currentIdx

          return (
            <div key={s} className="relative pl-6">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-none border-2 bg-white ${
                isCompleted ? 'border-green-500 bg-green-500' :
                isCurrent ? 'border-blue-500 bg-blue-500 animate-pulse' :
                'border-zinc-300'
              }`} />

              <div className={isPending ? 'opacity-50' : ''}>
                <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-zinc-500'}`}>
                  {hi ? label.hi : label.en}
                  {label.simulated && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-blue-600 bg-blue-50 border border-blue-200 rounded-none px-1.5 py-0.5">
                      {hi ? 'सक्रिय' : 'Live'}
                    </span>
                  )}
                </h4>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-dashed border-zinc-200">
        <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          {hi ? 'डेमो नियंत्रण' : 'Demo Controls'}
        </p>
        <button
          onClick={handleAdvance}
          disabled={advancing || isFinal}
          className="w-full flex items-center justify-center gap-2 rounded-none border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 text-xs font-semibold py-2.5 transition-all"
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
