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
      <div className="min-h-screen bg-[#fafafa]">
        <LoadingTriage language={language} />
      </div>
    )
  }

  let categoryLabel = categoryParam
  if (categoryParam === 'auto') categoryLabel = hi ? 'AI ऑटो-डिटेक्ट' : 'AI Auto-Detect'

  return (
    <main className="min-h-screen flex flex-col pb-20 relative bg-[#fafafa]">
      
      {/* Light standard background pattern */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* NAVBAR: Standard light theme */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
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

      <div className="flex-1 px-4 py-8 max-w-xl mx-auto w-full relative z-10">
        
        {/* THE COLORED WIDGET CARD */}
        <div className="rounded-[32px] p-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#8a9ba8] via-[#6c8291] to-[#516470] border border-white/20">
          
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">
              {hi ? 'क्या हुआ?' : 'What Happened?'}
            </h2>
            <p className="text-white/80 text-sm">
              {hi ? 'आप टाइप कर सकते हैं, बोल सकते हैं या सबूत जोड़ सकते हैं।' : 'Provide details by typing, speaking, or uploading.'}
            </p>
          </div>
          
          <div className="space-y-5">
            {/* TEXT INPUT (White bg, dark text) */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2 shadow-sm">
                {hi ? 'विवरण' : 'Details'}
              </label>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={4}
                placeholder={hi ? 'विस्तार से बताएं...' : 'Describe the incident...'}
                className="w-full rounded-2xl border-none focus:ring-4 focus:ring-white/30 p-4 text-sm text-gray-900 placeholder-gray-400 resize-none transition-all outline-none bg-white shadow-inner"
              />
            </div>

            {/* VOICE INPUT (White bg, dark text) */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2 shadow-sm">
                {hi ? 'वॉइस नोट' : 'Voice Note'}
              </label>
              <div className="bg-white rounded-2xl p-4 shadow-inner">
                <AudioRecorder language={language} onAudioReady={setAudioBlob} theme="light" />
              </div>
            </div>

            {/* EVIDENCE UPLOAD (White bg, dark text) */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2 shadow-sm">
                {hi ? 'सबूत संलग्न करें' : 'Attach Evidence'}
              </label>
              
              {imageFile ? (
                <div className="relative w-full rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{imageFile.name}</p>
                  </div>
                  <button 
                    onClick={() => { setImageFile(null); setSharedImage(null); }}
                    className="p-2 hover:bg-green-200 rounded-full text-green-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-20 rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-inner"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-sm font-medium">{hi ? 'अपलोड करें' : 'Upload File'}</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              onClick={() => handleAIAnalyze()}
              disabled={!textValue && !audioBlob && !imageFile && !scenario}
              className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white py-4 text-base bg-gray-900 hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {scenario ? (hi ? 'AI से तैयार करें' : 'Run AI Triage') : (hi ? 'सबमिट करें' : 'Analyze with AI')}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <IntakeContent />
    </Suspense>
  )
}
