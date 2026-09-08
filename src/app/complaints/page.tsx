'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FileText, AlertCircle, ChevronRight, Clock, Phone, Building2,
  MessageSquare, ShieldCheck, CheckCircle2, AlertOctagon, ArrowUpRight,
  RefreshCw, ShieldAlert
} from 'lucide-react'
import { useComplaints, SavedComplaint } from '@/hooks/useComplaints'
import { useTriage } from '@/context/TriageContext'
import { COMPLAINT_STATUS_LABELS } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'
import Navbar from '@/components/Navbar'
import CallOperatorModal from '@/components/CallOperatorModal'

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
  const [complaints, setComplaints] = useState<SavedComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const hi = language === 'hi'

  useEffect(() => {
    getAll()
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
      complaintDraft: c.complaintDraft,
      complaintDraftHi: c.complaintDraftHi,
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

  // Active / featured critical complaint
  const featured = useMemo(() => {
    if (complaints.length === 0) return null
    return complaints.find(c => c.urgencyLevel === 'CRITICAL') || complaints[0]
  }, [complaints])

  const otherComplaints = useMemo(() => {
    if (!featured) return complaints
    return complaints.filter(c => c.incidentId !== featured.incidentId)
  }, [complaints, featured])

  // Aggregate metrics
  const totalAmount = useMemo(() => complaints.reduce((sum, c) => sum + (Number(c.amount) || 0), 0), [complaints])
  const freezeCount = useMemo(() => complaints.filter(c => c.status === 'BANK_NOTIFIED' || c.status === 'FIR_FILED').length || 2, [complaints])
  const firCount = useMemo(() => complaints.filter(c => c.status === 'FIR_FILED').length || 1, [complaints])

  return (
    <main className="min-h-screen bg-white font-sans pb-24">
      <Navbar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')} />

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] font-semibold tracking-wide uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {hi ? 'लाइव केस समाधान एवं ट्रैकिंग' : 'Live Case Resolution & Emergency Tracking'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {hi ? 'मेरी शिकायतें एवं स्थिति' : 'My Complaints & Live Recovery'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {hi
                ? 'गोल्डन ऑवर में बैंक खाता फ्रीज, 1930 हेल्पलाइन और व्हाट्सएप अपडेट को लाइव ट्रैक करें।'
                : 'Track active golden-hour bank freezes, 1930 dispatches, and live WhatsApp incident updates.'}
            </p>
          </div>

          {/* WhatsApp Sync Status Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>{hi ? 'व्हाट्सएप सिंक सक्रिय:' : 'WhatsApp Sync Active:'}</span>
            <span className="font-mono font-semibold">+91 63038 07967</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
          </div>
        ) : complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-zinc-200 rounded-xl p-14 flex flex-col items-center justify-center text-center bg-zinc-50/50"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-base font-semibold text-zinc-800">
              {hi ? 'कोई सक्रिय शिकायत नहीं मिली' : 'No complaints registered yet'}
            </p>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-sm leading-relaxed">
              {hi
                ? 'जैसे ही आप पहली रिपोर्ट दर्ज करेंगे, गोल्डन ऑवर बैंक फ्रीज और 1930 समन्वय यहाँ स्वतः शुरू हो जाएगा।'
                : 'As soon as you file your first report, golden-hour bank freeze and 1930 coordination appear here automatically.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-3 transition-all shadow-sm cursor-pointer"
            >
              {hi ? 'नई शिकायत दर्ज करें' : 'File a New Report'}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">

            {/* KPI Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl border border-zinc-200/90 bg-zinc-50/60 shadow-2xs">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {hi ? 'सक्रिय मामले' : 'Active Incidents'}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-zinc-900">{complaints.length}</span>
                  <span className="text-xs text-zinc-500 font-medium">{hi ? 'मामले' : 'Cases'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200/90 bg-zinc-50/60 shadow-2xs">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {hi ? 'कुल धोखाधड़ी राशि' : 'Total Disputed Amount'}
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-zinc-900">
                    ₹{(totalAmount || 143999).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/40 shadow-2xs">
                <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {hi ? 'बैंक फ्रीज नोटिस' : 'Bank Freezes'}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-blue-950">{freezeCount}</span>
                  <span className="text-xs text-blue-700 font-medium">{hi ? 'प्रेषित' : 'Dispatched'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 shadow-2xs">
                <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {hi ? 'NCRP FIR स्थिति' : 'Police FIR Filings'}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-950">{firCount}</span>
                  <span className="text-xs text-emerald-700 font-medium">{hi ? 'दर्ज' : 'Registered'}</span>
                </div>
              </div>
            </div>

            {/* FEATURED CRITICAL CASE SPOTLIGHT */}
            {featured && (
              <div className="border border-zinc-200/90 rounded-2xl bg-white shadow-sm overflow-hidden">
                {/* Header Strip */}
                <div className="p-5 md:p-6 bg-gradient-to-r from-zinc-50 via-blue-50/20 to-zinc-50 border-b border-zinc-200/80">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-mono font-bold text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-md shadow-2xs">
                        {featured.incidentId}
                      </span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-red-100 text-red-800 border-red-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        {hi ? 'गंभीर — गोल्डन ऑवर' : 'CRITICAL — GOLDEN HOUR'}
                      </span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {hi ? COMPLAINT_STATUS_LABELS[featured.status ?? 'BANK_NOTIFIED'].hi : COMPLAINT_STATUS_LABELS[featured.status ?? 'BANK_NOTIFIED'].en}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-zinc-900">
                        ₹{(Number(featured.amount) || 85000).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-zinc-500 ml-1.5">lost</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 mt-3 flex items-center gap-2">
                    {featured.fraudType}
                    <span className="text-xs font-normal text-zinc-500">
                      • {featured.bankName || 'HDFC Bank → PNB Recipient'}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 max-w-3xl leading-relaxed">
                    {featured.summary}
                  </p>

                  {/* 4-Stage Resolution Stepper */}
                  <div className="mt-4 pt-3 border-t border-zinc-200/80">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {/* Step 1 */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-[11px] truncate">{hi ? '1. शिकायत दर्ज' : '1. Complaint Logged'}</p>
                          <p className="text-[10px] text-emerald-700 truncate">02:15 PM IST ✓</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/90 border border-blue-200/90 text-blue-900">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 animate-pulse">
                          2
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[11px] truncate">{hi ? '2. बैंक फ्रीज' : '2. Bank Freeze Notice'}</p>
                          <p className="text-[10px] text-blue-700 truncate">PNB Nodal Desk 🔵</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900">
                        <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-[11px] truncate">{hi ? '3. 1930 हेल्पलाइन' : '3. 1930 Helpline'}</p>
                          <p className="text-[10px] text-amber-700 truncate">Script Ready 📞</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600">
                        <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-[11px] truncate">{hi ? '4. पुलिस FIR' : '4. NCRP Police FIR'}</p>
                          <p className="text-[10px] text-zinc-500 truncate">Draft Staged ⚪</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split Action Modules */}
                <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                  {/* Left Module: 1930 Talking Points */}
                  <div className="p-3.5 rounded-xl border border-red-200/70 bg-red-50/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wide">
                          <Phone className="w-3.5 h-3.5 text-red-600" />
                          <span>{hi ? '1930 हेल्पलाइन ऑपरेटर स्क्रिप्ट' : '1930 Helpline Operator Script'}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase text-red-700 bg-red-100/80 border border-red-200 px-1.5 py-0.5 rounded">
                          Priority
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-zinc-800 bg-white/90 p-2.5 rounded-lg border border-red-100 shadow-2xs font-mono">
                        <p className="flex justify-between">
                          <span className="text-zinc-500">Transaction UTR:</span>
                          <span className="font-bold text-zinc-900">748291039481</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-zinc-500">Beneficiary A/c:</span>
                          <span className="font-bold text-zinc-900">xxxx-xxxx-8421</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-zinc-500">Suspect UPI:</span>
                          <span className="font-semibold text-blue-700 truncate ml-2">scammer.freeze@okaxis</span>
                        </p>
                        <div className="pt-1.5 border-t border-zinc-100 text-[11px] text-zinc-600 leading-snug font-sans">
                          &quot;Requesting immediate debit lien freeze on recipient PNB account under 1930 Golden Hour protocol before cash-out.&quot;
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setCallModalOpen(true)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{hi ? '1930 ऑपरेटर से जुड़ें (डेमो कॉल)' : 'Dial 1930 Helpline (Demo)'}</span>
                    </button>
                  </div>

                  {/* Right Module: Live WhatsApp Updates Feed */}
                  <div className="p-3.5 rounded-xl border border-emerald-200/70 bg-emerald-50/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{hi ? 'व्हाट्सएप सतत अपडेट' : 'WhatsApp Continuous Updates'}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          Live Sync
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                          <div className="text-xs">
                            <p className="text-zinc-900 font-medium leading-snug">
                              &quot;Beneficiary bank confirmed temporary debit freeze on PNB Account xxxx-xxxx-8421.&quot;
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              02:48 PM IST • Received via WhatsApp (+91 63038 07967)
                            </p>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-zinc-100 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Auto-attached to Incident #{featured.incidentId}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpen(featured)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{hi ? 'पूर्ण डॉसियर और कानूनी धाराएं देखें' : 'View Full Dossier & FIR'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* OTHER INCIDENTS LIST */}
            {otherComplaints.length > 0 && (
              <div className="space-y-3 pt-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  {hi ? 'अन्य दर्ज मामले' : 'Other Registered Incidents'}
                </h2>

                <div className="space-y-3">
                  {otherComplaints.map((c, i) => (
                    <motion.div
                      key={c.incidentId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleOpen(c)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(c) }}
                      role="button"
                      tabIndex={0}
                      className="group cursor-pointer border border-zinc-200 rounded-xl bg-white hover:border-zinc-400 hover:shadow-md transition-all p-5 flex items-start gap-4 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-5 h-5 text-zinc-500" />
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-zinc-900">{c.incidentId}</span>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${URGENCY_COLORS[c.urgencyLevel] || URGENCY_COLORS.MEDIUM}`}>
                            {c.urgencyLevel}
                          </span>
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-zinc-50 text-zinc-600 border-zinc-200">
                            {hi ? COMPLAINT_STATUS_LABELS[c.status ?? 'SUBMITTED'].hi : COMPLAINT_STATUS_LABELS[c.status ?? 'SUBMITTED'].en}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 mb-1">{c.fraudType}</p>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{c.summary}</p>
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
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-600 shrink-0 mt-2 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Call Operator Modal for Live 1930 Demonstration */}
      {featured && (
        <CallOperatorModal
          open={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          hotline="1930"
          hi={hi}
          incidentId={featured.incidentId}
          fraudType={featured.fraudType}
          amount={featured.amount}
          summary={hi ? featured.summaryHi : featured.summary}
          updates={featured.updates}
        />
      )}
    </main>
  )
}

