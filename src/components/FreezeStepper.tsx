'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, ExternalLink, Copy, CheckCheck } from 'lucide-react'
import { FreezeStep } from '@/data/scenarios'
import clsx from 'clsx'

interface FreezeStepperProps {
  steps: FreezeStep[]
  language: 'en' | 'hi'
}

export default function FreezeStepper({ steps, language }: FreezeStepperProps) {
  const hi = language === 'hi'
  const [copied, setCopied] = useState<number | null>(null)

  const handleCopy = async (step: FreezeStep, idx: number) => {
    const text = hi ? `${step.actionHi}\n${step.detailHi}` : `${step.action}\n${step.detail}`
    await navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex gap-4"
        >
          {/* Step number + connector */}
          <div className="flex flex-col items-center">
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
              step.step === 1 ? 'bg-red-500' : 'bg-civic-blue'
            )}>
              {step.step}
            </div>
            {idx < steps.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 mt-2 mb-0" />
            )}
          </div>

          {/* Content */}
          <div className={clsx(
            'flex-1 rounded-xl border p-4 mb-4',
            step.step === 1 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
          )}>
            <div className="flex items-start justify-between gap-2">
              <h4 className={clsx(
                'font-semibold text-sm leading-snug',
                step.step === 1 ? 'text-red-700' : 'text-gray-900'
              )}>
                {hi ? step.actionHi : step.action}
              </h4>
              <button
                onClick={() => handleCopy(step, idx)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Copy step"
              >
                {copied === idx
                  ? <CheckCheck className="w-4 h-4 text-green-500" />
                  : <Copy className="w-4 h-4" />
                }
              </button>
            </div>

            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
              {hi ? step.detailHi : step.detail}
            </p>

            {/* Action buttons */}
            {(step.hotline || step.url) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {step.hotline && (
                  <a
                    href={`tel:${step.hotline}`}
                    className="inline-flex items-center gap-1.5 bg-civic-blue text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-civic-blueMid transition-colors min-h-[44px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {step.hotline}
                  </a>
                )}
                {step.url && (
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {hi ? 'खोलें' : 'Open'}
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
