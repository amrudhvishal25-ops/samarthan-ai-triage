'use client'

import clsx from 'clsx'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { UrgencyLevel } from '@/data/scenarios'
import { SupportedLanguage } from '@/lib/i18n/languages'

interface UrgencyBadgeProps {
  level: UrgencyLevel
  language: SupportedLanguage
  size?: 'sm' | 'lg'
}

const config: Record<UrgencyLevel, {
  labels: Record<SupportedLanguage, string>;
  bg: string; text: string; border: string;
  Icon: React.ElementType
}> = {
  CRITICAL: {
    labels: {
      en: 'CRITICAL — Act in Next 60 Minutes',
      hi: 'अत्यावश्यक — अगले 60 मिनट में कार्य करें',
      bn: 'জরুরি — পরবর্তী ৬০ মিনিটে পদক্ষেপ নিন',
      mr: 'अत्यंत तातडीचे — पुढील ६० मिनिटांत कारवाई करा',
      te: 'అత్యవసరం — తదుపరి 60 నిమిషాల్లో చర్య తీసుకోండి',
      ta: 'மிக அவசரம் — அடுத்த 60 நிமிடங்களில் நடவடிக்கை எடுக்கவும்',
      gu: 'અત્યંત તાકીદનું — આગામી 60 મિનિટમાં પગલાં લો',
      ur: 'انتہائی ضروری — اگلے 60 منٹوں میں کارروائی کریں',
      kn: 'ಅತ್ಯಂತ ತುರ್ತು — ಮುಂದಿನ 60 ನಿಮಿಷಗಳಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ',
      or: 'ଅତ୍ୟନ୍ତ ଜରୁରୀ — ପରବର୍ତ୍ତୀ ୬୦ ମିନିଟରେ ପଦକ୍ଷେପ ନିଅନ୍ତୁ',
      ml: 'അതീവ നിർണായകം — അടുത്ത 60 മിനിറ്റിനുള്ളിൽ നടപടിയെടുക്കുക',
      pa: 'ਬਹੁਤ ਜ਼ਰੂਰੀ — ਅਗਲੇ 60 ਮਿੰਟਾਂ ਵਿੱਚ ਕਾਰਵਾਈ ਕਰੋ',
    },
    bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300',
    Icon: AlertTriangle,
  },
  HIGH: {
    labels: {
      en: 'HIGH PRIORITY — Act Today',
      hi: 'उच्च प्राथमिकता — आज ही कार्य करें',
      bn: 'উচ্চ অগ্রাধিকার — আজই পদক্ষেপ নিন',
      mr: 'उच्च प्राधान्य — आजच कारवाई करा',
      te: 'అధిక ప్రాధాన్యత — ఈరోజే చర్య తీసుకోండి',
      ta: 'உயர் முன்னுரிமை — இன்றே நடவடிக்கை எடுக்கவும்',
      gu: 'ઉચ્ચ પ્રાથમિકતા — આજે જ પગલાં લો',
      ur: 'اعلیٰ ترجیح — آج ہی کارروائی کریں',
      kn: 'ಹೆಚ್ಚಿನ ಆದ್ಯತೆ — ಇಂದೇ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ',
      or: 'ଉଚ୍ଚ ପ୍ରାଥମିକତା — ଆଜି ହିଁ ପଦକ୍ଷେପ ନିଅନ୍ତୁ',
      ml: 'ഉയർന്ന മുൻഗണന — ഇന്ന് തന്നെ നടപടിയെടുക്കുക',
      pa: 'ਉੱਚ ਤਰਜੀਹ — ਅੱਜ ਹੀ ਕਾਰਵਾਈ ਕਰੋ',
    },
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300',
    Icon: AlertCircle,
  },
  MEDIUM: {
    labels: {
      en: 'MEDIUM PRIORITY — File Within 24 Hours',
      hi: 'मध्यम प्राथमिकता — 24 घंटे में दर्ज करें',
      bn: 'মাঝারি অগ্রাধিকার — ২৪ ঘণ্টার মধ্যে নথিভুক্ত করুন',
      mr: 'मध्यम प्राधान्य — २४ तासांत तक्रार नोंदवा',
      te: 'మధ్యస్థ ప్రాధాన్యత — 24 గంటల్లో నమోదు చేయండి',
      ta: 'நடுத்தர முன்னுரிமை — 24 மணி நேரத்திற்குள் பதிவு செய்யவும்',
      gu: 'મધ્યમ પ્રાથમિકતા — 24 કલાકમાં નોંધણી કરો',
      ur: 'درمیانی ترجیح — 24 گھنٹوں کے اندر درج کریں',
      kn: 'ಮಧ್ಯಮ ಆದ್ಯತೆ — 24 ಗಂಟೆಗಳ ಒಳಗೆ ದಾಖಲಿಸಿ',
      or: 'ମଧ୍ୟମ ପ୍ରାଥମିକତା — ୨୪ ଘଣ୍ଟା ମଧ୍ୟରେ ଦାଖଲ କରନ୍ତୁ',
      ml: 'ഇടത്തരം മുൻഗണന — 24 മണിക്കൂറിനുള്ളിൽ രേഖപ്പെടുത്തുക',
      pa: 'ਦਰਮਿਆਨੀ ਤਰਜੀਹ — 24 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ ਦਰਜ ਕਰੋ',
    },
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300',
    Icon: Info,
  },
  LOW: {
    labels: {
      en: 'LOW PRIORITY',
      hi: 'कम प्राथमिकता',
      bn: 'কম অগ্রাধিকার',
      mr: 'कमी प्राधान्य',
      te: 'తక్కువ ప్రాధాన్యత',
      ta: 'குறைந்த முன்னுரிமை',
      gu: 'ઓછી પ્રાથમિકતા',
      ur: 'کم ترجیح',
      kn: 'ಕಡಿಮೆ ಆದ್ಯತೆ',
      or: 'କମ୍ ପ୍ରାଥମିକତା',
      ml: 'കുറഞ്ഞ മുൻഗണന',
      pa: 'ਘੱਟ ਤਰਜੀਹ',
    },
    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300',
    Icon: CheckCircle,
  },
}

export default function UrgencyBadge({ level, language, size = 'sm' }: UrgencyBadgeProps) {
  const c = config[level] ?? config.MEDIUM
  const { Icon } = c
  const label = c.labels[language] || c.labels.en

  return (
    <div className={clsx(
      'inline-flex items-center gap-2 rounded-lg border font-semibold',
      c.bg, c.text, c.border,
      size === 'lg' ? 'px-4 py-3 text-sm w-full' : 'px-3 py-1.5 text-xs'
    )}>
      <Icon className={size === 'lg' ? 'w-5 h-5 flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'} />
      <span className="indic-body">{label}</span>
    </div>
  )
}
