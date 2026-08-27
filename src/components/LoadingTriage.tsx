'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BreathingIcon from './BreathingIcon'

interface LoadingTriageProps {
  language: 'en' | 'hi'
}

const stepsEn = [
  'Transcribing your account…',
  'Identifying fraud type…',
  'Extracting key details…',
  'Generating freeze instructions…',
  'Drafting your complaint…',
]

const stepsHi = [
  'आपका विवरण पढ़ा जा रहा है…',
  'धोखाधड़ी का प्रकार पहचाना जा रहा है…',
  'मुख्य जानकारी निकाली जा रहा है…',
  'फ्रीज निर्देश तैयार हो रहे हैं…',
  'शिकायत का मसौदा बनाया जा रहा है…',
]

const BREATH_DURATION = 3800 // one full inhale+exhale cycle, ms

export default function LoadingTriage({ language }: LoadingTriageProps) {
  const hi = language === 'hi'
  const steps = hi ? stepsHi : stepsEn
  const [breathing, setBreathing] = useState(true)
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale')

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhase(p => (p === 'inhale' ? 'exhale' : 'inhale'))
    }, BREATH_DURATION / 2)

    const doneTimer = setTimeout(() => setBreathing(false), BREATH_DURATION * 1.6)

    return () => {
      clearInterval(phaseTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 py-12 px-6 min-h-[420px]">
      <AnimatePresence mode="wait">
        {breathing ? (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <motion.div
              animate={{ scale: phase === 'inhale' ? 1.15 : 0.92 }}
              transition={{ duration: BREATH_DURATION / 2 / 1000, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-full bg-civic-blueLight flex items-center justify-center"
            >
              <BreathingIcon phase={phase} durationMs={BREATH_DURATION / 2} />
            </motion.div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                <span>{hi ? 'गहरी सांस लें — सब ठीक हो जाएगा' : 'Take a deep breath — everything will be okay'}</span>
                <span aria-hidden="true">💙</span>
              </h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-civic-blue text-sm font-medium"
                >
                  {phase === 'inhale'
                    ? (hi ? 'सांस अंदर लें…' : 'Breathe in…')
                    : (hi ? 'सांस बाहर छोड़ें…' : 'Breathe out…')}
                </motion.p>
              </AnimatePresence>
              <p className="text-gray-400 text-xs mt-2">
                {hi ? 'हमारा AI आपकी मदद कर रहा है' : 'Our AI is working on this for you'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-civic-blueLight flex items-center justify-center"
            >
              <span className="text-4xl select-none">🧠</span>
            </motion.div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {hi ? 'AI आपकी रिपोर्ट पढ़ रहा है…' : 'AI is reading your report…'}
              </h2>
              <p className="text-gray-500 text-sm">
                {hi ? 'कृपया प्रतीक्षा करें, कुछ सेकंड लगेंगे' : 'This takes just a few seconds'}
              </p>
            </div>

            {/* Animated steps */}
            <div className="w-full max-w-sm space-y-3">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.5, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.5 + 0.2 }}
                    className="w-5 h-5 rounded-full bg-civic-blue flex-shrink-0 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <span className="text-sm text-gray-600">{step}</span>
                </motion.div>
              ))}
            </div>

            {/* Skeleton shimmer cards */}
            <div className="w-full max-w-sm space-y-3">
              {[80, 60, 90].map((w, i) => (
                <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${w}%` }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
