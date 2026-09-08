import React from 'react'
import { ShieldCheck, Fingerprint, TrendingUp, AlertTriangle } from 'lucide-react'

interface TrustStripProps {
  language: 'en' | 'hi'
}

export default function TrustStrip({ language }: TrustStripProps) {
  const isHi = language === 'hi'

  const items = [
    {
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      label: isHi ? 'वार्षिक साइबर मामले' : 'Annual Cyber Frauds',
      value: isHi ? '11.3 लाख+' : '11.3 Lakh+',
      sub: isHi ? '2024 NCRP भारत रिपोर्ट' : 'Reported on 1930 in 2024',
      isPrimary: false,
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: isHi ? 'डिजिटल नुकसान' : 'Digital Losses',
      value: isHi ? '₹66,000 करोड़' : '₹66,000 Cr',
      sub: isHi ? 'वार्षिक राष्ट्रीय वित्तीय हानि' : 'Lost to digital financial fraud',
      isPrimary: false,
    },
    {
      icon: <Fingerprint className="w-4 h-4 text-primary" />,
      label: isHi ? 'पहचान सत्यापन' : 'Identity Verification',
      value: 'DigiLocker',
      sub: isHi ? '1-क्लिक आधार व पैन सत्यापित कानूनी शिकायतें' : '1-click tamper-evident Aadhaar & PAN verification',
      isPrimary: false,
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-primary" />,
      label: isHi ? 'समर्थन AI ट्रायज' : 'Samarthan AI Triage',
      value: '60s',
      sub: isHi ? 'घबराहट से FIR व बैंक फ्रीज डोजियर' : 'Immediate freeze dossier generated',
      isPrimary: true,
    },
  ]

  return (
    <section className="w-full bg-surface border-y border-zinc-200/80 py-14">
      <div className="max-w-6xl mx-auto px-6">
        {/* 4 Major Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-[14px] p-6 border transition-all duration-200 flex flex-col justify-between ${
                item.isPrimary
                  ? 'bg-primary-tint/80 border-primary/30 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                      item.isPrimary ? 'text-primary' : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <p
                  className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                    item.value === 'DigiLocker' ? 'font-sans' : 'font-mono'
                  } ${item.isPrimary ? 'text-primary' : 'text-zinc-950 dark:text-white'}`}
                >
                  {item.value}
                </p>
              </div>
              <p
                className={`text-xs mt-3 leading-relaxed ${
                  item.isPrimary ? 'text-primary/80 font-medium' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {item.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Institutional Data Attribution */}
        <p className="text-[11px] text-zinc-500 font-mono text-center mt-7">
          {isHi
            ? 'स्रोत: राष्ट्रीय अपराध रिकॉर्ड ब्यूरो (NCRB) एवं राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (1930 हेल्पलाइन) वार्षिक डेटा'
            : 'Source: National Crime Records Bureau (NCRB) & National Cybercrime Reporting Portal (1930 Helpline) Annual Data'}
        </p>
      </div>
    </section>
  )
}
