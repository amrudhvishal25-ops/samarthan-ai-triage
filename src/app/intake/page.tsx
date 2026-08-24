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

  // Package all modalities and send to AI
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

  // Pre-fill states from query params / context
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
      <div className="min-h-screen bg-white">
        <LoadingTriage language={language} />
      </div>
    )
  }

  let categoryLabel = categoryParam
  if (categoryParam === 'auto') categoryLabel = hi ? 'AI ऑटो-डिटेक्ट' : 'AI Auto-Detect'

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col pb-20 relative">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-lg tracking-tight">
            {hi ? 'शिकायत विवरण' : 'Incident Details'}
          </h1>
          {(scenario || categoryLabel) && (
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              {scenario 
                ? (hi ? `सैंडबॉक्स: ${scenario.titleHi}` : `Sandbox: ${scenario.title}`)
                : (hi ? `श्रेणी: ${categoryLabel}` : `Category: ${categoryLabel}`)}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-8 space-y-8 max-w-2xl mx-auto w-full relative z-10">
        
        {scenario && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm"
          >
            <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {hi ? 'सैंडबॉक्स मोड — काल्पनिक डेटा' : 'Sandbox Mode — Synthetic Data'}
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {hi ? scenario.descriptionHi : scenario.description}
            </p>
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {hi ? 'क्या हुआ?' : 'What Happened?'}
            </h2>
            <p className="text-gray-500 text-sm">
              {hi ? 'आप टाइप कर सकते हैं, बोल सकते हैं या सबूत (स्क्रीनशॉट) जोड़ सकते हैं।' : 'You can type, record a voice note, and attach evidence. Use any combination.'}
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 p-6 shadow-sm space-y-6">
            
            {/* TEXT INPUT */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-gray-400" />
                {hi ? 'विवरण टाइप करें' : 'Type Details'}
              </label>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={5}
                placeholder={hi ? 'विस्तार से बताएं (वैकल्पिक)...' : 'Describe the incident in detail (Optional)...'}
                className="w-full rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 p-4 text-sm text-gray-900 resize-none transition-all outline-none bg-gray-50"
              />
            </div>

            <div className="h-px w-full bg-gray-100 my-2"></div>

            {/* VOICE INPUT */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <Mic className="w-4 h-4 text-gray-400" />
                {hi ? 'वॉइस नोट रिकॉर्ड करें' : 'Record Voice Note'}
              </label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <AudioRecorder language={language} onAudioReady={setAudioBlob} />
              </div>
            </div>

            <div className="h-px w-full bg-gray-100 my-2"></div>

            {/* EVIDENCE UPLOAD */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <ImagePlus className="w-4 h-4 text-gray-400" />
                {hi ? 'सबूत संलग्न करें' : 'Attach Evidence'}
              </label>
              
              {imageFile ? (
                <div className="relative w-full rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{imageFile.name}</p>
                    <p className="text-xs text-green-700 font-medium">Ready for Vault</p>
                  </div>
                  <button 
                    onClick={() => { setImageFile(null); setSharedImage(null); }}
                    className="p-2 hover:bg-green-100 rounded-full text-green-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600 transition-all"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm font-semibold">{hi ? 'स्क्रीनशॉट या फ़ाइल अपलोड करें' : 'Upload Screenshot / File'}</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>

          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}

        <button
          onClick={() => handleAIAnalyze()}
          disabled={!textValue && !audioBlob && !imageFile && !scenario}
          className="w-full flex items-center justify-center gap-2 rounded-full font-bold text-white py-5 text-lg bg-gray-900 hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scenario ? (hi ? 'AI से तैयार करें →' : 'Run AI Triage →') : (hi ? 'AI विश्लेषण शुरू करें' : 'Analyze with AI')}
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
