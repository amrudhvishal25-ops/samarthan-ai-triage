'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, IndianRupee, Phone, Share2,
  Printer, RotateCcw, User, Building2,
  CreditCard, Clock, Globe, Edit3
} from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import UrgencyBadge from '@/components/UrgencyBadge'
import FreezeStepper from '@/components/FreezeStepper'
import PrintableComplaint from '@/components/PrintableComplaint'

export default function DashboardPage() {
  const router = useRouter()
  const { triageResult, setTriageResult, language, setLanguage, reset } = useTriage()
  const hi = language === 'hi'

  useEffect(() => {
    if (!triageResult) router.replace('/')
  }, [triageResult, router])

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
      try {
        await navigator.share({ title: 'Samarthan Fraud Report', text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 font-sans">
      <PrintableComplaint result={r} language={language} />

      {/* Top Bar */}
      <div className="bg-civic-blue text-white px-6 py-4 no-print shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-saffron" />
            <span className="font-bold text-lg tracking-tight">Samarthan</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <button
              onClick={() => { reset(); router.push('/') }}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {hi ? 'फिर से' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 no-print">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT COLUMN: AI Summary & Editable Report */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {hi ? 'समीक्षा करें और संपादित करें' : 'Review & Edit Report'}
                </h2>
                <p className="text-sm text-gray-500">
                  {hi ? 'AI ने यह जानकारी निकाली है। इसे तुरंत संपादित करें।' : 'AI extracted these details. Edit them instantly below.'}
                </p>
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {hi ? 'AI सारांश' : 'AI Summary'}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {hi ? r.summaryHi : r.summary}
              </p>
            </motion.div>

            {/* Editable Fields */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {hi ? 'अपराध की श्रेणी' : 'Crime Category'}
                </label>
                <select 
                  value={r.fraudType}
                  onChange={(e) => handleUpdate('fraudType', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-civic-blue bg-gray-50 outline-none transition-shadow"
                >
                  <option value="Women/Children Related Crime">Women/Children Related Crime</option>
                  <option value="Financial Fraud">Financial Fraud</option>
                  <option value="Hate Speech">Hate Speech</option>
                  <option value="Online Ragging">Online Ragging</option>
                  <option value="Other Cyber Crime">Other Cyber Crime</option>
                  <option value="UPI Fraud">UPI Fraud (Legacy)</option>
                  <option value="OTP Fraud">OTP Fraud (Legacy)</option>
                  <option value="Investment Scam">Investment Scam (Legacy)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {hi ? 'पीड़ित का नाम' : 'Victim Name'}
                  </label>
                  <input 
                    type="text" 
                    value={r.victimName}
                    onChange={(e) => handleUpdate('victimName', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-civic-blue outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {hi ? 'राशि (यदि लागू हो)' : 'Amount Lost (If any)'}
                  </label>
                  <input 
                    type="number" 
                    value={r.amount}
                    onChange={(e) => handleUpdate('amount', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-civic-blue outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {hi ? 'आरोपी का संपर्क' : 'Fraudster Contact'}
                </label>
                <input 
                  type="text" 
                  value={r.frauderContact}
                  onChange={(e) => handleUpdate('frauderContact', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-civic-blue outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                  <span>{hi ? 'शिकायत का मसौदा' : 'Complaint Draft'}</span>
                  <span className="text-civic-blue font-semibold">{hi ? '(संपादित करें)' : '(Editable)'}</span>
                </label>
                <textarea 
                  value={hi ? r.complaintDraftHi : r.complaintDraft}
                  onChange={(e) => hi 
                    ? handleUpdate('complaintDraftHi', e.target.value)
                    : handleUpdate('complaintDraft', e.target.value)
                  }
                  rows={10}
                  className="w-full border border-gray-300 rounded-xl p-4 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-civic-blue outline-none transition-shadow bg-slate-50"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Action Steps */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {hi ? 'तत्काल कार्रवाई करें' : 'Immediate Action Steps'}
                </h2>
                <p className="text-sm text-gray-500">
                  {hi ? 'नीचे दिए गए कदम क्रम से उठाएं।' : 'Follow these steps in order.'}
                </p>
              </div>
            </motion.div>

            {/* Incident ID & Urgency combined */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-stretch gap-4">
              <div className="bg-civic-blue rounded-2xl p-4 text-white flex-1 flex flex-col justify-center shadow-sm">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">{hi ? 'घटना संख्या' : 'Incident ID'}</p>
                <p className="font-mono font-bold text-2xl tracking-wider">{r.incidentId}</p>
              </div>
              <div className="flex-1">
                <UrgencyBadge level={r.urgencyLevel} language={language} size="lg" />
              </div>
            </motion.div>

            {/* Freeze steps */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <FreezeStepper steps={r.freezeSteps} language={language} />
            </motion.div>

            {/* Action buttons */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4">
              <a href="tel:1930" className="flex flex-col items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-md">
                <Phone className="w-6 h-6" />
                {hi ? '1930 कॉल करें' : 'Call 1930'}
              </a>
              <button onClick={handleShare} className="flex flex-col items-center gap-2 bg-civic-blue hover:bg-civic-blueMid text-white rounded-2xl py-4 font-bold text-base transition-colors shadow-md">
                <Share2 className="w-6 h-6" />
                {hi ? 'परिवार को भेजें' : 'Share with Family'}
              </button>
            </motion.div>

            <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl py-4 font-bold text-base hover:bg-gray-50 transition-colors shadow-sm">
              <Printer className="w-5 h-5" />
              {hi ? 'PDF / प्रिंट करें' : 'Save as PDF / Print'}
            </button>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-xs leading-relaxed">
                <span className="font-bold">⚠️ {hi ? 'महत्वपूर्ण:' : 'Important:'}</span>
                {hi
                  ? ' यह एक AI-जनरेटेड मसौदा है। FIR दाखिल करने से पहले सभी विवरणों की जांच करें। सभी परिदृश्य काल्पनिक हैं।'
                  : ' This is an AI-generated draft for demonstration. Verify all details before filing. All scenarios use synthetic data.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
