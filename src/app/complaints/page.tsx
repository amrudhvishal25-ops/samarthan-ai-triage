'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FileText, AlertCircle, ChevronRight, Clock, ArrowUpRight
} from 'lucide-react'
import { useComplaints, SavedComplaint } from '@/hooks/useComplaints'
import { useTriage } from '@/context/TriageContext'
import { COMPLAINT_STATUS_LABELS } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'
import Navbar from '@/components/Navbar'
import { getTranslation } from '@/lib/i18n/translations'

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH:     'bg-red-50 text-red-700 border-red-200',
  MEDIUM:   'bg-amber-50 text-amber-700 border-amber-200',
  LOW:      'bg-green-50 text-green-700 border-green-200',
}

export default function ComplaintsPage() {
  const router = useRouter()
  const { getAll } = useComplaints()
  const { setTriageResult, language, setLanguage } = useTriage()
  const t = getTranslation(language)
  const [complaints, setComplaints] = useState<SavedComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const hi = language === 'hi'

  useEffect(() => {
    getAll(true)
      .then(setComplaints)
      .catch(err => console.error('Failed to load complaints:', err))
      .finally(() => setLoading(false))
  }, [getAll])

  const handleOpen = (c: SavedComplaint) => {
    setTriageResult({
      incidentId: c.incidentId,
      fraudType: c.fraudType,
      fraudsterIdentifier: c.fraudsterIdentifier,
      complainantName: c.complainantName,
      amount: c.amount,
      urgencyLevel: c.urgencyLevel,
      summary: c.summary,
      summaryHi: c.summaryHi,
      summaryRegional: c.summaryRegional,
      language: c.language,
      complaintDraft: c.complaintDraft,
      complaintDraftHi: c.complaintDraftHi,
      complaintDraftRegional: c.complaintDraftRegional,
      frauderContact: c.frauderContact,
      bankName: c.bankName,
      accountNumber: c.accountNumber,
      upiId: c.upiId,
      timeline: c.timeline,
      freezeSteps: c.freezeSteps,
      applicableLaws: c.applicableLaws,
      recommendedChannel: c.recommendedChannel ?? inferChannelFromFraudType(c.fraudType).channel,
      recommendedChannelTarget: c.recommendedChannelTarget ?? inferChannelFromFraudType(c.fraudType).target,
    })
    router.push(`/dashboard?id=${encodeURIComponent(c.incidentId)}`)
  }

  const formatDate = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen bg-white font-sans pb-24">
      <Navbar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {t.complaints.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {t.complaints.subtitle}
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-semibold bg-[#1A3A6B] hover:bg-[#152d54] text-white rounded-xl px-4 py-2.5 transition-all shadow-sm cursor-pointer min-h-[44px]"
          >
            {t.complaints.fileNew}
            <ArrowUpRight className="w-4 h-4 rtl:rotate-90" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
          </div>
        ) : complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-zinc-200 rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center bg-zinc-50/50"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-base font-semibold text-zinc-800">
              {t.complaints.emptyTitle}
            </p>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-sm leading-relaxed">
              {t.complaints.emptyDesc}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold bg-[#1A3A6B] hover:bg-[#152d54] text-white rounded-xl px-5 py-3 transition-all shadow-sm cursor-pointer min-h-[44px]"
            >
              {t.complaints.fileNew}
              <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {complaints.map((c, i) => (
              <motion.div
                key={c.incidentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleOpen(c)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(c) }}
                role="button"
                tabIndex={0}
                className="group cursor-pointer border border-zinc-200 rounded-xl sm:rounded-2xl bg-white hover:border-zinc-400 hover:shadow-md transition-all p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-zinc-500" />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-zinc-900">{c.incidentId}</span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${URGENCY_COLORS[c.urgencyLevel] || URGENCY_COLORS.MEDIUM}`}>
                      {c.urgencyLevel}
                    </span>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-zinc-50 text-zinc-600 border-zinc-200">
                      {hi ? COMPLAINT_STATUS_LABELS[c.status ?? 'SUBMITTED'].hi : COMPLAINT_STATUS_LABELS[c.status ?? 'SUBMITTED'].en}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 mb-1">{c.fraudType}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {c.summaryRegional && language !== 'en' && language !== 'hi' ? c.summaryRegional : (hi ? (c.summaryHi || c.summary) : c.summary)}
                  </p>
                  <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(c.savedAt)}
                    </div>
                    {c.amount > 0 && (
                      <span className="text-xs text-zinc-700 font-semibold">
                        ₹{(Number(c.amount) || 0).toLocaleString('en-IN')} lost
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-600 shrink-0 mt-2 transition-colors rtl:rotate-180" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

