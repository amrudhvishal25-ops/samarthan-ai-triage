'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BreathingIcon from './BreathingIcon'
import { SupportedLanguage } from '@/lib/i18n/languages'

interface LoadingTriageProps {
  language: SupportedLanguage
}

const LOADING_I18N: Record<SupportedLanguage, {
  pleaseWait: string
  breatheIn: string
  breatheOut: string
  aiAnalyzing: string
  aiReading: string
  takesSeconds: string
  steps: string[]
}> = {
  en: {
    pleaseWait: 'Please wait',
    breatheIn: 'Breathe in…',
    breatheOut: 'Breathe out…',
    aiAnalyzing: 'AI is analyzing your report',
    aiReading: 'AI is reading your report…',
    takesSeconds: 'This takes just a few seconds',
    steps: [
      'Transcribing your account…',
      'Identifying fraud type…',
      'Extracting key details…',
      'Generating freeze instructions…',
      'Drafting your complaint…',
    ],
  },
  hi: {
    pleaseWait: 'कृपया प्रतीक्षा करें',
    breatheIn: 'सांस अंदर लें…',
    breatheOut: 'सांस बाहर छोड़ें…',
    aiAnalyzing: 'AI आपकी रिपोर्ट विश्लेषण कर रहा है',
    aiReading: 'AI आपकी रिपोर्ट पढ़ रहा है…',
    takesSeconds: 'कृपया प्रतीक्षा करें, कुछ सेकंड लगेंगे',
    steps: [
      'आपका विवरण पढ़ा जा रहा है…',
      'धोखाधड़ी का प्रकार पहचाना जा रहा है…',
      'मुख्य जानकारी निकाली जा रही है…',
      'फ्रीज निर्देश तैयार हो रहे हैं…',
      'शिकायत का मसौदा बनाया जा रहा है…',
    ],
  },
  bn: {
    pleaseWait: 'অনুগ্রহ করে অপেক্ষা করুন',
    breatheIn: 'শ্বাস নিন…',
    breatheOut: 'শ্বাস ছাড়ুন…',
    aiAnalyzing: 'AI আপনার রিপোর্ট বিশ্লেষণ করছে',
    aiReading: 'AI আপনার রিপোর্ট পড়ছে…',
    takesSeconds: 'মাত্র কয়েক সেকেন্ড সময় লাগবে',
    steps: [
      'আপনার বিবরণ প্রতিলিপি করা হচ্ছে…',
      'প্রতারণার ধরন শনাক্ত করা হচ্ছে…',
      'মূল তথ্য বের করা হচ্ছে…',
      'অ্যাকাউন্ট ফ্রিজ করার নির্দেশ প্রস্তুত হচ্ছে…',
      'অভিযোগের খসড়া তৈরি করা হচ্ছে…',
    ],
  },
  mr: {
    pleaseWait: 'कृपया प्रतीक्षा करा',
    breatheIn: 'श्वास आत घ्या…',
    breatheOut: 'श्वास सोडा…',
    aiAnalyzing: 'AI तुमच्या अहवालाचे विश्लेषण करत आहे',
    aiReading: 'AI तुमचा अहवाल वाचत आहे…',
    takesSeconds: 'कृपया प्रतीक्षा करा, काही सेकंद लागतील',
    steps: [
      'तुमचा तपशील वाचला जात आहे…',
      'फसवणुकीचा प्रकार ओळखला जात आहे…',
      'महत्त्वाची माहिती काढली जात आहे…',
      'फ्रीज सूचना तयार केल्या जात आहेत…',
      'तक्रारीचा मसुदा तयार केला जात आहे…',
    ],
  },
  te: {
    pleaseWait: 'దయచేసి వేచి ఉండండి',
    breatheIn: 'శ్వాస తీసుకోండి…',
    breatheOut: 'శ్వాస వదలండి…',
    aiAnalyzing: 'AI మీ నివేదికను విశ్లేషిస్తోంది',
    aiReading: 'AI మీ నివేదికను చదువుతోంది…',
    takesSeconds: 'కొద్ది సెకన్ల సమయం పడుతుంది',
    steps: [
      'మీ ఖాతా వివరాలు లిప్యంతరీకరించబడుతున్నాయి…',
      'మోసం రకాన్ని గుర్తిస్తోంది…',
      'ముఖ్య వివరాలను సంగ్రహిస్తోంది…',
      'ఫ్రీజ్ సూచనలు రూపొందిస్తోంది…',
      'మీ ఫిర్యాదు డ్రాఫ్ట్ చేస్తోంది…',
    ],
  },
  ta: {
    pleaseWait: 'தயவுசெய்து காத்திருக்கவும்',
    breatheIn: 'மூச்சை உள்ளே இழுக்கவும்…',
    breatheOut: 'மூச்சை வெளியே விடவும்…',
    aiAnalyzing: 'AI உங்கள் புகாரை பகுப்பாய்வு செய்கிறது',
    aiReading: 'AI உங்கள் அறிக்கையைப் படிக்கிறது…',
    takesSeconds: 'சில வினாடிகள் மட்டுமே ஆகும்',
    steps: [
      'உங்கள் விவரங்களை படியெடுக்கிறது…',
      'மோசடி வகையைக் கண்டறிகிறது…',
      'முக்கிய விவரங்களைப் பிரித்தெடுக்கிறது…',
      'முடக்கும் வழிமுறைகளை உருவாக்குகிறது…',
      'உங்கள் புகார் மனுவை உருவாக்குகிறது…',
    ],
  },
  gu: {
    pleaseWait: 'કૃપા કરીને રાહ જુઓ',
    breatheIn: 'શ્વાસ અંદર લો…',
    breatheOut: 'શ્વાસ બહાર કાઢો…',
    aiAnalyzing: 'AI તમારા અહેવાલનું વિશ્લેષણ કરી રહ્યું છે',
    aiReading: 'AI તમારો અહેવાલ વાંચી રહ્યું છે…',
    takesSeconds: 'થોડી સેકન્ડો લાગશે',
    steps: [
      'તમારી વિગતો ટ્રાન્સક્રાઇબ થઈ રહી છે…',
      'છેતરપિંડીનો પ્રકાર ઓળખાઈ રહ્યો છે…',
      'મુખ્ય વિગતો તારવવામાં આવી રહી છે…',
      'ફ્રીઝ સૂચનાઓ તૈયાર થઈ રહી છે…',
      'ફરિયાદનો મુસદ્દો તૈયાર થઈ રહ્યો છે…',
    ],
  },
  ur: {
    pleaseWait: 'براہ کرم انتظار کریں',
    breatheIn: 'سانس اندر لیں…',
    breatheOut: 'سانس باہر چھوڑیں…',
    aiAnalyzing: 'AI آپ کی رپورٹ کا تجزیہ کر رہا ہے',
    aiReading: 'AI آپ کی رپورٹ پڑھ رہا ہے…',
    takesSeconds: 'اس میں بس چند سیکنڈ لگیں گے',
    steps: [
      'آپ کے بیان کا متن تیار کیا جا رہا ہے…',
      'دھوکہ دہی کی قسم کی شناخت کی جا رہی ہے…',
      'اہم تفصیلات نکالی جا رہی ہیں…',
      'منجمد کرنے کی ہدایات تیار کی جا رہی ہیں…',
      'آپ کی شکایت کا مسودہ تیار ہو رہا ہے…',
    ],
  },
  kn: {
    pleaseWait: 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ',
    breatheIn: 'ಉಸಿರನ್ನು ಒಳಗೆ ತೆಗೆದುಕೊಳ್ಳಿ…',
    breatheOut: 'ಉಸಿರನ್ನು ಹೊರಗೆ ಬಿಡಿ…',
    aiAnalyzing: 'AI ನಿಮ್ಮ ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ',
    aiReading: 'AI ನಿಮ್ಮ ವರದಿಯನ್ನು ಓದುತ್ತಿದೆ…',
    takesSeconds: 'ಕೆಲವೇ ಸೆಕೆಂಡುಗಳು ಬೇಕಾಗುತ್ತದೆ',
    steps: [
      'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ…',
      'ವಂಚನೆಯ ಪ್ರಕಾರವನ್ನು ಗುರುತಿಸಲಾಗುತ್ತಿದೆ…',
      'ಪ್ರಮುಖ ವಿವರಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ…',
      'ಖಾತೆ ಸ್ಥಗಿತಗೊಳಿಸುವ ಸೂಚನೆಗಳು ಸಿದ್ಧವಾಗುತ್ತಿವೆ…',
      'ದೂರಿನ ಕರಡನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…',
    ],
  },
  or: {
    pleaseWait: 'ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ',
    breatheIn: 'ଶ୍ୱାସ ନିଅନ୍ତୁ…',
    breatheOut: 'ଶ୍ୱାସ ଛାଡ଼ନ୍ତୁ…',
    aiAnalyzing: 'AI ଆପଣଙ୍କ ରିପୋର୍ଟ ବିଶ୍ଳେଷଣ କରୁଛି',
    aiReading: 'AI ଆପଣଙ୍କ ରିପୋର୍ଟ ପଢୁଛି…',
    takesSeconds: 'କିଛି ସେକେଣ୍ଡ ସମୟ ଲାଗିବ',
    steps: [
      'ଆପଣଙ୍କ ବିବରଣୀ ଲିପିବଦ୍ଧ ହେଉଛି…',
      'ଠକେଇ ପ୍ରକାର ଚିହ୍ନଟ ହେଉଛି…',
      'ମୁଖ୍ୟ ତଥ୍ୟ ସଂଗ୍ରହ କରାଯାଉଛି…',
      'ଖାତା ଫ୍ରିଜ୍ ନିର୍ଦ୍ଦେଶ ପ୍ରସ୍ତୁତ ହେଉଛି…',
      'ଅଭିଯୋଗ ଡ୍ରାଫ୍ଟ କରାଯାଉଛି…',
    ],
  },
  ml: {
    pleaseWait: 'ദയവായി കാത്തിരിക്കുക',
    breatheIn: 'ശ്വാസമെടുക്കൂ…',
    breatheOut: 'ശ്വാസം വിടൂ…',
    aiAnalyzing: 'AI നിങ്ങളുടെ റിപ്പോർട്ട് വിശകലനം ചെയ്യുന്നു',
    aiReading: 'AI നിങ്ങളുടെ റിപ്പോർട്ട് വായിക്കുന്നു…',
    takesSeconds: 'കുറച്ച് നിമിഷങ്ങൾ എടുക്കും',
    steps: [
      'വിവരങ്ങൾ പകർത്തുന്നു…',
      'തട്ടിപ്പ് തരം തിരിച്ചറിയുന്നു…',
      'പ്രധാന വിവരങ്ങൾ വേർതിരിച്ചെടുക്കുന്നു…',
      'അക്കൗണ്ട് മരവിപ്പിക്കാനുള്ള നിർദ്ദേശങ്ങൾ തയ്യാറാക്കുന്നു…',
      'പരാതിയുടെ കരട് തയ്യാറാക്കുന്നു…',
    ],
  },
  pa: {
    pleaseWait: 'ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ',
    breatheIn: 'ਸਾਹ ਅੰਦਰ ਲਵੋ…',
    breatheOut: 'ਸਾਹ ਬਾਹਰ ਛੱਡੋ…',
    aiAnalyzing: 'AI ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ',
    aiReading: 'AI ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਪੜ੍ਹ ਰਿਹਾ ਹੈ…',
    takesSeconds: 'ਕੁਝ ਸਕਿੰਟ ਲੱਗਣਗੇ',
    steps: [
      'ਤੁਹਾਡਾ ਵੇਰਵਾ ਲਿਖਿਆ ਜਾ ਰਿਹਾ ਹੈ…',
      'ਧੋਖਾਧੜੀ ਦੀ ਕਿਸਮ ਪਛਾਣੀ ਜਾ ਰਹੀ ਹੈ…',
      'ਮੁੱਖ ਜਾਣਕਾਰੀ ਕੱਢੀ ਜਾ ਰਹੀ ਹੈ…',
      'ਫ੍ਰੀਜ਼ ਨਿਰਦੇਸ਼ ਤਿਆਰ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ…',
      'ਸ਼ਿਕਾਇਤ ਦਾ ਖਰੜਾ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…',
    ],
  },
}

const BREATH_DURATION = 3800 // one full inhale+exhale cycle, ms

export default function LoadingTriage({ language }: LoadingTriageProps) {
  const t = LOADING_I18N[language] || LOADING_I18N.en
  const steps = t.steps
  const [breathing, setBreathing] = useState(true)
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale')

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhase(p => (p === 'inhale' ? 'exhale' : 'inhale'))
    }, BREATH_DURATION / 2)

    const doneTimer = setTimeout(() => setBreathing(false), BREATH_DURATION * 1.6)

    return () => {
      clearInterval(phaseTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12 px-6 min-h-[520px] w-full text-center">
      <AnimatePresence mode="wait">
        {breathing ? (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-16"
          >
            {/* Text on top */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2 indic-headline">
                <span>{t.pleaseWait}</span>
                <span aria-hidden="true">💙</span>
              </h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-civic-blue text-sm font-medium indic-body"
                >
                  {phase === 'inhale' ? t.breatheIn : t.breatheOut}
                </motion.p>
              </AnimatePresence>
              <p className="text-gray-400 text-xs mt-2 indic-body">
                {t.aiAnalyzing}
              </p>
            </div>

            {/* Large orb below — the centrepiece */}
            <motion.div
              animate={{ scale: phase === 'inhale' ? 1.04 : 0.97 }}
              transition={{ duration: BREATH_DURATION / 2 / 1000, ease: 'easeInOut' }}
              className="flex items-center justify-center relative"
            >
              <div className="absolute inset-0 bg-blue-400/20 blur-[60px] animate-pulse rounded-full" />
              <BreathingIcon phase={phase} durationMs={BREATH_DURATION / 2} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-civic-blueLight flex items-center justify-center"
            >
              <span className="text-4xl select-none">🧠</span>
            </motion.div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1 indic-headline">
                {t.aiReading}
              </h2>
              <p className="text-gray-500 text-sm indic-body">
                {t.takesSeconds}
              </p>
            </div>

            {/* Animated steps */}
            <div className="w-full max-w-sm space-y-3">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.5, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.5 + 0.2 }}
                    className="w-5 h-5 rounded-full bg-civic-blue flex-shrink-0 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <span className="text-sm text-gray-600">{step}</span>
                </motion.div>
              ))}
            </div>

            {/* Skeleton shimmer cards */}
            <div className="w-full max-w-sm space-y-3">
              {[80, 60, 90].map((w, i) => (
                <div key={i} className="skeleton h-4 rounded-md" style={{ width: `${w}%` }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
