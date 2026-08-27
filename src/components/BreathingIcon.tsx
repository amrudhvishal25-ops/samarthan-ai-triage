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
    <div className="relative w-44 h-44 flex items-center justify-center">
      {/* Outer ring — expands on inhale */}
      <motion.div
        animate={{ scale: isInhale ? 1.35 : 0.85, opacity: isInhale ? 0.2 : 0.08 }}
        transition={{ duration, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-blue-400"
      />
      {/* Middle ring */}
      <motion.div
        animate={{ scale: isInhale ? 1.15 : 0.9, opacity: isInhale ? 0.4 : 0.18 }}
        transition={{ duration, ease: 'easeInOut' }}
        className="absolute inset-4 rounded-full bg-blue-500"
      />
      {/* Inner core — always solid */}
      <motion.div
        animate={{ scale: isInhale ? 1.08 : 0.92 }}
        transition={{ duration, ease: 'easeInOut' }}
        className="absolute inset-12 rounded-full bg-blue-600"
      />
    </div>
  )
}
