'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowDown, ShieldCheck, Scale, Wallet, Building2 } from 'lucide-react'
import AudioRecorder from '@/components/AudioRecorder'
import { useTriage } from '@/context/TriageContext'

interface HeroSectionProps {
  language: 'en' | 'hi'
}

const EN = {
  headline: 'Tell us what happened.',
  headlineHighlight: 'We handle the rest.',
  sub: 'Speak in your own words in Hindi or English. Samarthan turns it into a filed cybercrime complaint, cites the law, and tells you exactly who to call in under 60 seconds.',
  primary: 'Start a report',
  secondary: 'See how it works',
  demoHint: 'Try it right now: tap the mic and describe a scam',
  continueCta: 'Continue to full report',
  resultTitle: 'What Samarthan heard',
  fType: 'Fraud type',
  fLaw: 'Likely IT Act section',
  fAction: 'Your next step',
}

const HI = {
  headline: 'बताएं क्या हुआ।',
  headlineHighlight: 'बाकी हम संभालते हैं।',
  sub: 'अपने शब्दों में बोलें, हिंदी या अंग्रेज़ी। समर्थन इसे दर्ज साइबर अपराध शिकायत में बदलता है, कानून बताता है, और यह भी कि किसे कॉल करना है। 60 सेकंड से कम में।',
  primary: 'रिपोर्ट शुरू करें',
  secondary: 'यह कैसे काम करता है',
  demoHint: 'अभी आज़माएं: माइक दबाकर धोखाधड़ी बताएं',
  continueCta: 'पूरी रिपोर्ट पर जाएं',
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
    return { type: hi ? 'निवेश घोटाला' : 'Investment Scam', law: 'IT Act §66D', action: hi ? 'RBI Sachet पोर्टल पर रिपोर्ट करें' : 'Report on RBI Sachet portal', Icon: Wallet }
  if (/loan app|sextort|blackmail|threat|nude|morph|ब्लैकमेल|धमकी/.test(t))
    return { type: hi ? 'जबरन वसूली' : 'Extortion & Blackmail', law: 'IT Act §66E + §384 BNS', action: hi ? '1930 पर कॉल करें, स्क्रीनशॉट सुरक्षित रखें' : 'Call 1930, preserve screenshots', Icon: ShieldCheck }
  if (/upi|bank|otp|debit|credit card|imps|neft|account|बैंक|खाता/.test(t))
    return { type: hi ? 'वित्तीय धोखाधड़ी' : 'Financial Fraud', law: 'IT Act §66C + §66D', action: hi ? 'बैंक नोडल अधिकारी को सूचित करें + 1930' : 'Notify bank nodal officer + call 1930', Icon: Building2 }
  if (/instagram|facebook|whatsapp|fake profile|impersonat|फ़र्ज़ी|पहचान/.test(t))
    return { type: hi ? 'पहचान की चोरी' : 'Identity Theft', law: 'IT Act §66C + §66D', action: hi ? 'प्लेटफ़ॉर्म पर रिपोर्ट करें + NCRP' : 'Report to the platform + NCRP', Icon: Scale }
  return { type: hi ? 'अन्य साइबर अपराध' : 'Other Cyber Crime', law: 'IT Act §66', action: hi ? '1930 पर कॉल करें' : 'Call the 1930 helpline', Icon: ShieldCheck }
}

export default function HeroSection({ language }: HeroSectionProps) {
  const c = language === 'hi' ? HI : EN
  const hi = language === 'hi'
  const router = useRouter()
  const { setScenarioId, setInputType } = useTriage()

  const [transcript, setTranscript] = useState('')
  const [committed, setCommitted] = useState('')

  const result = committed ? quickRead(committed, hi) : null

  const goToIntake = () => {
    setScenarioId(null)
    setInputType('text')
    const text = (committed || transcript).trim()
    const q = text ? `&text=${encodeURIComponent(text)}&autoStart=true` : ''
    router.push(`/intake?category=auto${q}`)
  }

  return (
    <section className="relative w-full bg-[#FAFAF8] pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">

        {/* Left: copy */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[2.75rem] leading-[1.05] md:text-6xl md:leading-[1.03] font-extrabold tracking-tight text-[#0A0A0A]"
          >
            {c.headline}
            <br />
            <span className="text-blue-600">{c.headlineHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg text-zinc-600 max-w-lg leading-relaxed"
          >
            {c.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={goToIntake}
              className="inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#152d54] text-white rounded-full px-7 py-3.5 text-sm font-semibold transition-colors shadow-sm"
            >
              {c.primary}
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-700 hover:bg-white rounded-full px-6 py-3.5 text-sm font-medium transition-colors"
            >
              {c.secondary}
              <ArrowDown className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Right: live demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] p-6">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
              {c.demoHint}
            </p>

            <AudioRecorder
              language={language}
              onAudioReady={() => { setCommitted(transcript) }}
              onLiveTranscript={setTranscript}
              theme="light"
            />

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="rounded-xl bg-[#FAFAF8] border border-zinc-200 p-4">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      {c.resultTitle}
                    </p>
                    <div className="space-y-2.5 text-sm">
                      <Row label={c.fType} value={
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#0A0A0A]">
                          <result.Icon className="w-3.5 h-3.5 text-blue-600" />
                          {result.type}
                        </span>
                      } />
                      <Row label={c.fLaw} value={<span className="font-mono text-xs text-zinc-700">{result.law}</span>} />
                      <Row label={c.fAction} value={<span className="text-zinc-700">{result.action}</span>} />
                    </div>
                    <button
                      onClick={goToIntake}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-zinc-800 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors"
                    >
                      {c.continueCta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Simulated badge */}
          <div className="absolute -top-3 -right-3 bg-white border border-zinc-200 rounded-full px-3 py-1 text-[10px] font-medium text-zinc-500 shadow-sm">
            {hi ? 'लाइव डेमो' : 'Live demo'}
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
