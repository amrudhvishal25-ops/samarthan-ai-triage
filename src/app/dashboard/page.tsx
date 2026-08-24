'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, Share2, Printer, RotateCcw, Edit3, ShieldAlert } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import UrgencyBadge from '@/components/UrgencyBadge'
import FreezeStepper from '@/components/FreezeStepper'
import PrintableComplaint from '@/components/PrintableComplaint'
import EvidenceVault from '@/components/EvidenceVault'
import SmartActions from '@/components/SmartActions'
import FIRTracker from '@/components/FIRTracker'
import Navbar from '@/components/Navbar'
import { useComplaints } from '@/hooks/useComplaints'

export default function DashboardPage() {
  const router = useRouter()
  const { triageResult, setTriageResult, language, setLanguage, reset, sharedImage } = useTriage()
  const { save } = useComplaints()
  const hi = language === 'hi'

  useEffect(() => {
    if (!triageResult) router.replace('/')
  }, [triageResult, router])

  useEffect(() => {
    if (!triageResult) return
    save({
      incidentId: triageResult.incidentId,
      fraudType: triageResult.fraudType,
      victimName: triageResult.victimName,
      amount: triageResult.amount,
      urgencyLevel: triageResult.urgencyLevel,
      summary: triageResult.summary,
      summaryHi: triageResult.summaryHi,
      complaintDraft: triageResult.complaintDraft,
      complaintDraftHi: triageResult.complaintDraftHi,
      frauderContact: triageResult.frauderContact,
      bankName: triageResult.bankName,
      accountNumber: triageResult.accountNumber,
      upiId: triageResult.upiId,
      timeline: triageResult.timeline,
      freezeSteps: triageResult.freezeSteps,
      language,
    })
  }, [triageResult, save, language])

  if (!triageResult) return null

  const r = triageResult

  const handleUpdate = (field: keyof typeof r, value: any) => {
    setTriageResult({ ...r, [field]: value })
  }

  const handleShare = async () => {
    const text = hi
      ? `🚨 साइबर धोखाधड़ी की शिकायत\nघटना ID: ${r.incidentId}\nराशि: ₹${r.amount.toLocaleString('en-IN')}\nतुरंत 1930 पर कॉल करें।`
      : `🚨 Cyber Fraud Report\nIncident ID: ${r.incidentId}\nAmount: ₹${r.amount.toLocaleString('en-IN')}\nCall 1930 immediately.`
    if (navigator.share) {
      try { await navigator.share({ title: 'Samarthan Fraud Report', text }) } catch { }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  return (
    <main className="min-h-screen bg-white pb-20 font-sans">
      <PrintableComplaint result={r} language={language} />

      <div className="no-print">
        <Navbar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 no-print">

        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              {hi ? 'आपकी शिकायत तैयार है' : 'Your Report is Ready'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {hi ? 'AI द्वारा विवरण निकाला गया। संपादित करें और तुरंत कार्रवाई करें।'
                : 'Details extracted by AI. Review, edit, and take action immediately.'}
            </p>
          </div>
          <button
            onClick={() => { reset(); router.push('/') }}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 rounded-md px-3 py-1.5 transition-colors h-auto min-h-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {hi ? 'फिर से' : 'New Report'}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 space-y-4">

            {/* AI Summary */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-100">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {hi ? 'AI सारांश' : 'AI Summary'}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-zinc-800 leading-relaxed">{hi ? r.summaryHi : r.summary}</p>
              </div>
            </motion.div>

            {/* Evidence Vault */}
            {sharedImage && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <EvidenceVault file={sharedImage} hi={hi} />
              </motion.div>
            )}

            {/* Editable Report Details */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {hi ? 'विवरण संपादित करें' : 'Edit Report Details'}
                </p>
              </div>
              <div className="px-5 py-5 space-y-4">

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                    {hi ? 'अपराध श्रेणी' : 'Crime Category'}
                  </label>
                  <select
                    value={r.fraudType}
                    onChange={(e) => handleUpdate('fraudType', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Women/Children Crime">Women/Children Crime</option>
                    <option value="Extortion & Blackmail">Extortion & Blackmail</option>
                    <option value="Identity Theft">Identity Theft</option>
                    <option value="E-Commerce Scams">E-Commerce Scams</option>
                    <option value="Other Cyber Crimes">Other Cyber Crimes</option>
                  </select>
                </div>

                {/* Name + Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                      {hi ? 'पीड़ित का नाम' : 'Victim Name'}
                    </label>
                    <input
                      type="text" value={r.victimName}
                      onChange={(e) => handleUpdate('victimName', e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                      {hi ? 'राशि (₹)' : 'Amount Lost (₹)'}
                    </label>
                    <input
                      type="number" value={r.amount}
                      onChange={(e) => handleUpdate('amount', Number(e.target.value))}
                      className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Fraudster Contact */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                    {hi ? 'आरोपी का संपर्क' : 'Fraudster Contact'}
                  </label>
                  <input
                    type="text" value={r.frauderContact}
                    onChange={(e) => handleUpdate('frauderContact', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Complaint Draft */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>{hi ? 'शिकायत मसौदा' : 'Complaint Draft'}</span>
                    <span className="text-zinc-400 normal-case font-normal">{hi ? 'संपादन योग्य' : 'Editable'}</span>
                  </label>
                  <textarea
                    value={hi ? r.complaintDraftHi : r.complaintDraft}
                    onChange={(e) => hi
                      ? handleUpdate('complaintDraftHi', e.target.value)
                      : handleUpdate('complaintDraft', e.target.value)
                    }
                    rows={10}
                    className="w-full border border-zinc-200 rounded-xl p-4 text-sm font-mono leading-relaxed text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Action buttons (left column) */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3">
              <a
                href="tel:1930"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
                {hi ? '1930 कॉल करें' : 'Call 1930'}
              </a>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 rounded-xl py-3 font-semibold text-sm transition-all"
              >
                <Share2 className="w-4 h-4" />
                {hi ? 'स्थिति साझा करें' : 'Share Status'}
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl py-3 font-medium text-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                {hi ? 'PDF / प्रिंट करें' : 'Save as PDF / Print'}
              </button>
            </motion.div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-5 space-y-4">

            {/* Incident ID + Urgency */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="grid grid-cols-2 gap-3">
              <div className="border border-zinc-200 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  {hi ? 'घटना संख्या' : 'Incident ID'}
                </p>
                <p className="font-mono font-bold text-zinc-900 text-base tracking-tight truncate">{r.incidentId}</p>
              </div>
              <div className="flex items-stretch">
                <UrgencyBadge level={r.urgencyLevel} language={language} size="lg" />
              </div>
            </motion.div>

            {/* Action & Tracking Header */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">
                  {hi ? 'कार्रवाई और ट्रैकिंग' : 'Action & Tracking'}
                </h2>
              </div>
              <p className="text-xs text-zinc-500">
                {hi ? 'नीचे दिए गए कदम क्रम से उठाएं।' : 'Execute the next steps immediately.'}
              </p>
            </motion.div>

            {/* Smart Actions */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <SmartActions bankName={r.bankName} incidentId={r.incidentId} amount={r.amount} hi={hi} />
            </motion.div>

            {/* FIR Tracker */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <FIRTracker hi={hi} />
            </motion.div>

            {/* Freeze Steps */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="border border-zinc-200 rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                {hi ? 'खाता फ्रीज़ करें' : 'Manual Freeze Steps'}
              </p>
              <FreezeStepper steps={r.freezeSteps} language={language} />
            </motion.div>

          </div>
        </div>
      </div>
    </main>
  )
}
