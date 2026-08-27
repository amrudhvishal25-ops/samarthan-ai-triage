'use client'

import { motion } from 'framer-motion'

interface BreathingIconProps {
  phase: 'inhale' | 'exhale'
  durationMs: number
}

export default function BreathingIcon({ phase, durationMs }: BreathingIconProps) {
  const duration = durationMs / 1000
  const isInhale = phase === 'inhale'

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer ring — expands on inhale */}
      <motion.div
        animate={{ scale: isInhale ? 1.3 : 0.82, opacity: isInhale ? 0.2 : 0.07 }}
        transition={{ duration, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-blue-400"
      />
      {/* Middle ring */}
      <motion.div
        animate={{ scale: isInhale ? 1.12 : 0.88, opacity: isInhale ? 0.38 : 0.16 }}
        transition={{ duration, ease: 'easeInOut' }}
        className="absolute inset-8 rounded-full bg-blue-500"
      />
      {/* Inner core — always solid */}
      <motion.div
        animate={{ scale: isInhale ? 1.08 : 0.92 }}
        transition={{ duration, ease: 'easeInOut' }}
        className="absolute inset-20 rounded-full bg-blue-600"
      />
    </div>
  )
}
