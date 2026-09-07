'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowDown, ShieldCheck, Scale, Wallet, Building2, Loader2, RotateCcw, MessageCircle } from 'lucide-react'
import AudioRecorder from '@/components/AudioRecorder'
import { useTriage } from '@/context/TriageContext'
import { RadialBackground } from '@/components/ui/light-theme-tailwind-css-background-snippet'
import { createTimeline, stagger } from 'animejs'
import WhatsAppChoiceModal from '@/components/WhatsAppChoiceModal'
import WhatsAppSimulatorModal from '@/components/WhatsAppSimulatorModal'

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
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [choicePrefilledText, setChoicePrefilledText] = useState('')

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

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tl = createTimeline({
      defaults: {
        ease: 'outExpo',
      },
    })

    tl.add('.hero-eyebrow-pill', {
      y: [-14, 0],
      opacity: [0, 1],
      duration: 600,
      ease: 'outCubic',
    })
    tl.add('.hero-title-word', {
      y: ['115%', '0%'],
      opacity: [0, 1],
      rotateZ: [-1.5, 0],
      duration: 900,
      delay: stagger(55),
      ease: 'outElastic(1, .85)',
    }, '-=350')
    tl.add('.hero-highlight-word', {
      y: ['115%', '0%'],
      opacity: [0, 1],
      duration: 950,
      delay: stagger(65),
      ease: 'outElastic(1, .85)',
    }, '-=600')
    tl.add('.hero-sub-text', {
      y: [15, 0],
      opacity: [0, 1],
      duration: 700,
      ease: 'outCubic',
    }, '-=650')
    tl.add('.hero-cta-btn', {
      y: [15, 0],
      opacity: [0, 1],
      duration: 650,
      delay: stagger(70),
      ease: 'outCubic',
    }, '-=550')
    tl.add('.hero-trust-tag', {
      y: [10, 0],
      opacity: [0, 1],
      duration: 550,
      delay: stagger(50),
      ease: 'outCubic',
    }, '-=500')
  }, [language])

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden isolate">
      <RadialBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">

        {/* Left: copy */}
        <div>
          {/* Eyebrow Pill */}
          <div className="hero-eyebrow-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">
              {hi ? '🏆 Aevy TV × OpenAI हैकथॉन प्रोटोटाइप • AI ट्रायज सिमुलेशन' : '🏆 Built for Aevy TV × OpenAI Hackathon • AI Simulation Prototype'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
            <span className="block overflow-hidden py-0.5">
              {c.headline.split(' ').map((word, idx) => (
                <span key={idx} className="hero-title-word inline-block mr-2.5 will-change-transform">
                  {word}
                </span>
              ))}
            </span>
            <span className="block overflow-hidden text-primary mt-1 py-0.5">
              {c.headlineHighlight.split(' ').map((word, idx) => (
                <span key={idx} className="hero-highlight-word inline-block mr-2.5 will-change-transform">
                  {word}
                </span>
              ))}
            </span>
          </h1>

          <p className="hero-sub-text mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-lg leading-relaxed">
            {c.sub}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              onClick={goToIntake}
              className="hero-cta-btn inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-7 py-3.5 text-sm font-semibold transition-all shadow-sm hover:scale-[1.01] active:scale-[0.98]"
            >
              {c.primary}
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="hero-cta-btn inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg px-6 py-3.5 text-sm font-medium transition-all shadow-2xs"
            >
              {c.secondary}
              <ArrowDown className="w-4 h-4 text-zinc-400" />
            </a>
          </div>

          {/* Micro trust indicators */}
          <div className="mt-8 pt-6 border-t border-zinc-200/70 dark:border-zinc-800/80 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="hero-trust-tag flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {hi ? 'डिजीलॉकर प्रमाणित पहचान' : 'DigiLocker Verified'}
            </span>
            <span className="hero-trust-tag flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {hi ? 'ऑटो IT एक्ट व BNS धाराएं' : 'Auto IT Act & BNS'}
            </span>
            <span className="hero-trust-tag flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {hi ? 'गोल्डन ऑवर 1930 हैंडऑफ़' : '1930 NCRP Handoff'}
            </span>
          </div>

          {/* Explicit simulation disclaimer notice */}
          <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
            {hi
              ? '⚠️ यह Aevy TV × OpenAI हैकथॉन के लिए बनाया गया एक सिमुलेशन प्रोटोटाइप है, कोई आधिकारिक सरकारी वेबसाइट नहीं है (आधिकारिक राष्ट्रीय पोर्टल: cybercrime.gov.in)।'
              : '⚠️ This is a hackathon simulation and prototype created for the Aevy TV × OpenAI Hackathon. It is NOT an official government website (official portal: cybercrime.gov.in).'}
          </p>
        </div>

        {/* Right: 21st-Century Studio Window Terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Outer window frame container */}
          <div className="rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Terminal Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-850 bg-surface">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="ml-2 text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400">
                  {hi ? 'लाइव वॉयस इनटेक स्टूडियो' : 'Live Voice Intake Studio'}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {hi ? 'सक्रिय' : 'Live'}
              </span>
            </div>

            <div className="p-6">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
                {committed ? c.demoHintDone : c.demoHint}
              </p>

              <AudioRecorder
                language={language}
                onAudioReady={handleAudioReady}
                onLiveTranscript={setTranscript}
                theme="light"
              />

              {isTranscribing && (
                <div className="mt-4 p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center gap-2.5 text-xs font-semibold text-primary">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{hi ? 'आपकी आवाज़ सुनी जा रही है और रिपोर्ट तैयार हो रही है...' : 'Transcribing what you said and preparing report...'}</span>
                </div>
              )}

              {/* Sample simulation chips if user hasn't recorded */}
              {!committed && !isTranscribing && (
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
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
                        className="text-xs bg-zinc-50 dark:bg-zinc-900 hover:bg-blue-50/70 dark:hover:bg-blue-950/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 text-zinc-600 dark:text-zinc-300 hover:text-primary px-2.5 py-1 rounded-md transition-all font-medium"
                      >
                        &ldquo;{hi ? sample.hi : sample.en}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!result && !isTranscribing && (
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setChoicePrefilledText(committed || '')
                      setIsChoiceModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 dark:fill-emerald-500 dark:text-emerald-500" />
                    <span>{c.orWhatsApp}</span>
                  </button>
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
                        <button
                          type="button"
                          onClick={() => {
                            setChoicePrefilledText(committed || '')
                            setIsChoiceModalOpen(true)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors py-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 dark:fill-emerald-500 dark:text-emerald-500" />
                          <span>{c.orWhatsApp}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <WhatsAppChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        language={language}
        prefilledText={choicePrefilledText}
      />

      <WhatsAppSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        language={language}
      />
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
