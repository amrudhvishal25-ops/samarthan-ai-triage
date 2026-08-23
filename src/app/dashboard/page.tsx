'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, IndianRupee, Phone, Share2,
  Printer, RotateCcw, User, Building2,
  CreditCard, Clock, Globe
} from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import UrgencyBadge from '@/components/UrgencyBadge'
import FreezeStepper from '@/components/FreezeStepper'
import PrintableComplaint from '@/components/PrintableComplaint'

export default function DashboardPage() {
  const router = useRouter()
  const { triageResult, language, setLanguage, reset } = useTriage()
  const hi = language === 'hi'

  useEffect(() => {
    if (!triageResult) router.replace('/')
  }, [triageResult, router])

  if (!triageResult) return null

  const r = triageResult

  const handleShare = async () => {
    const text = hi
      ? `🚨 साइबर धोखाधड़ी की शिकायत\nघटना ID: ${r.incidentId}\nराशि: ₹${r.amount.toLocaleString('en-IN')}\nतुरंत 1930 पर कॉल करें।`
      : `🚨 Cyber Fraud Report\nIncident ID: ${r.incidentId}\nAmount: ₹${r.amount.toLocaleString('en-IN')}\nCall 1930 immediately.`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Samarthan Fraud Report', text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  const infoRows = [
    { icon: User, label: hi ? 'पीड़ित' : 'Victim', value: r.victimName },
    { icon: Shield, label: hi ? 'धोखाधड़ी प्रकार' : 'Fraud Type', value: r.fraudType },
    { icon: IndianRupee, label: hi ? 'खोई गई राशि' : 'Amount Lost', value: `₹${r.amount.toLocaleString('en-IN')}` },
    { icon: Building2, label: hi ? 'बैंक' : 'Bank', value: r.bankName },
    { icon: CreditCard, label: hi ? 'खाता' : 'Account', value: r.accountNumber },
    { icon: Phone, label: hi ? 'धोखेबाज संपर्क' : 'Fraudster Contact', value: r.frauderContact },
    { icon: Clock, label: hi ? 'समय' : 'Timeline', value: r.timeline },
  ]

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* PrintableComplaint is hidden on screen, shown only on print */}
      <PrintableComplaint result={r} language={language} />

      {/* Sticky top bar */}
      <div className="bg-civic-blue text-white px-5 py-4 no-print">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-saffron" />
            <span className="font-bold text-sm">Samarthan</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
            {/* Start over */}
            <button
              onClick={() => { reset(); router.push('/') }}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {hi ? 'फिर से' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Incident ID */}
        <div className="bg-white/10 rounded-xl px-4 py-3">
          <p className="text-white/60 text-xs mb-0.5">{hi ? 'घटना संख्या' : 'Incident ID'}</p>
          <p className="font-mono font-bold text-lg tracking-wider">{r.incidentId}</p>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6 max-w-lg mx-auto no-print">

        {/* Urgency banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <UrgencyBadge level={r.urgencyLevel} language={language} size="lg" />
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
        >
          <h2 className="text-base font-bold text-gray-900 mb-3">
            {hi ? 'AI सारांश' : 'AI Summary'}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {hi ? r.summaryHi : r.summary}
          </p>
        </motion.div>

        {/* Incident details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
        >
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {hi ? 'घटना विवरण' : 'Incident Details'}
          </h2>
          <div className="space-y-3">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-civic-blueLight flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-civic-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Freeze steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base font-bold text-gray-900 mb-1">
            {hi ? '🚨 अभी यह करें — खाता फ्रीज करें' : '🚨 Act Now — Freeze the Account'}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            {hi
              ? 'नीचे दिए गए कदम क्रम से उठाएं। पहला कदम सबसे ज़रूरी है।'
              : 'Follow these steps in order. Step 1 is most critical.'}
          </p>
          <FreezeStepper steps={r.freezeSteps} language={language} />
        </motion.div>

        {/* Complaint draft */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-base font-bold text-gray-900">
              {hi ? 'AI-जनरेटेड शिकायत मसौदा' : 'AI-Generated Complaint Draft'}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {hi ? 'इसे cybercrime.gov.in पर paste करें' : 'Paste this on cybercrime.gov.in'}
            </p>
          </div>
          <div className="mx-5 mb-5 bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-slate-200">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {hi ? r.complaintDraftHi : r.complaintDraft}
            </pre>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <a
            href="tel:1930"
            className="flex flex-col items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 font-bold text-sm transition-colors min-h-[56px] justify-center"
          >
            <Phone className="w-5 h-5" />
            {hi ? '1930 कॉल करें' : 'Call 1930'}
          </a>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1.5 bg-civic-blue hover:bg-civic-blueMid text-white rounded-2xl py-4 font-bold text-sm transition-colors min-h-[56px]"
          >
            <Share2 className="w-5 h-5" />
            {hi ? 'परिवार को भेजें' : 'Share with Family'}
          </button>
        </motion.div>

        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 rounded-2xl py-4 font-semibold text-sm hover:bg-gray-50 transition-colors min-h-[56px]"
        >
          <Printer className="w-5 h-5" />
          {hi ? 'PDF / प्रिंट करें' : 'Save as PDF / Print'}
        </button>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-800 text-xs leading-relaxed">
            <span className="font-bold">⚠️ {hi ? 'महत्वपूर्ण:' : 'Important:'}</span>
            {hi
              ? ' यह एक AI-जनरेटेड मसौदा है। FIR दाखिल करने से पहले सभी विवरणों की जांच करें। सभी परिदृश्य काल्पनिक हैं।'
              : ' This is an AI-generated draft for demonstration. Verify all details before filing. All scenarios use synthetic data.'}
          </p>
        </div>
      </div>
    </main>
  )
}
