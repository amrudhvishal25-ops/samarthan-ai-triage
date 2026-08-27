'use client'

import { motion } from 'framer-motion'

interface BreathingIconProps {
  phase: 'inhale' | 'exhale'
  durationMs: number
}

// Same torso curve, drawn narrower (exhale) and wider (inhale) — animating
// between the two path shapes directly avoids SVG transform-origin issues
// that caused the figure to stretch/skew instead of breathing evenly.
const CHEST_NARROW = 'M26 62 C26 46 30 34 36 34 C42 34 46 46 46 62'
const CHEST_WIDE = 'M20 62 C20 42 26 30 36 30 C46 30 52 42 52 62'

export default function BreathingIcon({ phase, durationMs }: BreathingIconProps) {
  const transition = { duration: durationMs / 1000, ease: 'easeInOut' as const }

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="36" cy="16" r="9" stroke="#1A3A6B" strokeWidth="3" fill="none" />

      {/* Chest/torso — path morphs wider on inhale, narrower on exhale */}
      <motion.path
        animate={{ d: phase === 'inhale' ? CHEST_WIDE : CHEST_NARROW }}
        transition={transition}
        stroke="#1A3A6B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Breath arcs — fade in/out to suggest air moving */}
      <motion.path
        d="M14 30 C18 26 22 24 26 24"
        stroke="#2B5199"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={{ opacity: phase === 'inhale' ? [0, 1] : [1, 0], x: phase === 'inhale' ? [4, 0] : [0, 4] }}
        transition={transition}
      />
      <motion.path
        d="M58 30 C54 26 50 24 46 24"
        stroke="#2B5199"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={{ opacity: phase === 'inhale' ? [0, 1] : [1, 0], x: phase === 'inhale' ? [-4, 0] : [0, -4] }}
        transition={transition}
      />
    </svg>
  )
}
