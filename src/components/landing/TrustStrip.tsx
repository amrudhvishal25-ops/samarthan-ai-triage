import { ShieldCheck, Fingerprint, Scale, Building2 } from 'lucide-react'

interface TrustStripProps {
  language: 'en' | 'hi'
}

const ITEMS = [
  {
    en: 'Built on the 1930 NCRP framework',
    hi: '1930 NCRP ढांचे पर आधारित',
    icon: ShieldCheck,
  },
  {
    en: 'DigiLocker identity verification',
    hi: 'DigiLocker पहचान सत्यापन',
    icon: Fingerprint,
  },
  {
    en: 'IT Act 2000 §66C / §66D auto-cited',
    hi: 'IT एक्ट 2000 §66C / §66D स्वतः उद्धृत',
    icon: Scale,
  },
  {
    en: 'Aligned with cybercrime.gov.in',
    hi: 'cybercrime.gov.in के अनुरूप',
    icon: Building2,
  },
]

export default function TrustStrip({ language }: TrustStripProps) {
  const isHi = language === 'hi'

  return (
    <div className="w-full border-y border-zinc-200/80 bg-white/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {ITEMS.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/90 text-xs md:text-[13px] font-medium text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-300 hover:bg-blue-50/40 transition-all duration-200"
            >
              <Icon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>{isHi ? item.hi : item.en}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
