'use client'

import clsx from 'clsx'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { UrgencyLevel } from '@/data/scenarios'

interface UrgencyBadgeProps {
  level: UrgencyLevel
  language: 'en' | 'hi'
  size?: 'sm' | 'lg'
}

const config: Record<UrgencyLevel, {
  en: string; hi: string;
  bg: string; text: string; border: string;
  Icon: React.ElementType
}> = {
  CRITICAL: {
    en: 'CRITICAL — Act in Next 60 Minutes',
    hi: 'अत्यावश्यक — अगले 60 मिनट में कार्य करें',
    bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300',
    Icon: AlertTriangle,
  },
  HIGH: {
    en: 'HIGH PRIORITY — Act Today',
    hi: 'उच्च प्राथमिकता — आज ही कार्य करें',
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300',
    Icon: AlertCircle,
  },
  MEDIUM: {
    en: 'MEDIUM PRIORITY — File Within 24 Hours',
    hi: 'मध्यम प्राथमिकता — 24 घंटे में दर्ज करें',
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300',
    Icon: Info,
  },
  LOW: {
    en: 'LOW PRIORITY',
    hi: 'कम प्राथमिकता',
    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300',
    Icon: CheckCircle,
  },
}

export default function UrgencyBadge({ level, language, size = 'sm' }: UrgencyBadgeProps) {
  const c = config[level]
  const { Icon } = c

  return (
    <div className={clsx(
      'inline-flex items-center gap-2 rounded-xl border font-semibold',
      c.bg, c.text, c.border,
      size === 'lg' ? 'px-4 py-3 text-sm w-full' : 'px-3 py-1.5 text-xs'
    )}>
      <Icon className={size === 'lg' ? 'w-5 h-5 flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'} />
      <span>{language === 'hi' ? c.hi : c.en}</span>
    </div>
  )
}
