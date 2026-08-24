'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, AlertCircle, FileText, 
  Mic, ImagePlus, ShieldAlert, CheckCircle2, X
} from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SCENARIOS } from '@/data/scenarios'
import AudioRecorder from '@/components/AudioRecorder'
import LoadingTriage from '@/components/LoadingTriage'

function IntakeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const autoStartParam = searchParams.get('autoStart')
  const textParam = searchParams.get('text')
  
  const { language, scenarioId, setTriageResult, sharedImage, setSharedImage } = useTriage()
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
    try {
      const formData = new FormData()
      formData.append('language', language)
      if (categoryParam && categoryParam !== 'auto') {
        formData.append('fraudType', categoryParam)
      }

      if (scenario) {
        formData.append('scenarioId', scenario.id)
      }

      const finalTxt = forcedText || textValue
      if (finalTxt.trim()) {
        formData.append('text', finalTxt)
      }

      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.webm')
      }

      const finalImg = forcedImg || imageFile
      if (finalImg) {
        formData.append('image', finalImg)
      }

      const resp = await fetch('/api/triage', {
        method: 'POST',
        body: formData
      })

      if (!resp.ok) {
        throw new Error('Failed to process. Please try again.')
      }

      const result = await resp.json()
      setTriageResult(result)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const decodedText = textParam ? decodeURIComponent(textParam) : ''
    if (decodedText && !textValue) setTextValue(decodedText)
    
    if (sharedImage && !imageFile) {
      setImageFile(sharedImage)
    }

    if (autoStartParam === 'true' && !hasAutoStarted.current) {
      if (decodedText) {
        hasAutoStarted.current = true
        handleAIAnalyze(decodedText)
      }
    }
  }, [textParam, autoStartParam, sharedImage])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#6c8291]">
        <LoadingTriage language={language} />
      </div>
    )
  }

  let categoryLabel = categoryParam
  if (categoryParam === 'auto') categoryLabel = hi ? 'AI ऑटो-डिटेक्ट' : 'AI Auto-Detect'

  return (
    <main className="min-h-screen flex flex-col pb-20 relative bg-gradient-to-br from-[#8a9ba8] via-[#6c8291] to-[#516470] overflow-hidden">
      
      {/* Subtle organic blur spots to mimic a natural photo background, NO purple/black */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-slate-300/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3a505e]/40 rounded-full blur-[120px] pointer-events-none" />

      {/* NAVBAR: Transparent, not glassmorphism, just text */}
      <div className="flex items-center gap-3 px-5 py-4 sticky top-0 z-50">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-white text-lg tracking-tight">
            {hi ? 'शिकायत विवरण' : 'Incident Details'}
          </h1>
          {(scenario || categoryLabel) && (
            <p className="text-xs text-white/70 font-semibold mt-0.5">
              {scenario 
                ? (hi ? `सैंडबॉक्स: ${scenario.titleHi}` : `Sandbox: ${scenario.title}`)
                : (hi ? `श्रेणी: ${categoryLabel}` : `Category: ${categoryLabel}`)}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-8 max-w-xl mx-auto w-full relative z-10">
        
        {/* THE ONLY GLASSMORPHISM COMPONENT: THE ACTUAL FORM */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] space-y-6">
          
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-white mb-1">
              {hi ? 'क्या हुआ?' : 'What Happened?'}
            </h2>
            <p className="text-white/80 text-sm">
              {hi ? 'आप टाइप कर सकते हैं, बोल सकते हैं या सबूत जोड़ सकते हैं।' : 'Provide details by typing, speaking, or uploading.'}
            </p>
          </div>
          
          {/* TEXT INPUT */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              {hi ? 'विवरण' : 'Details'}
            </label>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              rows={4}
              placeholder={hi ? 'विस्तार से बताएं...' : 'Describe the incident...'}
              className="w-full rounded-xl border border-black/20 focus:border-white/30 p-3 text-sm text-white placeholder-white/40 resize-none transition-all outline-none bg-[#0f0f0f] shadow-inner"
            />
          </div>

          {/* VOICE INPUT */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              {hi ? 'वॉइस नोट' : 'Voice Note'}
            </label>
            <div className="bg-[#0f0f0f] rounded-xl p-4 border border-black/20 shadow-inner">
              <AudioRecorder language={language} onAudioReady={setAudioBlob} theme="dark" />
            </div>
          </div>

          {/* EVIDENCE UPLOAD */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              {hi ? 'सबूत संलग्न करें' : 'Attach Evidence'}
            </label>
            
            {imageFile ? (
              <div className="relative w-full rounded-xl border border-green-500/30 bg-green-900/30 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{imageFile.name}</p>
                </div>
                <button 
                  onClick={() => { setImageFile(null); setSharedImage(null); }}
                  className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-20 rounded-xl border border-black/20 bg-[#0f0f0f] flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white transition-all shadow-inner"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm">{hi ? 'अपलोड करें' : 'Upload File'}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 bg-red-900/50 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          {/* SUBMIT BUTTON - Light gray/white like the reference image */}
          <button
            onClick={() => handleAIAnalyze()}
            disabled={!textValue && !audioBlob && !imageFile && !scenario}
            className="w-full flex items-center justify-center gap-2 rounded-xl font-bold text-black py-3.5 text-base bg-[#e6e6e6] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {scenario ? (hi ? 'AI से तैयार करें' : 'Run AI Triage') : (hi ? 'सबमिट करें' : 'Analyze with AI')}
          </button>
        </div>
      </div>
    </main>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#6c8291]" />}>
      <IntakeContent />
    </Suspense>
  )
}
