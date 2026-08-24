'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, Phone, Share2,
  Printer, RotateCcw, Globe, Edit3, ShieldAlert
} from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import UrgencyBadge from '@/components/UrgencyBadge'
import FreezeStepper from '@/components/FreezeStepper'
import PrintableComplaint from '@/components/PrintableComplaint'
import EvidenceVault from '@/components/EvidenceVault'
import SmartActions from '@/components/SmartActions'
import FIRTracker from '@/components/FIRTracker'

export default function DashboardPage() {
  const router = useRouter()
  const { triageResult, setTriageResult, language, setLanguage, reset, sharedImage } = useTriage()
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
    <main className="min-h-screen bg-[#fafafa] pb-20 font-sans relative">
      {/* Light dot matrix background pattern */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10">
        <PrintableComplaint result={r} language={language} />

        {/* Top Bar - Ultra Clean */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 no-print shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-gray-900 text-xl tracking-tight">Samarthan</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>
              <button
                onClick={() => { reset(); router.push('/') }}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {hi ? 'फिर से' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 no-print">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: AI Summary, Evidence & Editable Report */}
            <div className="lg:col-span-7 space-y-6">
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
                  <Edit3 className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {hi ? 'समीक्षा करें और संपादित करें' : 'Review & Edit Details'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {hi ? 'AI द्वारा निकाला गया। आवश्यकतानुसार संशोधित करें।' : 'Extracted via AI. Refine the details if necessary.'}
                  </p>
                </div>
              </motion.div>

              {/* Summary Block */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  {hi ? 'AI सारांश' : 'AI Summary'}
                </h3>
                <p className="text-gray-800 text-sm leading-relaxed font-medium">
                  {hi ? r.summaryHi : r.summary}
                </p>
              </motion.div>
              
              {/* Evidence Vault */}
              {sharedImage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <EvidenceVault file={sharedImage} hi={hi} />
                </motion.div>
              )}

              {/* Editable Fields */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {hi ? 'अपराध की श्रेणी' : 'Crime Category'}
                  </label>
                  <select 
                    value={r.fraudType}
                    onChange={(e) => handleUpdate('fraudType', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none transition-all"
                  >
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Women/Children Crime">Women/Children Crime</option>
                    <option value="Extortion & Blackmail">Extortion & Blackmail</option>
                    <option value="Identity Theft">Identity Theft</option>
                    <option value="E-Commerce Scams">E-Commerce Scams</option>
                    <option value="Other Cyber Crimes">Other Cyber Crimes</option>
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
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>{hi ? 'शिकायत का मसौदा' : 'Complaint Draft'}</span>
                    <span className="text-blue-500 font-semibold">{hi ? '(संपादित करें)' : '(Editable)'}</span>
                  </label>
                  <textarea 
                    value={hi ? r.complaintDraftHi : r.complaintDraft}
                    onChange={(e) => hi 
                      ? handleUpdate('complaintDraftHi', e.target.value)
                      : handleUpdate('complaintDraft', e.target.value)
                    }
                    rows={10}
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
                  />
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4">
                <a href="tel:1930" className="flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 font-bold text-sm transition-all shadow-md hover:shadow-lg">
                  <Phone className="w-5 h-5" />
                  {hi ? '1930 कॉल करें' : 'Call 1930'}
                </a>
                <button onClick={handleShare} className="flex flex-col items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl py-4 font-bold text-sm transition-all shadow-md hover:shadow-lg">
                  <Share2 className="w-5 h-5" />
                  {hi ? 'परिवार को भेजें' : 'Share Status'}
                </button>
              </motion.div>

              <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-2xl py-4 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                <Printer className="w-5 h-5" />
                {hi ? 'PDF / प्रिंट करें' : 'Save as PDF / Print'}
              </button>
            </div>

            {/* RIGHT COLUMN: Action Steps & Tracking */}
            <div className="lg:col-span-5 space-y-6">
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border border-red-200 shadow-sm">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {hi ? 'कार्रवाई और ट्रैकिंग' : 'Action & Tracking'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {hi ? 'नीचे दिए गए कदम क्रम से उठाएं।' : 'Execute the next steps immediately.'}
                  </p>
                </div>
              </motion.div>

              {/* Incident ID & Urgency */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-stretch gap-4">
                <div className="bg-gray-900 rounded-3xl p-4 text-white flex-1 flex flex-col justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{hi ? 'घटना संख्या' : 'Incident ID'}</p>
                  <p className="font-mono font-bold text-xl tracking-wider">{r.incidentId}</p>
                </div>
                <div className="flex-1">
                  <UrgencyBadge level={r.urgencyLevel} language={language} size="lg" />
                </div>
              </motion.div>

              {/* Smart Actions (Bank Email & Police Routing) */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SmartActions bankName={r.bankName} incidentId={r.incidentId} amount={r.amount} hi={hi} />
              </motion.div>

              {/* FIR Status Tracker */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <FIRTracker hi={hi} />
              </motion.div>

              {/* Freeze Steps (Optional, collapsed or inside a smaller container) */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  {hi ? 'खाता फ्रीज़ करें' : 'Manual Freeze Steps'}
                </h3>
                <FreezeStepper steps={r.freezeSteps} language={language} />
              </motion.div>



            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
