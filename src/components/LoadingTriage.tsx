'use client'

import { motion } from 'framer-motion'
import { Brain, HeartHandshake } from 'lucide-react'

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

export default function LoadingTriage({ language }: LoadingTriageProps) {
  const hi = language === 'hi'
  const steps = hi ? stepsHi : stepsEn

  return (
    <div className="flex flex-col items-center gap-8 py-12 px-6">
      {/* Reassurance banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5"
      >
        <HeartHandshake className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            {hi ? 'गहरी सांस लें, सब ठीक हो जाएगा' : 'Take a deep breath — everything will be okay'}
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            {hi ? 'हमारा AI आपकी मदद कर रहा है' : 'Our AI is working on this for you'}
          </p>
        </div>
      </motion.div>

      {/* Pulsing brain icon */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-20 h-20 rounded-full bg-civic-blueLight flex items-center justify-center"
      >
        <Brain className="w-10 h-10 text-civic-blue" />
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
    </div>
  )
}
