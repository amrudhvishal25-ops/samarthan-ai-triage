'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, ExternalLink, Copy, CheckCheck } from 'lucide-react'
import { FreezeStep } from '@/data/scenarios'
import { SupportedLanguage } from '@/lib/i18n/languages'
import clsx from 'clsx'

interface FreezeStepperProps {
  steps: FreezeStep[]
  language: SupportedLanguage
  onHotlineClick?: (hotline: string) => void
}

export default function FreezeStepper({ steps, language, onHotlineClick }: FreezeStepperProps) {
  const hi = language === 'hi'
  const [copied, setCopied] = useState<number | null>(null)
  const safeSteps = Array.isArray(steps) ? steps : []

  const handleCopy = async (step: FreezeStep, idx: number) => {
    const text = hi ? `${step.actionHi}\n${step.detailHi}` : `${step.action}\n${step.detail}`
    await navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      {safeSteps.map((step, idx) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex gap-3 sm:gap-4"
        >
          {/* Step number + vertical connector */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className={clsx(
                'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs transition-colors',
                step.step === 1 ? 'bg-red-500 dark:bg-red-600' : 'bg-primary'
              )}
            >
              {step.step}
            </div>
            {idx < safeSteps.length - 1 && (
              <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-zinc-800 my-1.5" />
            )}
          </div>

          {/* Step card */}
          <div
            className={clsx(
              'flex-1 rounded-2xl border p-4 sm:p-5 mb-2 transition-all shadow-xs',
              step.step === 1
                ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h4
                className={clsx(
                  'font-semibold text-sm sm:text-[15px] leading-snug',
                  step.step === 1
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-zinc-900 dark:text-zinc-100'
                )}
              >
                {hi ? step.actionHi : step.action}
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(step, idx)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                aria-label="Copy step"
              >
                {copied === idx ? (
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              {hi ? step.detailHi : step.detail}
            </p>

            {/* Action buttons */}
            {(step.hotline || step.url) && (
              <div className="flex flex-wrap gap-2 mt-3.5">
                {step.hotline && (
                  onHotlineClick ? (
                    <button
                      type="button"
                      onClick={() => onHotlineClick(step.hotline!)}
                      className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{step.hotline}</span>
                    </button>
                  ) : (
                    <a
                      href={`tel:${step.hotline}`}
                      className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{step.hotline}</span>
                    </a>
                  )
                )}
                {step.url && (
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
                  >
                    <span>{hi ? 'पोर्टल खोलें' : 'Open Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
