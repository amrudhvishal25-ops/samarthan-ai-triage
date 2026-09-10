import React from 'react'
import { ShieldCheck, Fingerprint, TrendingUp, AlertTriangle } from 'lucide-react'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { getTranslation } from '@/lib/i18n/translations'

interface TrustStripProps {
  language: SupportedLanguage
}

const SUB_LABELS: Record<string, { f1: string; f2: string; f3: string; f4: string }> = {
  en: {
    f1: 'Reported on 1930 in 2024',
    f2: 'Lost to digital financial fraud',
    f3: '1-click tamper-evident Aadhaar & PAN verification',
    f4: 'Immediate freeze dossier generated',
  },
  hi: {
    f1: '2024 NCRP भारत रिपोर्ट',
    f2: 'वार्षिक राष्ट्रीय वित्तीय हानि',
    f3: '1-क्लिक आधार व पैन सत्यापित कानूनी शिकायतें',
    f4: 'घबराहट से FIR व बैंक फ्रीज डोजियर',
  },
  bn: {
    f1: '২০২৪ NCRP রিপোর্ট',
    f2: 'বার্ষিক ডিজিটাল আর্থিক ক্ষতি',
    f3: 'আধার ও প্যান যাচাইকৃত অভিযোগ',
    f4: 'তাৎক্ষণিক ব্যাংক ফ্রিজ ডসিয়ার',
  },
  mr: {
    f1: '२०२४ NCRP अहवाल',
    f2: 'वार्षिक डिजिटल आर्थिक नुकसान',
    f3: 'आधार व पॅन पडताळणीकृत तक्रारी',
    f4: 'तात्काळ बँक फ्रीझ डॉसियर',
  },
  te: {
    f1: '2024 NCRP భారతదేశ నివేదిక',
    f2: 'వార్షిక డిజిటల్ ఆర్థిక నష్టం',
    f3: 'ఆధార్ & పాన్ ధృవీకరించిన ఫిర్యాదులు',
    f4: 'తక్షణ బ్యాంక్ ఫ్రీజ్ డోసియర్',
  },
  ta: {
    f1: '2024 NCRP அறிக்கை',
    f2: 'வருடாந்திர டிஜிட்டல் நிதி இழப்பு',
    f3: 'ஆதார் & பான் சரிபார்க்கப்பட்ட புகார்கள்',
    f4: 'உடனடி வங்கி முடக்கம் கோப்பு',
  },
  gu: {
    f1: '2024 NCRP રિપોર્ટ',
    f2: 'વાર્ષિક ડિજિટલ નાણાકીય નુકસાન',
    f3: 'આધાર અને પાન ચકાસાયેલ ફરિયાદ',
    f4: 'તાત્કાલિક બેંક ફ્રીઝ ડોઝિયર',
  },
  ur: {
    f1: '2024 این سی آر پی رپورٹ',
    f2: 'ڈیجیٹل مالی فراڈ میں سالانہ نقصان',
    f3: 'آدھار اور پین تصدیق شدہ شکایات',
    f4: 'فوری بینک فریز ڈوزیئر',
  },
  kn: {
    f1: '2024 NCRP ವರದಿ',
    f2: 'ವಾರ್ಷಿಕ ಡಿಜಿಟಲ್ ಆರ್ಥಿಕ ನಷ್ಟ',
    f3: 'ಆಧಾರ್ ಮತ್ತು ಪ್ಯಾನ್ ಪರಿಶೀಲಿಸಿದ ದೂರುಗಳು',
    f4: 'ತಕ್ಷಣದ ಬ್ಯಾಂಕ್ ಫ್ರೀಜ್ ಡೋಸಿಯರ್',
  },
  or: {
    f1: '୨୦୨୪ NCRP ରିପୋର୍ଟ',
    f2: 'ବାର୍ଷିକ ଡିଜିଟାଲ୍ ଆର୍ଥିକ କ୍ଷତି',
    f3: 'ଆଧାର ଓ ପ୍ୟାନ୍ ଯାଞ୍ଚ ହୋଇଥିବା ଅଭିଯୋଗ',
    f4: 'ତୁରନ୍ତ ବ୍ୟାଙ୍କ ଫ୍ରିଜ୍ ଡୋଜିଅର୍',
  },
  ml: {
    f1: '2024 NCRP റിപ്പോർട്ട്',
    f2: 'വാർഷിക ഡിജിറ്റൽ സാമ്പത്തിക നഷ്ടം',
    f3: 'ആധാർ & പാൻ സ്ഥിരീകരിച്ച പരാതികൾ',
    f4: 'തൽക്ഷണ ബാങ്ക് ഫ്രീസ് ഡോസിയർ',
  },
  pa: {
    f1: '2024 NCRP ਰਿਪੋਰਟ',
    f2: 'ਸਾਲਾਨਾ ਡਿਜੀਟਲ ਵਿੱਤੀ ਨੁਕਸਾਨ',
    f3: 'ਆਧਾਰ ਅਤੇ ਪੈਨ ਤਸਦੀਕਸ਼ੁਦਾ ਸ਼ਿਕਾਇਤਾਂ',
    f4: 'ਤੁਰੰਤ ਬੈਂਕ ਫ੍ਰੀਜ਼ ਡੋਜ਼ੀਅਰ',
  },
}

export default function TrustStrip({ language }: TrustStripProps) {
  const t = getTranslation(language)
  const subs = SUB_LABELS[language] || SUB_LABELS.en

  const items = [
    {
      icon: <TrendingUp className="w-4 h-4 text-primary shrink-0" />,
      label: t.trust.reportedFraudsLabel,
      value: t.trust.reportedFrauds,
      sub: subs.f1,
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      label: t.trust.lostToFraudLabel,
      value: t.trust.lostToFraud,
      sub: subs.f2,
    },
    {
      icon: <Fingerprint className="w-4 h-4 text-primary shrink-0" />,
      label: t.nav.digiLockerVerified,
      value: 'DigiLocker',
      sub: subs.f3,
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-primary shrink-0" />,
      label: t.trust.triageSpeedLabel,
      value: t.trust.triageSpeed,
      sub: subs.f4,
    },
  ]

  return (
    <section className="w-full bg-surface border-y border-zinc-200/80 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 4 Major Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 items-stretch">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[14px] p-4 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 leading-snug">
                    {item.label}
                  </span>
                </div>
                <p
                  className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight ${
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
