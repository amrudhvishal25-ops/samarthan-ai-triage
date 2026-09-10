import React from 'react'
import { ShieldCheck, Fingerprint, TrendingUp, AlertTriangle } from 'lucide-react'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { getTranslation } from '@/lib/i18n/translations'

interface TrustStripProps {
  language: SupportedLanguage
}

export default function TrustStrip({ language }: TrustStripProps) {
  const t = getTranslation(language)

  const items = [
    {
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      label: t.trust.reportedFraudsLabel,
      value: t.trust.reportedFrauds,
      sub: language === 'hi' ? '2024 NCRP भारत रिपोर्ट' : 'Reported on 1930 in 2024',
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: t.trust.lostToFraudLabel,
      value: t.trust.lostToFraud,
      sub: language === 'hi' ? 'वार्षिक राष्ट्रीय वित्तीय हानि' : 'Lost to digital financial fraud',
    },
    {
      icon: <Fingerprint className="w-4 h-4 text-primary" />,
      label: t.nav.digiLockerVerified,
      value: 'DigiLocker',
      sub: language === 'hi' ? '1-क्लिक आधार व पैन सत्यापित कानूनी शिकायतें' : '1-click tamper-evident Aadhaar & PAN verification',
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-primary" />,
      label: t.trust.triageSpeedLabel,
      value: t.trust.triageSpeed,
      sub: language === 'hi' ? 'घबराहट से FIR व बैंक फ्रीज डोजियर' : 'Immediate freeze dossier generated',
    },
  ]

  return (
    <section className="w-full bg-surface border-y border-zinc-200/80 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 4 Major Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[14px] p-4 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                    {item.label}
                  </span>
                </div>
                <p
                  className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white ${
                    item.value === 'DigiLocker' ? 'font-sans' : 'font-mono'
                  }`}
                >
                  {item.value}
                </p>
              </div>
              <p className="text-xs mt-2.5 sm:mt-3 leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
