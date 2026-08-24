'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, AlertCircle, FileText, Mic, ImagePlus, ShieldAlert, CheckCircle2, X } from 'lucide-react'
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
      if (categoryParam && categoryParam !== 'auto') formData.append('fraudType', categoryParam)
      if (scenario) formData.append('scenarioId', scenario.id)
      const finalTxt = forcedText || textValue
      if (finalTxt.trim()) formData.append('text', finalTxt)
      if (audioBlob) formData.append('audio', audioBlob, 'recording.webm')
      const finalImg = forcedImg || imageFile
      if (finalImg) formData.append('image', finalImg)

      const resp = await fetch('/api/triage', { method: 'POST', body: formData })
      if (!resp.ok) throw new Error('Failed to process. Please try again.')
      const result = await resp.json()
      setTriageResult(result)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
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

      {/* ── NAVBAR ── */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors h-auto min-h-0"
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
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {hi ? 'क्या हुआ?' : 'What happened?'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {hi ? 'टाइप करें, वॉइस नोट दें, या सबूत अपलोड करें — जो भी आपके लिए आसान हो।'
              : 'Type, record a voice note, or upload evidence — any combination works.'}
          </p>
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
                  className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-500 transition-colors h-auto min-h-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-20 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600 transition-all h-auto min-h-[80px]"
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
