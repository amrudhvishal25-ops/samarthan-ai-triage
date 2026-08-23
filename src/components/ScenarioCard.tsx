'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, ChevronRight } from 'lucide-react'
import { Scenario } from '@/data/scenarios'
import clsx from 'clsx'

interface ScenarioCardProps {
  scenario: Scenario
  language: 'en' | 'hi'
  onSelect: (id: string) => void
  isLoading?: boolean
}

const urgencyColor: Record<string, string> = {
  'UPI Fraud': 'bg-red-100 text-red-700 border-red-200',
  'OTP Fraud': 'bg-orange-100 text-orange-700 border-orange-200',
  'Investment Scam': 'bg-amber-100 text-amber-700 border-amber-200',
  'Fake Customer Care': 'bg-purple-100 text-purple-700 border-purple-200',
  'Job Scam': 'bg-blue-100 text-blue-700 border-blue-200',
  'Other': 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function ScenarioCard({ scenario, language, onSelect, isLoading }: ScenarioCardProps) {
  const hi = language === 'hi'

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(scenario.id)}
      disabled={isLoading}
      className={clsx(
        'w-full text-left rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm',
        'hover:border-civic-blue hover:shadow-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-civic-blue focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'min-h-[44px]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Badge */}
          <span className={clsx(
            'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border mb-3',
            urgencyColor[scenario.fraudType] || urgencyColor['Other']
          )}>
            <Shield className="w-3 h-3" />
            {scenario.fraudType}
          </span>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">
            {hi ? scenario.titleHi : scenario.title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed">
            {hi ? scenario.descriptionHi : scenario.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {hi ? '~60 सेकंड' : '~60 sec demo'}
            </span>
            <span className="text-xs px-2 py-0.5 bg-civic-blueLight text-civic-blue rounded-full font-medium">
              {scenario.language}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 mt-1">
          <div className="w-9 h-9 rounded-full bg-civic-blueLight flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-civic-blue" />
          </div>
        </div>
      </div>
    </motion.button>
  )
}
