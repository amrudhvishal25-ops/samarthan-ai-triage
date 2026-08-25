'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, AlertCircle, ChevronRight, Clock } from 'lucide-react'
import { useComplaints, SavedComplaint } from '@/hooks/useComplaints'
import { useTriage } from '@/context/TriageContext'
import { COMPLAINT_STATUS_LABELS } from '@/data/scenarios'
import Navbar from '@/components/Navbar'

const URGENCY_COLORS: Record<string, string> = {
  HIGH:   'bg-red-50 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LOW:    'bg-green-50 text-green-700 border-green-200',
}

export default function ComplaintsPage() {
  const router = useRouter()
  const { getAll } = useComplaints()
  const { setTriageResult, language, setLanguage } = useTriage()
  const [complaints, setComplaints] = useState<SavedComplaint[]>([])
  const hi = language === 'hi'

  useEffect(() => {
    getAll().then(setComplaints).catch(err => console.error('Failed to load complaints:', err))
  }, [getAll])

  const handleOpen = (c: SavedComplaint) => {
    // Restore the triage result so dashboard can display it
    setTriageResult({
      incidentId: c.incidentId,
      fraudType: c.fraudType,
      victimName: c.victimName,
      amount: c.amount,
      urgencyLevel: c.urgencyLevel,
      summary: c.summary,
      summaryHi: c.summaryHi,
      complaintDraft: c.complaintDraft,
      complaintDraftHi: c.complaintDraftHi,
      frauderContact: c.frauderContact,
      bankName: c.bankName,
      accountNumber: c.accountNumber,
      upiId: c.upiId,
      timeline: c.timeline,
      freezeSteps: c.freezeSteps,
      applicableLaws: c.applicableLaws,
    })
    router.push('/dashboard')
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <main className="min-h-screen bg-white font-sans pb-20">
      <Navbar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')} />

      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            {hi ? 'मेरी शिकायतें' : 'My Complaints'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {hi ? 'आपकी सभी दर्ज शिकायतें यहाँ सहेजी गई हैं।'
              : 'Every complaint you raise is automatically logged here.'}
          </p>
        </div>

        {complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700">
              {hi ? 'कोई शिकायत नहीं मिली' : 'No complaints yet'}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">
              {hi ? 'जैसे ही आप पहली रिपोर्ट दर्ज करेंगे, वह यहाँ दिखाई देगी।'
                : 'As soon as you file your first report, it will appear here automatically.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl px-4 py-2.5 transition-all"
            >
              {hi ? 'शिकायत दर्ज करें' : 'File a Complaint'}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c, i) => (
              <motion.div
                key={c.incidentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleOpen(c)}
                className="group cursor-pointer border border-zinc-200 rounded-2xl bg-white hover:border-zinc-400 hover:shadow-md transition-all p-5 flex items-start gap-4"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-zinc-500" />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-zinc-900">{c.incidentId}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${URGENCY_COLORS[c.urgencyLevel] || URGENCY_COLORS.MEDIUM}`}>
                      {c.urgencyLevel}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-zinc-50 text-zinc-600 border-zinc-200">
                      {hi ? COMPLAINT_STATUS_LABELS[c.status ?? 'SUBMITTED'].hi : COMPLAINT_STATUS_LABELS[c.status ?? 'SUBMITTED'].en}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-800 mb-1">{c.fraudType}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{c.summary}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(c.savedAt)}
                    </div>
                    {c.amount > 0 && (
                      <span className="text-xs text-zinc-500 font-medium">
                        ₹{c.amount.toLocaleString('en-IN')} lost
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 flex-shrink-0 mt-2 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
