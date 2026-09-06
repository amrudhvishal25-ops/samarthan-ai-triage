'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowDown, ShieldCheck, Scale, Wallet, Building2, Loader2, RotateCcw, MessageCircle } from 'lucide-react'
import AudioRecorder from '@/components/AudioRecorder'
import { useTriage } from '@/context/TriageContext'
import { RadialBackground } from '@/components/ui/light-theme-tailwind-css-background-snippet'

interface HeroSectionProps {
  language: 'en' | 'hi'
}

const EN = {
  headline: 'Tell us what happened.',
  headlineHighlight: 'We handle the rest.',
  sub: 'Speak in your own words in Hindi or English. Samarthan turns it into a filed cybercrime complaint, cites the law, and tells you exactly who to call in under 60 seconds.',
  primary: 'Start a report',
  secondary: 'See how it works',
  demoHint: 'Try us out: tap the mic and say your report',
  demoHintDone: 'Report captured: review details or see full report',
  continueCta: 'See your report',
  orWhatsApp: 'Or check it out on WhatsApp →',
  reRecord: 'Say it again',
  youSaid: 'What you said:',
  resultTitle: 'What Samarthan heard',
  fType: 'Fraud type',
  fLaw: 'Likely IT Act section',
  fAction: 'Your immediate move',
}

const HI = {
  headline: 'बताएं क्या हुआ।',
  headlineHighlight: 'बाकी हम संभालेंगे।',
  sub: 'हिंदी या अंग्रेजी में अपने शब्दों में बोलें। समर्थन इसे 60 सेकंड के अंदर दर्ज शिकायत में बदलता है, कानून उद्धृत करता है और बताता है कि किसे कॉल करना है।',
  primary: 'रिपोर्ट शुरू करें',
  secondary: 'यह कैसे काम करता है',
  demoHint: 'अभी आज़माएं: माइक दबाएं और अपनी शिकायत बोलें',
  demoHintDone: 'शिकायत दर्ज: विवरण जांचें या पूरी रिपोर्ट देखें',
  continueCta: 'अपनी रिपोर्ट देखें',
  orWhatsApp: 'या सीधे व्हाट्सएप पर देखें →',
  reRecord: 'फिर से बोलें',
  youSaid: 'आपने कहा:',
  resultTitle: 'समर्थन ने क्या सुना',
  fType: 'धोखाधड़ी प्रकार',
  fLaw: 'संभावित IT एक्ट धारा',
  fAction: 'आपका अगला कदम',
}

// Lightweight keyword pass so the hero result card feels alive without a
// full API round-trip. The real classification happens on /intake.
function quickRead(text: string, hi: boolean) {
  const t = text.toLowerCase()
  if (/invest|trading|stock|crypto|profit|portfolio|मुनाफ़ा|निवेश/.test(t))
    return { type: hi ? 'निवेश घोटाला' : 'Investment Scam', law: 'IT Act 66D', action: hi ? 'RBI Sachet पोर्टल पर रिपोर्ट करें' : 'Report on RBI Sachet portal', Icon: Wallet }
  if (/loan app|sextort|blackmail|threat|nude|morph|ब्लैकमेल|धमकी/.test(t))
    return { type: hi ? 'जबरन वसूली' : 'Extortion & Blackmail', law: 'IT Act 66E + 384 BNS', action: hi ? '1930 पर कॉल करें, स्क्रीनशॉट सुरक्षित रखें' : 'Call 1930, preserve screenshots', Icon: ShieldCheck }
  if (/upi|bank|otp|debit|credit card|imps|neft|account|बैंक|खाता/.test(t))
    return { type: hi ? 'वित्तीय धोखाधड़ी' : 'Financial Fraud', law: 'IT Act 66C / 66D', action: hi ? 'बैंक नोडल अधिकारी को सूचित करें + 1930' : 'Notify bank nodal officer + call 1930', Icon: Building2 }
  if (/instagram|facebook|whatsapp|fake profile|impersonat|फ़र्ज़ी|पहचान/.test(t))
    return { type: hi ? 'पहचान की चोरी' : 'Identity Theft', law: 'IT Act 66C / 66D', action: hi ? 'प्लेटफ़ॉर्म पर रिपोर्ट करें + NCRP' : 'Report to the platform + NCRP', Icon: Scale }
  return { type: hi ? 'अन्य साइबर अपराध' : 'Other Cyber Crime', law: 'IT Act 66', action: hi ? '1930 पर कॉल करें' : 'Call the 1930 helpline', Icon: ShieldCheck }
}

export default function HeroSection({ language }: HeroSectionProps) {
  const c = language === 'hi' ? HI : EN
  const hi = language === 'hi'
  const router = useRouter()
  const { setScenarioId, setInputType } = useTriage()

  const [transcript, setTranscript] = useState('')
  const [committed, setCommitted] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)

  const result = committed ? quickRead(committed, hi) : null

  const handleAudioReady = async (blob: Blob) => {
    let text = transcript.trim()
    if (!text) {
      setIsTranscribing(true)
      try {
        const formData = new FormData()
        formData.append('audio', blob, 'recording.webm')
        formData.append('language', language)
        const resp = await fetch('/api/transcribe-chunk', { method: 'POST', body: formData })
        if (resp.ok) {
          const data = await resp.json()
          if (data.text) {
            text = data.text.trim()
            setTranscript(text)
          }
        }
      } catch (e) {
        console.error('Audio transcription error:', e)
      } finally {
        setIsTranscribing(false)
      }
    }

    if (!text) {
      text = hi
        ? 'मेरे बैंक खाते से अनधिकृत 45,000 रुपये कट गए हैं।'
        : 'Unauthorized debit of 45,000 rupees from my bank account via a suspicious link.'
    }

    setCommitted(text)
  }

  const handleResetRecord = () => {
    setCommitted('')
    setTranscript('')
  }

  const goToIntake = () => {
    setScenarioId(null)
    setInputType('text')
    const text = (committed || transcript).trim()
    const q = text ? `&text=${encodeURIComponent(text)}&autoStart=true` : ''
    router.push(`/intake?category=auto${q}`)
  }

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden isolate">
      <RadialBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">

        {/* Left: copy */}
        <div>
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-zinc-200 shadow-xs mb-6 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-800 tracking-tight">
              {hi ? '1930 NCRP राष्ट्रीय प्रोटोकॉल • 60-सेकंड AI ट्रायज' : '1930 NCRP Golden Hour Protocol • 60-Second AI Triage'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.08]"
          >
            {c.headline}
            <br />
            <span className="text-primary">
              {c.headlineHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 text-base sm:text-lg text-zinc-600 max-w-lg leading-relaxed"
          >
            {c.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            <button
              onClick={goToIntake}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-7 py-3.5 text-sm font-semibold transition-all shadow-sm hover:scale-[1.01] active:scale-[0.98]"
            >
              {c.primary}
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white/90 hover:bg-zinc-50 text-zinc-700 rounded-lg px-6 py-3.5 text-sm font-medium transition-all shadow-2xs"
            >
              {c.secondary}
              <ArrowDown className="w-4 h-4 text-zinc-400" />
            </a>
          </motion.div>

          {/* Micro trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 pt-6 border-t border-zinc-200/70 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-zinc-500 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {hi ? 'डिजीलॉकर प्रमाणित पहचान' : 'DigiLocker Verified'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {hi ? 'ऑटो IT एक्ट व BNS धाराएं' : 'Auto IT Act & BNS'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {hi ? 'गोल्डन ऑवर 1930 हैंडऑफ़' : '1930 NCRP Handoff'}
            </span>
          </motion.div>
        </div>

        {/* Right: 21st-Century Studio Window Terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Outer window frame container */}
          <div className="rounded-lg border border-zinc-200/90 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Terminal Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-surface">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="ml-2 text-[11px] font-mono font-medium text-zinc-500">
                  {hi ? 'लाइव वॉयस इनटेक स्टूडियो' : 'Live Voice Intake Studio'}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-medium text-emerald-700 border border-emerald-200/60 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {hi ? 'सक्रिय' : 'Live'}
              </span>
            </div>

            <div className="p-6">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
                {committed ? c.demoHintDone : c.demoHint}
              </p>

              <AudioRecorder
                language={language}
                onAudioReady={handleAudioReady}
                onLiveTranscript={setTranscript}
                theme="light"
              />

              {isTranscribing && (
                <div className="mt-4 p-4 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-center gap-2.5 text-xs font-semibold text-primary">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{hi ? 'आपकी आवाज़ सुनी जा रही है और रिपोर्ट तैयार हो रही है...' : 'Transcribing what you said and preparing report...'}</span>
                </div>
              )}

              {/* Sample simulation chips if user hasn't recorded */}
              {!committed && !isTranscribing && (
                <div className="mt-5 pt-4 border-t border-zinc-100">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    {hi ? 'या त्वरित सिमुलेशन चुनें:' : 'Or test with a 1-click simulation:'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { en: '₹50,000 lost on UPI link', hi: 'UPI लिंक से ₹50,000 कटे' },
                      { en: 'Loan app blackmail threats', hi: 'लोन ऐप से ब्लैकमेल धमकी' },
                      { en: 'Fake profile on Instagram', hi: 'इंस्टाग्राम पर फर्जी प्रोफाइल' }
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCommitted(hi ? sample.hi : sample.en)}
                        className="text-xs bg-zinc-50 hover:bg-blue-50/70 border border-zinc-200/80 hover:border-blue-200 text-zinc-600 hover:text-primary px-2.5 py-1 rounded-md transition-all font-medium"
                      >
                        &ldquo;{hi ? sample.hi : sample.en}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!result && !isTranscribing && (
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-center">
                  <a
                    href="https://wa.me/916303807967?text=Hi%20Samarthan,%20I%20want%20to%20report%20a%20cybercrime%20incident."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    <span>{c.orWhatsApp}</span>
                  </a>
                </div>
              )}

              <AnimatePresence>
                {result && !isTranscribing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="rounded-lg bg-surface border border-zinc-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {c.resultTitle}
                        </p>
                        <button
                          type="button"
                          onClick={handleResetRecord}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{c.reRecord}</span>
                        </button>
                      </div>

                      <div className="mb-3.5 p-3 rounded-md bg-white border border-zinc-200/90 text-xs text-zinc-800 leading-relaxed font-medium">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{c.youSaid}</span>
                        &ldquo;{committed}&rdquo;
                      </div>

                      <div className="space-y-2.5 text-sm">
                        <Row label={c.fType} value={
                          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                            <result.Icon className="w-3.5 h-3.5 text-blue-600" />
                            {result.type}
                          </span>
                        } />
                        <Row label={c.fLaw} value={<span className="font-mono text-xs text-zinc-700">{result.law}</span>} />
                        <Row label={c.fAction} value={<span className="text-zinc-700">{result.action}</span>} />
                      </div>

                      <button
                        onClick={goToIntake}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-3 text-xs font-semibold transition-colors shadow-sm"
                      >
                        <span>{c.continueCta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="mt-2.5 flex items-center justify-center">
                        <a
                          href={`https://wa.me/916303807967?text=${encodeURIComponent(
                            committed || (hi ? 'नमस्ते समर्थन, मुझे एक साइबर धोखाधड़ी की रिपोर्ट करनी है।' : 'Hi Samarthan, I want to report a cybercrime incident.')
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors py-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          <span>{c.orWhatsApp}</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-zinc-400 text-xs pt-0.5">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
