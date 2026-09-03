'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, AlertCircle, FileText, Mic, ImagePlus, ShieldAlert, CheckCircle2, X } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SCENARIOS, TriageResult } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'
import AudioRecorder from '@/components/AudioRecorder'
import LoadingTriage from '@/components/LoadingTriage'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/hooks/useAuth'

function IntakeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const autoStartParam = searchParams.get('autoStart')
  const textParam = searchParams.get('text')

  const { language, setLanguage, scenarioId, setTriageResult, sharedImage, setSharedImage } = useTriage()
  const { getUser } = useAuth()
  const hi = language === 'hi'
  const scenario = SCENARIOS.find(s => s.id === scenarioId)

  const [textValue, setTextValue] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const hasAutoStarted = useRef(false)

  const handleAIAnalyze = async (forcedText?: string, forcedImg?: File) => {
    setIsLoading(true)
    setError('')

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError(hi
        ? 'आप ऑफ़लाइन हैं। कृपया इंटरनेट कनेक्शन जांचें और फिर से कोशिश करें।'
        : "You're offline. Check your internet connection and try again.")
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const formData = new FormData()
      formData.append('language', language)
      if (categoryParam && categoryParam !== 'auto') formData.append('fraudType', categoryParam)
      if (scenario) formData.append('scenarioId', scenario.id)
      const finalTxt = forcedText || textValue
      if (finalTxt.trim()) formData.append('text', finalTxt)
      if (audioBlob) formData.append('audio', audioBlob, 'recording.webm')
      const finalImg = forcedImg || imageFile
      if (finalImg) formData.append('image', finalImg)
      // Pass complainant name so AI can reference it in the formal draft
      const user = getUser()
      if (user?.name) formData.append('complainantName', user.name)

      const resp = await fetch('/api/triage', { method: 'POST', body: formData, signal: controller.signal })

      let result: TriageResult
      if (resp.ok) {
        result = await resp.json()
      } else {
        console.warn('[intake] Serverless triage non-ok, using smart dynamic client fallback')
        const inferredCat = (categoryParam && categoryParam !== 'auto') ? categoryParam : 'Financial Fraud'
        const rawAmount = (finalTxt.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || finalTxt.match(/(\d+)\s*(?:rupees|rs)/i))?.[1]
        const cleanAmount = rawAmount ? parseInt(rawAmount.replace(/,/g, ''), 10) : 0
        const idNum = Math.floor(10000000000000 + Math.random() * 90000000000000).toString()

        const categoryMap: Record<string, string> = {'वित्तीय धोखाधड़ी': 'Financial Fraud', 'महिला/बाल अपराध': 'Women/Children Related Crime', 'जबरन वसूली': 'Extortion & Blackmail', 'पहचान की चोरी': 'Identity Theft', 'ई-कॉमर्स धोखाधड़ी': 'E-Commerce Scams', 'अन्य साइबर अपराध': 'Other Cyber Crime'}
        const mappedCat = categoryMap[inferredCat] || inferredCat
        const inferred = inferChannelFromFraudType(mappedCat as any)
        result = {
          incidentId: idNum,
          fraudsterIdentifier: 'Not Identified', complainantName: '',
          fraudType: inferredCat as any,
          recommendedChannel: inferred.channel,
          recommendedChannelTarget:
            inferred.channel === 'bank'
              ? (finalTxt.match(/sbi|hdfc|icici|axis|kotak|pnb/i)?.[0]?.toUpperCase() || 'the bank')
              : inferred.target,
          frauderContact: 'Unknown',
          amount: cleanAmount || (inferredCat === 'Financial Fraud' ? 15000 : 0),
          bankName: finalTxt.match(/sbi|hdfc|icici|axis|kotak|pnb/i)?.[0]?.toUpperCase() || 'N/A',
          accountNumber: 'N/A',
          upiId: finalTxt.match(/[\w.-]+@[\w.-]+/)?.[0] || undefined,
          timeline: new Date().toLocaleString('en-IN'),
          summary: finalTxt.length > 20 ? finalTxt.substring(0, 180) + '...' : `Cyber incident reported under ${inferredCat}.`,
          summaryHi: `${inferredCat} के तहत साइबर घटना दर्ज की गई।`,
          complaintDraft: `To,\nThe Station House Officer,\nCyber Crime Cell\n\nSubject: Formal Complaint Regarding ${inferredCat}\n\nRespected Sir/Madam,\n\nI, ${user?.name || 'Pratham Kamath'}, hereby lodge a formal complaint regarding an unauthorized incident: ${finalTxt || 'Online cyber fraud'}.\n\nKindly investigate the matter and initiate legal proceedings.\n\nYours faithfully,\n${user?.name || 'Pratham Kamath'}`,
          complaintDraftHi: `सेवा में,\nथाना प्रभारी,\nसाइबर क्राइम सेल\n\nविषय: ${inferredCat} के संबंध में औपचारिक शिकायत\n\nमहोदय,\n\nमैं, ${user?.name || 'प्रथम कामत'}, इस अनधिकृत घटना की रिपोर्ट दर्ज करा रहा हूँ: ${finalTxt || 'साइबर धोखाधड़ी'}।\n\nकृपया त्वरित कानूनी कार्रवाई करें।\n\nभवदीय,\n${user?.name || 'प्रथम कामत'}`,
          freezeSteps: [
            {
              step: 1,
              action: 'Call 1930 Cybercrime Helpline',
              actionHi: '1930 साइबर हेल्पलाइन पर कॉल करें',
              detail: 'Report immediately for emergency bank account freezing and golden hour triage.',
              detailHi: 'आपातकालीन बैंक खाता फ्रीज करने के लिए तुरंत रिपोर्ट करें।',
              hotline: '1930',
              url: 'https://cybercrime.gov.in'
            },
            {
              step: 2,
              action: 'File Official NCRP Complaint',
              actionHi: 'NCRP पोर्टल पर आधिकारिक शिकायत दर्ज करें',
              detail: 'Submit this complaint draft to cybercrime.gov.in for police jurisdiction.',
              detailHi: 'पुलिस अधिकार क्षेत्र के लिए cybercrime.gov.in पर यह शिकायत ड्राफ्ट जमा करें।',
              hotline: undefined,
              url: 'https://cybercrime.gov.in'
            }
          ],
          applicableLaws: [
            {
              section: 'IT Act, Section 66D',
              title: 'Cheating by personation by using computer resource',
              titleHi: 'कंप्यूटर संसाधन का उपयोग करके प्रतिरूपण द्वारा धोखाधड़ी',
              reason: 'Applies to online fraud, digital cheating, and cyber extortion.',
              reasonHi: 'ऑनलाइन धोखाधड़ी और डिजिटल ठगी पर लागू होता है।',
            }
          ],
          urgencyLevel: 'HIGH'
        }
      }
      setTriageResult(result)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError(hi
          ? 'यह सामान्य से अधिक समय ले रहा है। आपका इंटरनेट धीमा हो सकता है — कृपया फिर से कोशिश करें।'
          : "This is taking longer than usual — your connection may be slow. Please try again.")
      } else {
        setError(err instanceof Error ? err.message : (hi ? 'कुछ गलत हो गया।' : 'Something went wrong.'))
      }
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const decodedText = textParam ? decodeURIComponent(textParam) : ''
    if (decodedText && !textValue) setTextValue(decodedText)
    if (sharedImage && !imageFile) setImageFile(sharedImage)
    if (autoStartParam === 'true' && !hasAutoStarted.current && decodedText) {
      hasAutoStarted.current = true
      handleAIAnalyze(decodedText)
    }
  }, [textParam, autoStartParam, sharedImage])

  if (isLoading) {
    return <div className="min-h-screen bg-white"><LoadingTriage language={language} /></div>
  }

  let categoryLabel = categoryParam
  if (categoryParam === 'auto') categoryLabel = hi ? 'AI ऑटो-डिटेक्ट' : 'AI Auto-Detect'

  return (
    <main className="min-h-screen bg-white font-sans pb-20">

      <Navbar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')} />

      {/* ── BACK BAR ── */}
      <header className="border-b border-zinc-200 bg-white sticky top-14 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label={hi ? 'वापस जाएं' : 'Go back'}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors "
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{hi ? 'शिकायत विवरण' : 'Incident Details'}</p>
            {(scenario || categoryLabel) && (
              <p className="text-xs text-zinc-500">
                {scenario
                  ? (hi ? `Sandbox: ${scenario.titleHi}` : `Sandbox: ${scenario.title}`)
                  : (hi ? `श्रेणी: ${categoryLabel}` : `Category: ${categoryLabel}`)}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {scenario && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-200 bg-zinc-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              {hi ? 'Sandbox Mode' : 'Sandbox Mode — Synthetic Data'}
            </p>
            <p className="text-sm text-zinc-700">{hi ? scenario.descriptionHi : scenario.description}</p>
          </motion.div>
        )}

        {/* ── PAGE TITLE ── */}
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
            {hi ? 'कुछ भी कहें...' : 'Say anything...'}
          </h1>
        </div>

        {/* ── FORM CARD ── */}
        <div className="border border-zinc-200 rounded-2xl bg-white shadow-sm divide-y divide-zinc-100 overflow-hidden">

          {/* Text */}
          <div className="p-5">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{hi ? 'विवरण लिखें' : 'Type Details'}</span>
            </label>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              rows={5}
              placeholder={hi ? 'विस्तार से बताएं…' : 'Describe the incident in detail…'}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 resize-none outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Voice */}
          <div className="p-5">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" />{hi ? 'वॉइस नोट' : 'Voice Note'}</span>
            </label>
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
              <AudioRecorder language={language} onAudioReady={setAudioBlob} theme="light" />
            </div>
          </div>

          {/* Upload */}
          <div className="p-5">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              <span className="flex items-center gap-1.5"><ImagePlus className="w-3.5 h-3.5" />{hi ? 'सबूत संलग्न करें' : 'Attach Evidence'}</span>
            </label>
            {imageFile ? (
              <div className="flex items-center gap-3 border border-zinc-200 rounded-xl p-3 bg-zinc-50">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{imageFile.name}</p>
                  <p className="text-xs text-zinc-500">Ready for Evidence Vault</p>
                </div>
                <button
                  onClick={() => { setImageFile(null); setSharedImage(null) }}
                  className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-500 transition-colors "
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-20 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600 transition-all "
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs font-medium">{hi ? 'फ़ाइल अपलोड करें' : 'Upload Screenshot or File'}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>

        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}

        {/* ── SUBMIT ── */}
        <button
          onClick={() => handleAIAnalyze()}
          disabled={!textValue && !audioBlob && !imageFile && !scenario}
          className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-white py-3.5 text-sm bg-zinc-900 hover:bg-zinc-700 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {scenario ? (hi ? 'AI से तैयार करें' : 'Run AI Triage') : (hi ? 'AI से विश्लेषण करें' : 'Analyze with AI')}
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </main>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <IntakeContent />
    </Suspense>
  )
}
