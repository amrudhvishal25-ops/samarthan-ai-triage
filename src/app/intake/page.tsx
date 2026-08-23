'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, ImagePlus, FileText, ArrowLeft, ArrowRight, AlertCircle, Edit3, CheckCircle2 } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SCENARIOS, TriageResult } from '@/data/scenarios'
import AudioRecorder from '@/components/AudioRecorder'
import LoadingTriage from '@/components/LoadingTriage'
import clsx from 'clsx'

type InputMode = 'voice' | 'screenshot' | 'text'

function IntakeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const textParam = searchParams.get('text')
  const modeParam = searchParams.get('mode') as InputMode | null
  const autoStartParam = searchParams.get('autoStart')

  const { language, scenarioId, setTriageResult, isLoading, setIsLoading } = useTriage()
  const hi = language === 'hi'

  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [textValue, setTextValue] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const hasAutoStarted = useRef(false)

  // Step state: 'input' -> 'review'
  const [step, setStep] = useState<'input' | 'review'>('input')
  const [draftResult, setDraftResult] = useState<TriageResult | null>(null)

  const scenario = scenarioId ? SCENARIOS.find((s) => s.id === scenarioId) : null

  const handleAIAnalyze = async (overrideText?: string | React.MouseEvent) => {
    setError(null)
    const textToSubmit = typeof overrideText === 'string' ? overrideText : textValue

    if (!scenarioId) {
      if (inputMode === 'text' && !textToSubmit.trim()) {
        setError(hi ? 'कृपया अपना विवरण लिखें।' : 'Please describe what happened.')
        return
      }
      if (inputMode === 'voice' && !audioBlob) {
        setError(hi ? 'कृपया पहले रिकॉर्डिंग करें।' : 'Please record your account first.')
        return
      }
      if (inputMode === 'screenshot' && !imageFile) {
        setError(hi ? 'कृपया स्क्रीनशॉट अपलोड करें।' : 'Please upload a screenshot.')
        return
      }
    }

    setIsLoading(true)

    try {
      const fd = new FormData()
      if (scenarioId) fd.append('scenarioId', scenarioId)
      if (categoryParam) fd.append('category', categoryParam)
      if (textToSubmit.trim()) fd.append('textInput', textToSubmit)
      if (audioBlob) fd.append('audio', audioBlob, 'recording.webm')
      if (imageFile) fd.append('image', imageFile)

      const resp = await fetch('/api/triage', { method: 'POST', body: fd })
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error || 'Failed to analyze')
      }

      const result = await resp.json()
      setDraftResult(result)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let modeChanged = false;
    if (modeParam && ['text', 'voice', 'screenshot'].includes(modeParam) && modeParam !== inputMode) {
      setInputMode(modeParam)
      modeChanged = true;
      if (modeParam === 'screenshot' && !imageFile && fileRef.current) {
        setTimeout(() => fileRef.current?.click(), 150)
      }
    }

    const decodedText = textParam ? decodeURIComponent(textParam) : ''
    if (decodedText && !textValue) {
      setTextValue(decodedText)
    }

    if (autoStartParam === 'true' && decodedText && !hasAutoStarted.current) {
      hasAutoStarted.current = true
      handleAIAnalyze(decodedText)
    }
  }, [textParam, modeParam, autoStartParam])

  const handleConfirmEdit = () => {
    if (draftResult) {
      setTriageResult(draftResult)
      router.push('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingTriage language={language} />
      </div>
    )
  }

  // --- RENDER REVIEW STEP ---
  if (step === 'review' && draftResult) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col pb-10">
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setStep('input')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base">
              {hi ? 'समीक्षा करें और संपादित करें' : 'Review & Edit Details'}
            </h1>
            <p className="text-xs text-saffron font-semibold mt-0.5">
              {hi ? 'दर्ज करने से पहले जांच लें' : 'Verify before filing'}
            </p>
          </div>
        </div>

        <div className="px-5 py-6 space-y-5 max-w-lg mx-auto w-full">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm flex gap-2 items-start">
            <Edit3 className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <p>
              {hi 
                ? 'AI ने आपके विवरण से यह जानकारी निकाली है। यदि कुछ गलत है, तो आप इसे यहाँ बदल सकते हैं।'
                : 'AI extracted these details from your input. You can edit them if anything is incorrect.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {hi ? 'अपराध की श्रेणी' : 'Crime Category'}
              </label>
              <select 
                value={draftResult.fraudType}
                onChange={(e) => setDraftResult({ ...draftResult, fraudType: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-civic-blue bg-gray-50"
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

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {hi ? 'पीड़ित का नाम' : 'Victim Name'}
              </label>
              <input 
                type="text" 
                value={draftResult.victimName}
                onChange={(e) => setDraftResult({ ...draftResult, victimName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-civic-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {hi ? 'आरोपी का संपर्क' : 'Fraudster Contact'}
              </label>
              <input 
                type="text" 
                value={draftResult.frauderContact}
                onChange={(e) => setDraftResult({ ...draftResult, frauderContact: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-civic-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {hi ? 'राशि (यदि लागू हो)' : 'Amount (If applicable)'}
              </label>
              <input 
                type="number" 
                value={draftResult.amount}
                onChange={(e) => setDraftResult({ ...draftResult, amount: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-civic-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {hi ? 'शिकायत का मसौदा' : 'Complaint Draft'}
              </label>
              <textarea 
                value={hi ? draftResult.complaintDraftHi : draftResult.complaintDraft}
                onChange={(e) => hi 
                  ? setDraftResult({ ...draftResult, complaintDraftHi: e.target.value })
                  : setDraftResult({ ...draftResult, complaintDraft: e.target.value })
                }
                rows={8}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-civic-blue"
              />
            </div>
          </div>

          <button
            onClick={handleConfirmEdit}
            className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white py-4 text-base bg-green-600 hover:bg-green-700 transition-all shadow-md min-h-[56px]"
          >
            <CheckCircle2 className="w-5 h-5" />
            {hi ? 'पुष्टि करें और डैशबोर्ड पर जाएं' : 'Confirm & Generate Dashboard'}
          </button>
        </div>
      </main>
    )
  }

  // --- RENDER INPUT STEP ---
  const inputModes: { id: InputMode; label: string; labelHi: string; Icon: React.ElementType }[] = [
    { id: 'text', label: 'Type', labelHi: 'टाइप करें', Icon: FileText },
    { id: 'voice', label: 'Speak', labelHi: 'बोलें', Icon: Mic },
    { id: 'screenshot', label: 'Upload', labelHi: 'अपलोड करें', Icon: ImagePlus },
  ]

  let categoryLabel = categoryParam
  if (categoryParam === 'auto') categoryLabel = hi ? 'AI ऑटो-डिटेक्ट' : 'AI Auto-Detect'

  return (
    <main className="min-h-screen bg-white flex flex-col pb-10">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-base">
            {hi ? 'अपनी शिकायत दर्ज करें' : 'File Your Report'}
          </h1>
          {(scenario || categoryLabel) && (
            <p className="text-xs text-saffron font-semibold mt-0.5">
              {scenario 
                ? (hi ? `सैंडबॉक्स: ${scenario.titleHi}` : `Sandbox: ${scenario.title}`)
                : (hi ? `श्रेणी: ${categoryLabel}` : `Category: ${categoryLabel}`)}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 max-w-lg mx-auto w-full">
        {scenario && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-civic-blueLight border border-civic-blue/20 rounded-2xl p-4"
          >
            <p className="text-xs font-bold text-civic-blue mb-1 uppercase tracking-wide">
              {hi ? 'सैंडबॉक्स मोड — काल्पनिक डेटा' : 'Sandbox Mode — Synthetic Data'}
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {hi ? scenario.descriptionHi : scenario.description}
            </p>
          </motion.div>
        )}

        {!scenario && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {hi ? 'अपना विवरण कैसे देना चाहेंगे?' : 'How would you like to describe what happened?'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {inputModes.map(({ id, label, labelHi, Icon }) => (
                <button
                  key={id}
                  onClick={() => setInputMode(id)}
                  className={clsx(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-semibold text-sm',
                    inputMode === id
                      ? 'border-civic-blue bg-civic-blueLight text-civic-blue'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  {hi ? labelHi : label}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {(!scenario && inputMode === 'text') || scenario ? (
            <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {scenario
                  ? (hi ? 'या अपना विवरण जोड़ें (वैकल्पिक)' : 'Or add your own details (optional)')
                  : (hi ? 'क्या हुआ? विस्तार से बताएं' : 'What happened? Describe in detail')}
              </label>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={6}
                placeholder={hi ? 'विस्तार से बताएं...' : 'Describe in detail...'}
                className="w-full rounded-2xl border-2 border-gray-200 focus:border-civic-blue focus:outline-none p-4 text-sm text-gray-700 resize-none transition-colors"
              />
            </motion.div>
          ) : null}

          {!scenario && inputMode === 'voice' && (
            <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AudioRecorder language={language} onAudioReady={setAudioBlob} />
            </motion.div>
          )}

          {!scenario && inputMode === 'screenshot' && (
            <motion.div key="screenshot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <button
                onClick={() => fileRef.current?.click()}
                className={clsx(
                  'w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2',
                  imageFile ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-300 text-gray-400'
                )}
              >
                <ImagePlus className="w-8 h-8" />
                <span className="text-sm font-medium">{imageFile ? imageFile.name : (hi ? 'फ़ाइल चुनें' : 'Choose file')}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}

        <button
          onClick={handleAIAnalyze}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white py-4 text-base bg-civic-blue hover:bg-civic-blueMid transition-all min-h-[56px]"
        >
          {scenario ? (hi ? 'AI से तैयार करें →' : 'Run AI Triage →') : (hi ? 'AI से जांच करें →' : 'Analyze with AI →')}
          <ArrowRight className="w-5 h-5" />
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
