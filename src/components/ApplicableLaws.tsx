import { Scale } from 'lucide-react'
import { ApplicableLaw } from '@/data/scenarios'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { APPLICABLE_LAWS_I18N } from '@/lib/i18n/componentTranslations'

interface ApplicableLawsProps {
  laws: ApplicableLaw[]
  hi?: boolean
  language?: SupportedLanguage
}

const COMMON_LAW_TITLES: Record<string, Record<SupportedLanguage, string>> = {
  '66D': {
    en: 'Cheating by personation by using computer resource',
    hi: 'कंप्यूटर संसाधन के उपयोग से प्रतिरूपण द्वारा धोखाधड़ी',
    bn: 'কম্পিউটার ব্যবহারের মাধ্যমে ছদ্মবেশে প্রতারণা',
    mr: 'संगणक संसाधनांचा वापर करून फसवणूक',
    te: 'కంప్యూటర్ వనరును ఉపయోగించి మోసం చేయడం',
    ta: 'கணினி மூலம் ஆள்மாறாட்டம் செய்து ஏமாற்றுதல்',
    gu: 'કમ્પ્યુટર સંસાધનના ઉપયોગ દ્વારા છેતરપિંડી',
    ur: 'کمپیوٹر کے ذریعے دھوکہ دہی اور نقالی',
    kn: 'ಕಂಪ್ಯೂಟರ್ ಬಳಸಿ ವಂಚನೆ',
    or: 'କମ୍ପ୍ୟୁଟର ମାଧ୍ୟମରେ ପ୍ରତାରଣା',
    ml: 'കമ്പ്യൂട്ടർ ദുരുപയോഗം വഴിയുള്ള തട്ടിപ്പ്',
    pa: 'ਕੰਪਿਊਟਰ ਸਰੋਤਾਂ ਰਾਹੀਂ ਧੋਖਾਧੜੀ',
  },
  '66C': {
    en: 'Punishment for identity theft',
    hi: 'पहचान की चोरी के लिए दंड',
    bn: 'পরিচয় চুরির শাস্তি',
    mr: 'ओळख चोरीसाठी शिक्षा',
    te: 'గుర్తింపు దొంగతనానికి శిక్ష',
    ta: 'அடையாள திருட்டுக்கான தண்டனை',
    gu: 'ઓળખની ચોરી માટે સજા',
    ur: 'شناخت کی چوری کی سزا',
    kn: 'ಗುರುತಿನ ಕಳ್ಳತನಕ್ಕೆ ಶಿಕ್ಷೆ',
    or: 'ପରିଚୟ ଚୋରି ପାଇଁ ଦଣ୍ଡ',
    ml: 'തിരിച്ചറിയൽ രേഖ മോഷണത്തിനുള്ള ശിക്ഷ',
    pa: 'ਪਛਾਣ ਦੀ ਚੋਰੀ ਲਈ ਸਜ਼ਾ',
  },
  '67': {
    en: 'Publishing obscene material in electronic form',
    hi: 'इलेक्ट्रॉनिक रूप में अश्लील सामग्री का प्रसारण',
    bn: 'ইলেকট্রনিক মাধ্যমে অশ্লীল উপাদান প্রকাশ',
    mr: 'इलेक्ट्रॉनिक स्वरूपात अश्लील सामग्री प्रसारित करणे',
    te: 'ఎలక్ట్రానిక్ రూపంలో అసభ్యకరమైన అంశాల ప్రసారం',
    ta: 'மின்னணு வடிவில் ஆபாசமானவற்றை வெளியிடுதல்',
    gu: 'ઇલેક્ટ્રોનિક સ્વરૂપમાં અશ્લીલ સામગ્રી પ્રસારિત કરવી',
    ur: 'الیکٹرانک مواد کی غیر قانونی اشاعت',
    kn: 'ವಿದ್ಯುನ್ಮಾನ ರೂಪದಲ್ಲಿ ಆಕ್ಷೇಪಾರ್ಹ ವಿಷಯ ಪ್ರಕಟಣೆ',
    or: 'ଇଲେକ୍ଟ୍ରୋନିକ୍ ମାଧ୍ୟମରେ ଅଶ୍ଳୀଳ ସାମଗ୍ରୀ ପ୍ରସାରଣ',
    ml: 'ഇലക്ട്രോണിക് രൂപത്തിൽ അശ്ലീല വിവരങ്ങൾ പ്രചരിപ്പിക്കൽ',
    pa: 'ਇਲੈਕਟ੍ਰਾਨਿਕ ਰੂਪ ਵਿੱਚ ਅਸ਼ਲੀਲ ਸਮੱਗਰੀ ਦਾ ਪ੍ਰਸਾਰਣ',
  },
}

function getLocalizedLawTitle(law: ApplicableLaw, lang: SupportedLanguage): string {
  if (lang === 'en') return law.title
  if (lang === 'hi') return law.titleHi || law.title
  for (const [key, map] of Object.entries(COMMON_LAW_TITLES)) {
    if (law.section.includes(key)) {
      return map[lang] || law.titleHi || law.title
    }
  }
  return law.titleHi || law.title
}

export default function ApplicableLaws({ laws, hi, language }: ApplicableLawsProps) {
  if (!Array.isArray(laws) || laws.length === 0) return null
  const lang: SupportedLanguage = language || (hi ? 'hi' : 'en')
  const loc = APPLICABLE_LAWS_I18N[lang] || APPLICABLE_LAWS_I18N.en

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-500" />
          {loc.header}
        </h3>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-sm px-1.5 py-0.5">
          {loc.badge}
        </span>
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        {loc.subtitle}
      </p>

      <div className="space-y-3">
        {laws.map((law, idx) => (
          <div key={idx} className="border border-zinc-200 rounded-lg p-3.5 bg-zinc-50">
            <span className="inline-block text-xs font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5 mb-1.5">
              {law.section}
            </span>
            <p className="text-sm font-semibold text-zinc-900 leading-snug">
              {getLocalizedLawTitle(law, lang)}
            </p>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {lang === 'en' ? law.reason : (law.reasonHi || law.reason)}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-zinc-400 mt-4 pt-3 border-t border-dashed border-zinc-200">
        {loc.disclaimer}
      </p>
    </div>
  )
}
