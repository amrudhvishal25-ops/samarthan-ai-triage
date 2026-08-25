'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneCall, X, Headset, CheckCircle2 } from 'lucide-react'

interface CallOperatorModalProps {
  open: boolean
  onClose: () => void
  hotline: string
  hi: boolean
  incidentId: string
  fraudType: string
  amount: number
  summary: string
}

type Step = 'connecting' | 'connected'

export default function CallOperatorModal({
  open, onClose, hotline, hi, incidentId, fraudType, amount, summary,
}: CallOperatorModalProps) {
  const [step, setStep] = useState<Step>('connecting')

  useEffect(() => {
    if (!open) {
      setStep('connecting')
      return
    }
    const timer = setTimeout(() => setStep('connected'), 2200)
    return () => clearTimeout(timer)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-md overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors h-auto min-h-0 z-10">
              <X className="w-4 h-4" />
            </button>

            {step === 'connecting' && (
              <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[260px]">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <PhoneCall className="w-7 h-7 text-red-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-900">
                    {hi ? `${hotline} से जुड़ रहे हैं…` : `Connecting to ${hotline}…`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {hi ? 'ऑपरेटर को आपकी शिकायत का डेटा भेजा जा रहा है' : 'Sending your complaint data to the call operator'}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                  {hi ? 'डेमो' : 'Simulated'}
                </span>
              </div>
            )}

            {step === 'connected' && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Headset className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                      {hi ? 'ऑपरेटर से जुड़ गए' : 'Connected to Operator'}
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </h2>
                    <p className="text-xs text-zinc-500">{hi ? `हेल्पलाइन ${hotline}` : `Helpline ${hotline}`}</p>
                  </div>
                </div>

                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                  {hi ? 'ऑपरेटर को भेजा गया डेटा' : 'Data shared with the operator'}
                </p>
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-1.5 text-xs text-zinc-700 mb-4">
                  <p><span className="text-zinc-400">{hi ? 'घटना ID' : 'Incident ID'}:</span> <span className="font-mono font-semibold">{incidentId}</span></p>
                  <p><span className="text-zinc-400">{hi ? 'श्रेणी' : 'Category'}:</span> {fraudType}</p>
                  {amount > 0 && <p><span className="text-zinc-400">{hi ? 'राशि' : 'Amount'}:</span> ₹{amount.toLocaleString('en-IN')}</p>}
                  <p className="pt-1 text-zinc-600 leading-relaxed">{summary}</p>
                </div>

                <a
                  href={`tel:${hotline}`}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold text-sm transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  {hi ? `${hotline} पर वास्तविक कॉल करें` : `Actually dial ${hotline}`}
                </a>
                <p className="text-center text-xs text-zinc-400 mt-2">
                  {hi ? 'यह डेमो है — ऑपरेटर को डेटा वास्तव में नहीं भेजा गया' : 'This is a demo — no data was actually transmitted to a real operator'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
