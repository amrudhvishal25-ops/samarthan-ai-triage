'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Share2, Printer, RotateCcw, Edit3, ShieldAlert } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import UrgencyBadge from '@/components/UrgencyBadge'
import FreezeStepper from '@/components/FreezeStepper'
import PrintableComplaint from '@/components/PrintableComplaint'
import EvidenceVault from '@/components/EvidenceVault'
import SmartActions from '@/components/SmartActions'
import FIRTracker from '@/components/FIRTracker'
import Navbar from '@/components/Navbar'
import CallOperatorModal from '@/components/CallOperatorModal'
import ApplicableLaws from '@/components/ApplicableLaws'
import ComplaintUpdates from '@/components/ComplaintUpdates'
import { useComplaints, EvidenceImage, ComplaintUpdate } from '@/hooks/useComplaints'
import { ComplaintStatus } from '@/data/scenarios'

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const { triageResult, setTriageResult, language, setLanguage, reset, sharedImage } = useTriage()
  const { save, getById, advanceStatus, setStatusAtLeast, addEvidenceImage, removeEvidenceImage, addUpdate } = useComplaints()
  const [status, setStatus] = useState<ComplaintStatus>('SUBMITTED')
  const [evidenceImages, setEvidenceImages] = useState<EvidenceImage[]>([])
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([])
  const [callModalHotline, setCallModalHotline] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const hi = language === 'hi'
  const mounted = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTimeout(() => { mounted.current = true }, 0)
  }, [])

  useEffect(() => {
    if (mounted.current && !triageResult) router.replace('/')
  }, [triageResult, router])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!triageResult) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      save({
        incidentId: triageResult.incidentId,
        fraudType: triageResult.fraudType,
        fraudsterIdentifier: triageResult.fraudsterIdentifier,
        complainantName: triageResult.complainantName,
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
        applicableLaws: triageResult.applicableLaws,
        recommendedChannel: triageResult.recommendedChannel ?? 'helpline',
        recommendedChannelTarget: triageResult.recommendedChannelTarget ?? '1930',
        language,
      })
        .then(() => getById(triageResult.incidentId))
        .then(async record => {
          if (!record) return
          setStatus(record.status)
          if (record.evidenceImages.length === 0 && sharedImage) {
            const dataUrl = await readAsDataUrl(sharedImage)
            const updated = await addEvidenceImage(triageResult.incidentId, { name: sharedImage.name, dataUrl })
            if (updated) setEvidenceImages(updated)
          } else {
            setEvidenceImages(record.evidenceImages)
          }
          setUpdates(record.updates)
        })
        .catch(err => console.error('Failed to save complaint:', err))
    }, 2000)

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current) }
  }, [triageResult, save, getById, addEvidenceImage, sharedImage, language])

  const handleAddEvidence = async (file: File) => {
    if (!triageResult) return
    const dataUrl = await readAsDataUrl(file)
    const updated = await addEvidenceImage(triageResult.incidentId, { name: file.name, dataUrl })
    if (updated) setEvidenceImages(updated)
  }

  const handleRemoveEvidence = async (imageId: string) => {
    if (!triageResult) return
    const updated = await removeEvidenceImage(triageResult.incidentId, imageId)
    if (updated) setEvidenceImages(updated)
  }

  const handleAddUpdate = async (note: string) => {
    if (!triageResult) return
    let actionPoints: string[] = []
    let actionPointsHi: string[] = []
    try {
      const resp = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note,
          fraudType: triageResult.fraudType,
          summary: triageResult.summary,
          frauderContact: triageResult.frauderContact,
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        actionPoints = data.actionPoints ?? []
        actionPointsHi = data.actionPointsHi ?? []
      }
    } catch (err) {
      console.warn('Failed to generate follow-up action points:', err)
    }
    const updated = await addUpdate(triageResult.incidentId, note, actionPoints, actionPointsHi)
    if (updated) {
      setUpdates(updated)
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
      const newDraft = (triageResult.complaintDraft || '') + `\n\n[SUPPLEMENTARY STATEMENT — ${timeStr}]\nI further report the following fresh evidence/update: ${note}`
      const newDraftHi = (triageResult.complaintDraftHi || '') + `\n\n[पूरक बयान — ${timeStr}]\nमैं आगे निम्नलिखित नया साक्ष्य/अपडेट रिपोर्ट करता हूँ: ${note}`
      setTriageResult({
        ...triageResult,
        complaintDraft: newDraft,
        complaintDraftHi: newDraftHi,
      })
    }
  }

  const handleAdvanceStatus = async () => {
    if (!triageResult) return
    const next = await advanceStatus(triageResult.incidentId)
    if (next) setStatus(next)
  }

  const handleBankNotified = async () => {
    if (!triageResult) return
    const next = await setStatusAtLeast(triageResult.incidentId, 'BANK_NOTIFIED')
    if (next) setStatus(next)
  }

  const handlePlatformReported = async () => {
    if (!triageResult) return
    const next = await setStatusAtLeast(triageResult.incidentId, 'PLATFORM_REPORTED')
    if (next) setStatus(next)
  }

  const handlePoliceRouted = async () => {
    if (!triageResult) return
    const next = await setStatusAtLeast(triageResult.incidentId, 'FIR_FILED')
    if (next) setStatus(next)
  }

  if (!triageResult) return null

  const r = triageResult
  const allFollowUpPoints = updates.flatMap(u => hi ? u.actionPointsHi : u.actionPoints)

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
      showToast('Copied to clipboard!')
    }
  }

  return (
    <main className="min-h-screen bg-white pb-20 font-sans relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900 text-white text-sm px-4 py-2 rounded-full shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <PrintableComplaint result={r} language={language} />

      <div className="no-print">
        <Navbar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')} />
      </div>

      <CallOperatorModal
        open={!!callModalHotline}
        onClose={() => setCallModalHotline(null)}
        hotline={callModalHotline || '1930'}
        hi={hi}
        incidentId={r.incidentId}
        fraudType={r.fraudType}
        amount={r.amount}
        summary={hi ? r.summaryHi : r.summary}
        followUpPoints={allFollowUpPoints}
        updates={updates}
      />

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
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 rounded-md px-3 py-1.5 transition-colors "
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {hi ? 'फिर से' : 'New Report'}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 space-y-4">

            {/* Editable Report Details */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {hi ? 'शिकायत विवरण' : 'Complaint Details'}
                </p>
              </div>
              <div className="px-5 py-5 space-y-4">

                {/* Category */}
                <div>
                  <label htmlFor="crime-category" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                    {hi ? 'अपराध श्रेणी' : 'Crime Category'}
                  </label>
                  <select
                    id="crime-category"
                    value={r.fraudType}
                    onChange={(e) => handleUpdate('fraudType', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Women/Children Related Crime">Women/Children Related Crime</option>
                    <option value="Extortion & Blackmail">Extortion & Blackmail</option>
                    <option value="Identity Theft">Identity Theft</option>
                    <option value="E-Commerce Scams">E-Commerce Scams</option>
                    <option value="Other Cyber Crime">Other Cyber Crime</option>
                  </select>
                </div>

                {/* Complainant Name */}
                <div>
                  <label htmlFor="complainant-name" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                    {hi ? 'शिकायतकर्ता' : 'Complainant'}
                  </label>
                  <input
                    id="complainant-name"
                    type="text" value={r.complainantName || ''}
                    readOnly
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-500 bg-zinc-100 cursor-not-allowed outline-none transition-all"
                  />
                </div>

                {/* Fraudster Name + Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fraudster-name" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                      {hi ? 'आरोपी का नाम' : 'Fraudster Name'}
                    </label>
                    <input
                      id="fraudster-name"
                      type="text" value={r.fraudsterIdentifier || ''}
                      onChange={(e) => handleUpdate('fraudsterIdentifier', e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="amount-lost" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                      {hi ? 'राशि (₹)' : 'Amount Lost (₹)'}
                    </label>
                    <input
                      id="amount-lost"
                      type="number" value={r.amount}
                      onChange={(e) => handleUpdate('amount', Number(e.target.value))}
                      className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Fraudster Contact */}
                <div>
                  <label htmlFor="fraudster-contact" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                    {hi ? 'आरोपी का संपर्क' : 'Fraudster Contact'}
                  </label>
                  <input
                    id="fraudster-contact"
                    type="text" value={r.frauderContact}
                    onChange={(e) => handleUpdate('frauderContact', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Complaint Draft */}
                <div>
                  <label htmlFor="complaint-draft" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>{hi ? 'शिकायत मसौदा' : 'Complaint Draft'}</span>
                    <span className="text-zinc-400 normal-case font-normal">{hi ? 'संपादन योग्य' : 'Editable'}</span>
                  </label>
                  <textarea
                    id="complaint-draft"
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

            {/* Evidence Vault */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <EvidenceVault
                hi={hi}
                images={evidenceImages}
                onAdd={handleAddEvidence}
                onRemove={handleRemoveEvidence}
              />
            </motion.div>

            {/* Complaint Updates */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
              <ComplaintUpdates hi={hi} updates={updates} onAdd={handleAddUpdate} />
            </motion.div>

            {/* Action buttons (left column) */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-3">
              <button
                onClick={() => setCallModalHotline('1930')}
                className="w-full flex flex-col items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-4 font-semibold text-base transition-all shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {hi ? '1930 कॉल करें' : 'Call 1930 Helpline'}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 rounded px-1.5 py-0.5 mt-0.5">
                  Live Emergency
                </span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center gap-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 rounded-xl py-3 font-semibold text-sm transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    {hi ? 'स्थिति साझा करें' : 'Share Status'}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                    Live
                  </span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex flex-col items-center justify-center gap-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl py-3 font-medium text-sm transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <Printer className="w-4 h-4" />
                    {hi ? 'PDF / प्रिंट करें' : 'Save as PDF / Print'}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                    Live
                  </span>
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ApplicableLaws laws={r.applicableLaws} hi={hi} />
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
              <SmartActions
                bankName={r.bankName} incidentId={r.incidentId} amount={r.amount} hi={hi}
                fraudsterIdentifier={r.fraudsterIdentifier} summary={hi ? r.summaryHi : r.summary}
                recommendedChannel={r.recommendedChannel}
                recommendedChannelTarget={r.recommendedChannelTarget}
                followUpPoints={allFollowUpPoints}
                onBankNotified={handleBankNotified}
                onPlatformReported={handlePlatformReported}
                onPoliceRouted={handlePoliceRouted}
              />
            </motion.div>

            {/* FIR Tracker */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <FIRTracker hi={hi} status={status} onAdvance={handleAdvanceStatus} />
            </motion.div>

            {/* Freeze Steps */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="border border-zinc-200 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {hi ? 'तत्काल सुझाई गई कार्रवाई' : 'Recommended Immediate Actions'}
                </p>
                <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                  Live Guidance
                </span>
              </div>
              <FreezeStepper steps={r.freezeSteps} language={language} onHotlineClick={setCallModalHotline} />
            </motion.div>

          </div>
        </div>
      </div>
    </main>
  )
}
