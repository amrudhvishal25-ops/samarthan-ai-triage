'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTriage } from '@/context/TriageContext'
import {
  DollarSign, User, ShieldAlert, Fingerprint, ShoppingCart, Briefcase,
  Plus, ArrowUp, Mic, Phone, MessageCircle, Globe, ExternalLink,
} from 'lucide-react'
import WhatsAppChoiceModal from '@/components/WhatsAppChoiceModal'
import WhatsAppSimulatorModal from '@/components/WhatsAppSimulatorModal'
import { SupportedLanguage, LANGUAGE_MAP } from '@/lib/i18n/languages'
import { getTranslation } from '@/lib/i18n/translations'

interface FileReportSectionProps {
  language: SupportedLanguage
}

type Channel = 'web' | 'call' | 'whatsapp'

const FILE_REPORT_I18N: Record<string, {
  eyebrow: string
  title: string
  pickCategory: string
  tabCall: string
  tabWhatsApp: string
  tabWeb: string
  callHeading: string
  callDesc: string
  waHeading: string
  waDesc: string
  waBtn: string
  waActive: string
}> = {
  en: {
    eyebrow: 'Get started',
    title: 'How do you want to report?',
    pickCategory: 'Or pick a category',
    tabCall: 'Call 1930',
    tabWhatsApp: 'WhatsApp',
    tabWeb: 'Use the web',
    callHeading: 'National Cybercrime Helpline',
    callDesc: 'Talk in the language you are comfortable with. One clear question at a time. This is the fastest route to an emergency account freeze.',
    waHeading: 'Samarthan WhatsApp Cyber Agent',
    waDesc: 'Chat directly with our 24x7 WhatsApp AI triage agent. Send a voice note, message, or screenshot to receive instant legal advice, freeze steps, and your live complaint tracking link.',
    waBtn: 'Chat with WhatsApp AI Agent',
    waActive: 'WhatsApp AI Agent Active (24x7)',
  },
  hi: {
    eyebrow: 'शुरू करें',
    title: 'कैसे रिपोर्ट करना चाहते हैं?',
    pickCategory: 'या श्रेणी चुनें',
    tabCall: '1930 पर कॉल करें',
    tabWhatsApp: 'व्हाट्सएप',
    tabWeb: 'वेब पर करें',
    callHeading: 'राष्ट्रीय साइबर अपराध हेल्पलाइन',
    callDesc: 'अपनी भाषा में बात करें। एक बार में एक स्पष्ट सवाल। तुरंत बैंक खाता फ्रीज़ के लिए यही सबसे तेज़ रास्ता है।',
    waHeading: 'व्हाट्सएप AI साइबर सहायता एजेंट',
    waDesc: 'हमारे 24x7 AI एजेंट को वॉइस नोट, मैसेज या स्क्रीनशॉट भेजें। एजेंट विवरण निकालेगा, कानून धाराएं जोड़ेगा और लाइव पोर्टल ट्रैकिंग लिंक देगा।',
    waBtn: 'व्हाट्सएप AI एजेंट से बात करें',
    waActive: 'व्हाट्सएप AI एजेंट सक्रिय (24x7)',
  },
  bn: {
    eyebrow: 'শুরু করুন',
    title: 'কীভাবে অভিযোগ জানাতে চান?',
    pickCategory: 'অথবা একটি বিভাগ বেছে নিন',
    tabCall: '১৯৩০-এ কল করুন',
    tabWhatsApp: 'হোয়াটসঅ্যাপ',
    tabWeb: 'ওয়েবে অভিযোগ করুন',
    callHeading: 'জাতীয় সাইবার ক্রাইম হেল্পলাইন',
    callDesc: 'আপনার পছন্দের ভাষায় কথা বলুন। জরুরি ব্যাংক অ্যাকাউন্ট ফ্রিজ করার জন্য এটি দ্রুততম উপায়।',
    waHeading: 'হোয়াটসঅ্যাপ AI সাইবার সহায়ক এজেন্ট',
    waDesc: 'আমাদের ২৪x৭ AI এজেন্টের সাথে চ্যাট করুন। ভয়েস মেসেজ বা স্ক্রিনশট পাঠিয়ে তাৎক্ষণিক আইনি সহায়তা ও ট্র্যাকিং লিংক পান।',
    waBtn: 'হোয়াটসঅ্যাপ AI এজেন্টের সাথে চ্যাট করুন',
    waActive: 'হোয়াটসঅ্যাপ AI এজেন্ট সক্রিয় (২৪x৭)',
  },
  mr: {
    eyebrow: 'सुरू करा',
    title: 'तक्रार कशी नोंदवायची आहे?',
    pickCategory: 'किंवा श्रेणी निवडा',
    tabCall: '१९३० वर कॉल करा',
    tabWhatsApp: 'व्हॉट्सॲप',
    tabWeb: 'वेबवर नोंदवा',
    callHeading: 'राष्ट्रीय सायबर गुन्हे हेल्पलाइन',
    callDesc: 'तुमच्या स्वतःच्या भाषेत बोला. बँक खाते तातडीने गोठवण्यासाठी हा सर्वात जलद मार्ग आहे.',
    waHeading: 'व्हॉट्सॲप AI सायबर एजंट',
    waDesc: 'आमच्या २४x७ AI एजंटशी थेट बोला. व्हॉइस नोट किंवा स्क्रीनशॉट पाठवून कायदेशीर कलमे व लाइव्ह ट्रॅकिंग लिंक मिळवा.',
    waBtn: 'व्हॉट्सॲप AI एजंटशी चॅट करा',
    waActive: 'व्हॉट्सॲप AI एजंट सक्रिय (२४x७)',
  },
  te: {
    eyebrow: 'ప్రారంభించండి',
    title: 'మీరు ఎలా నివేదించాలనుకుంటున్నారు?',
    pickCategory: 'లేదా వర్గాన్ని ఎంచుకోండి',
    tabCall: '1930 కి కాల్ చేయండి',
    tabWhatsApp: 'వాట్సాప్',
    tabWeb: 'వెబ్‌లో నమోదు చేయండి',
    callHeading: 'జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్',
    callDesc: 'మీకు నచ్చిన భాషలో మాట్లాడండి. అత్యవసర ఖాతా ఫ్రీజ్ కోసం ఇది వేగవంతమైన మార్గం.',
    waHeading: 'వాట్సాప్ AI సైబర్ ఏజెంట్',
    waDesc: 'మా 24x7 వాట్సాప్ AI ఏజెంట్‌తో చాట్ చేయండి. వాయిస్ నోట్ లేదా స్క్రీన్‌షాట్ పంపడం ద్వారా తక్షణ సలహా మరియు ట్రాకింగ్ లింక్ పొందండి.',
    waBtn: 'వాట్సాప్ AI ఏజెంట్‌తో చాట్ చేయండి',
    waActive: 'వాట్సాప్ AI ఏజెంట్ యాక్టివ్ (24x7)',
  },
  ta: {
    eyebrow: 'தொடங்குங்கள்',
    title: 'நீங்கள் எவ்வாறு புகார் செய்ய விரும்புகிறீர்கள்?',
    pickCategory: 'அல்லது வகையைத் தேர்ந்தெடுக்கவும்',
    tabCall: '1930-க்கு அழைக்கவும்',
    tabWhatsApp: 'வாட்ஸ்அப்',
    tabWeb: 'இணையத்தில் பதிவு செய்க',
    callHeading: 'தேசிய சைபர் குற்ற உதவி எண்',
    callDesc: 'உங்கள் தாய்மொழியில் பேசுங்கள். உடனடி வங்கி கணக்கு முடக்கத்திற்கு இதுவே விரைவான வழி.',
    waHeading: 'வாட்ஸ்அப் AI சைபர் உதவியாளர்',
    waDesc: 'எங்கள் 24x7 வாட்ஸ்அப் AI உதவியாளருடன் உரையாடுங்கள். குரல் செய்தி அல்லது ஸ்கிரீன்ஷாட் அனுப்பி உடனடி உதவி பெறுங்கள்.',
    waBtn: 'வாட்ஸ்அப் AI உடன் உரையாடுங்கள்',
    waActive: 'வாட்ஸ்அப் AI உதவியாளர் தயார் (24x7)',
  },
  gu: {
    eyebrow: 'શરૂ કરો',
    title: 'તમે કેવી રીતે ફરિયાદ કરવા માંગો છો?',
    pickCategory: 'અથવા શ્રેણી પસંદ કરો',
    tabCall: '1930 પર કૉલ કરો',
    tabWhatsApp: 'વ્હોટ્સએપ',
    tabWeb: 'વેબ પર નોંધાવો',
    callHeading: 'રાષ્ટ્રીય સાયબર ક્રાઈમ હેલ્પલાઈન',
    callDesc: 'તમારી સરળ ભાષામાં વાત કરો. તાત્કાલિક બેંક ખાતું ફ્રીઝ કરાવવાનો આ સૌથી ઝડપી રસ્તો છે.',
    waHeading: 'વ્હોટ્સએપ AI સાયબર એજન્ટ',
    waDesc: 'અમારા 24x7 વ્હોટ્સએપ AI એજન્ટ સાથે વાત કરો. વૉઇસ નોટ કે સ્ક્રીનશૉટ મોકલી તાત્કાલિક માર્ગદર્શન મેળવો.',
    waBtn: 'વ્હોટ્સએપ AI એજન્ટ સાથે ચેટ કરો',
    waActive: 'વ્હોટ્સએપ AI એજન્ટ સક્રિય (24x7)',
  },
  ur: {
    eyebrow: 'شروع کریں',
    title: 'آپ رپورٹ کیسے درج کرنا چاہتے ہیں؟',
    pickCategory: 'یا زمرہ منتخب کریں',
    tabCall: '1930 پر کال کریں',
    tabWhatsApp: 'واٹس ایپ',
    tabWeb: 'ویب پر درج کریں',
    callHeading: 'قومی سائبر کرائم ہیلپ لائن',
    callDesc: 'اپنی زبان میں بات کریں۔ بینک اکاؤنٹ کو فوری فریز کروانے کا یہ تیز ترین طریقہ ہے۔',
    waHeading: 'واٹس ایپ AI سائબર ایجنٹ',
    waDesc: 'ہمارے 24x7 واٹس ایپ AI ایجنٹ کے ساتھ چیٹ کریں۔ وائس نوٹ یا اسکرین شاٹ بھیج کر فوری قانونی رہنمائی حاصل کریں۔',
    waBtn: 'واٹس ایپ AI ایجنٹ سے رابطہ کریں',
    waActive: 'واٹس ایپ AI ایجنٹ فعال (24x7)',
  },
  kn: {
    eyebrow: 'ಪ್ರಾರಂಭಿಸಿ',
    title: 'ನೀವು ಹೇಗೆ ದೂರು ನೀಡಲು ಬಯಸುತ್ತೀರಿ?',
    pickCategory: 'ಅಥವಾ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    tabCall: '1930 ಗೆ ಕರೆ ಮಾಡಿ',
    tabWhatsApp: 'ವಾಟ್ಸಾಪ್',
    tabWeb: 'ವೆಬ್‌ನಲ್ಲಿ ದಾಖಲಿಸಿ',
    callHeading: 'ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ಸಹಾಯವಾಣಿ',
    callDesc: 'ನಿಮ್ಮ ಅನುಕೂಲಕರ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ. ಬ್ಯಾಂಕ್ ಖಾತೆ ತಕ್ಷಣ ಫ್ರೀಜ್ ಮಾಡಲು ಇದು ಅತ್ಯಂತ ವೇಗದ ಮಾರ್ಗ.',
    waHeading: 'ವಾಟ್ಸಾಪ್ AI ಸೈಬರ್ ಏಜೆಂಟ್',
    waDesc: 'ನಮ್ಮ 24x7 ವಾಟ್ಸಾಪ್ AI ಏಜೆಂಟ್ ಜೊತೆ ಚಾಟ್ ಮಾಡಿ. ಧ್ವನಿ ಸಂದೇಶ ಅಥವಾ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಕಳುಹಿಸಿ ತಕ್ಷಣ ಸಹಾಯ ಪಡೆಯಿರಿ.',
    waBtn: 'ವಾಟ್ಸಾಪ್ AI ಏಜೆಂಟ್ ಜೊತೆ ಚಾಟ್ ಮಾಡಿ',
    waActive: 'ವಾಟ್ಸಾಪ್ AI ಏಜೆಂಟ್ ಸಕ್ರಿಯ (24x7)',
  },
  or: {
    eyebrow: 'ଆରମ୍ଭ କରନ୍ତୁ',
    title: 'ଆପଣ କିପରି ଅଭିଯୋଗ କରିବାକୁ ଚାହାଁନ୍ତି?',
    pickCategory: 'କିମ୍ବା ବର୍ଗ ବାଛନ୍ତୁ',
    tabCall: '୧୯୩୦ କୁ କଲ୍ କରନ୍ତୁ',
    tabWhatsApp: 'ହ୍ୱାଟସ୍‌ଆପ୍',
    tabWeb: 'ୱେବ୍‌ରେ ଦାଖଲ କରନ୍ତୁ',
    callHeading: 'ଜାତୀୟ ସାଇବର୍ କ୍ରାଇମ୍ ହେଲ୍ପଲାଇନ୍',
    callDesc: 'ଆପଣଙ୍କ ନିଜ ଭାଷାରେ କଥା ହୁଅନ୍ତୁ। ବ୍ୟାଙ୍କ ଖାତା ତୁରନ୍ତ ଫ୍ରିଜ୍ କରିବା ପାଇଁ ଏହା ସବୁଠାରୁ ଦ୍ରୁତ ମାଧ୍ୟମ।',
    waHeading: 'ହ୍ୱାଟସ୍‌ଆପ୍ AI ସାଇବର୍ ଏଜେଣ୍ଟ',
    waDesc: 'ଆମର ୨୪x୭ AI ଏଜେଣ୍ଟ ସହିତ ଚାଟ୍ କରନ୍ତୁ। ଭଏସ୍ ନୋଟ୍ କିମ୍ବା ସ୍କ୍ରିନସଟ୍ ପଠାଇ ତୁରନ୍ତ ସହାୟତା ପାଆନ୍ତୁ।',
    waBtn: 'ହ୍ୱାଟସ୍‌ଆପ୍ AI ଏଜେଣ୍ଟ ସହିତ କଥା ହୁଅନ୍ତୁ',
    waActive: 'ହ୍ୱାଟସ୍‌ଆପ୍ AI ଏଜେଣ୍ଟ ସକ୍ରିୟ (୨୪x୭)',
  },
  ml: {
    eyebrow: 'ആരംഭിക്കുക',
    title: 'എങ്ങനെയാണ് റിപ്പോർട്ട് ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?',
    pickCategory: 'അല്ലെങ്കിൽ വിഭാഗം തിരഞ്ഞെടുക്കുക',
    tabCall: '1930-ലേക്ക് വിളിക്കുക',
    tabWhatsApp: 'വാട്ട്‌സ്ആപ്പ്',
    tabWeb: 'വെബ് ഉപയോഗിക്കുക',
    callHeading: 'ദേശീയ സൈബർ കുറ്റകൃത്യ ഹെൽപ്പ് ലൈൻ',
    callDesc: 'നിങ്ങൾക്ക് സൗകര്യപ്രദമായ ഭാഷയിൽ സംസാരിക്കുക. ബാങ്ക് അക്കൗണ്ട് അടിയന്തിരമായി ഫ്രീസ് ചെയ്യാനുള്ള എളുപ്പവഴി.',
    waHeading: 'വാട്ട്‌സ്ആപ്പ് AI സൈബർ ഏജന്റ്',
    waDesc: 'ഞങ്ങളുടെ 24x7 വാട്ട്‌സ്ആപ്പ് AI ഏജന്റുമായി ചാറ്റ് ചെയ്യുക. വോയ്‌സ് നോട്ട് അല്ലെങ്കിൽ സ്ക്രീൻഷോട്ട് അയച്ച് തൽക്ഷണ സഹായം നേടുക.',
    waBtn: 'വാട്ട്‌സ്ആപ്പ് AI ഏജന്റുമായി സംസാരിക്കുക',
    waActive: 'വാട്ട്‌സ്ആപ്പ് AI ഏജന്റ് സജീവം (24x7)',
  },
  pa: {
    eyebrow: 'ਸ਼ੁਰੂ ਕਰੋ',
    title: 'ਤੁਸੀਂ ਰਿਪੋਰਟ ਕਿਵੇਂ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    pickCategory: 'ਜਾਂ ਸ਼੍ਰੇਣੀ ਚੁਣੋ',
    tabCall: '1930 \'ਤੇ ਕਾਲ ਕਰੋ',
    tabWhatsApp: 'ਵਟਸਐਪ',
    tabWeb: 'ਵੈੱਬ \'ਤੇ ਦਰਜ ਕਰੋ',
    callHeading: 'ਰਾਸ਼ਟਰੀ ਸਾਈਬਰ ਕ੍ਰਾਈਮ ਹੈਲਪਲਾਈਨ',
    callDesc: 'ਆਪਣੀ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਗੱਲ ਕਰੋ। ਐਮਰਜੈਂਸੀ ਬੈਂਕ ਖਾਤਾ ਫ੍ਰੀਜ਼ ਕਰਨ ਦਾ ਇਹ ਸਭ ਤੋਂ ਤੇਜ਼ ਤਰੀਕਾ ਹੈ।',
    waHeading: 'ਵਟਸਐਪ AI ਸਾਈਬਰ ਏਜੰਟ',
    waDesc: 'ਸਾਡੇ 24x7 ਵਟਸਐਪ AI ਏਜੰਟ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ। ਵੌਇਸ ਨੋਟ ਜਾਂ ਸਕ੍ਰੀਨਸ਼ੌਟ ਭੇਜ ਕੇ ਤੁਰੰਤ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।',
    waBtn: 'ਵਟਸਐਪ AI ਏਜੰਟ ਨਾਲ ਗੱਲ ਕਰੋ',
    waActive: 'ਵਟਸਐਪ AI ਏਜੰਟ ਸਰਗਰਮ (24x7)',
  },
}

export default function FileReportSection({ language }: FileReportSectionProps) {
  const router = useRouter()
  const hi = language === 'hi'
  const t = getTranslation(language)
  const meta = LANGUAGE_MAP[language] || LANGUAGE_MAP.en
  const loc = FILE_REPORT_I18N[language] || FILE_REPORT_I18N.en
  const { setScenarioId, setInputType, setSharedImage } = useTriage()

  const [inputText, setInputText] = useState('')
  const [channel, setChannel] = useState<Channel>('web')
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [liveState, setLiveState] = useState<{ isRunning: boolean; status: string; userPhone: string | null }>({
    isRunning: false,
    status: 'DISCONNECTED',
    userPhone: null,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  // Poll live WhatsApp state
  useEffect(() => {
    let mounted = true
    const checkLive = async () => {
      try {
        const res = await fetch('/api/whatsapp/live')
        if (res.ok && mounted) {
          const data = await res.json()
          setLiveState(data)
        }
      } catch {}
    }
    checkLive()
    const interval = setInterval(checkLive, 4000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const categories = [
    { title: t.fileReport.categories.financial.title, rawKey: 'Financial Fraud', desc: t.fileReport.categories.financial.desc, icon: <DollarSign className="w-5 h-5" />, iconBg: 'bg-primary-tint text-primary' },
    { title: t.fileReport.categories.womenChildren.title, rawKey: 'Women/Children Related Crime', desc: t.fileReport.categories.womenChildren.desc, icon: <User className="w-5 h-5" />, iconBg: 'bg-pink-50 text-pink-600' },
    { title: t.fileReport.categories.extortion.title, rawKey: 'Extortion & Blackmail', desc: t.fileReport.categories.extortion.desc, icon: <ShieldAlert className="w-5 h-5" />, iconBg: 'bg-red-50 text-red-600' },
    { title: t.fileReport.categories.identityTheft.title, rawKey: 'Identity Theft', desc: t.fileReport.categories.identityTheft.desc, icon: <Fingerprint className="w-5 h-5" />, iconBg: 'bg-purple-50 text-purple-600' },
    { title: t.fileReport.categories.ecommerce.title, rawKey: 'E-Commerce Scams', desc: t.fileReport.categories.ecommerce.desc, icon: <ShoppingCart className="w-5 h-5" />, iconBg: 'bg-emerald-50 text-emerald-600' },
    { title: t.fileReport.categories.other.title, rawKey: 'Other Cyber Crime', desc: t.fileReport.categories.other.desc, icon: <Briefcase className="w-5 h-5" />, iconBg: 'bg-zinc-100 text-zinc-600' },
  ]

  const handleAutoAnalyze = () => {
    if (!inputText.trim()) return
    setScenarioId(null)
    setInputType('text')
    router.push(`/intake?category=auto&text=${encodeURIComponent(inputText)}&autoStart=true`)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSharedImage(file)
    setScenarioId(null)
    setInputType('screenshot')
    const q = inputText.trim() ? `&text=${encodeURIComponent(inputText)}` : ''
    router.push(`/intake?category=auto${q}`)
  }

  const handleCategory = (title: string) => {
    setScenarioId(null)
    setInputType('text')
    router.push(`/intake?category=${encodeURIComponent(title)}`)
  }

  const cleanPhone = (liveState.userPhone || '+916303807967').replace(/\D/g, '')

  const handleVisitAgent = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      hi
        ? 'नमस्ते समर्थन, मुझे एक साइबर धोखाधड़ी की रिपोर्ट करनी है।'
        : 'Hi Samarthan, I want to report a cybercrime incident.'
    )}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const tabs: { id: Channel; label: string; icon: React.ReactNode }[] = [
    { id: 'call', label: loc.tabCall, icon: <Phone className="w-4 h-4" /> },
    { id: 'whatsapp', label: loc.tabWhatsApp, icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'web', label: loc.tabWeb, icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <section id="file-report" className="py-12 sm:py-20 md:py-24 bg-surface border-t border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 sm:mb-3">
            {loc.eyebrow}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight indic-headline">
            {loc.title}
          </h2>
        </div>

        {/* Channel tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setChannel(t.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-[44px] cursor-pointer ${
                channel === t.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Channel body */}
        {channel === 'call' && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 text-center">
            <p className="text-xs sm:text-sm text-zinc-500 mb-2">{loc.callHeading}</p>
            <a href="tel:1930" className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">1930</a>
            <p className="mt-3 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              {loc.callDesc}
            </p>
          </div>
        )}

        {channel === 'whatsapp' && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 text-center max-w-xl mx-auto shadow-xs">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">
              {loc.waHeading}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 mb-6 leading-relaxed">
              {loc.waDesc}
            </p>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsChoiceModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fa851] active:scale-[0.99] text-white rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-lg cursor-pointer min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{loc.waBtn}</span>
                <ExternalLink className="w-4 h-4 opacity-80 rtl:rotate-180" />
              </button>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs font-mono text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{loc.waActive}</span>
            </div>
          </div>
        )}

        {channel === 'web' && (
          <>
            <input type="file" ref={fileRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf" />
            <div className="rounded-xl border border-zinc-300 bg-white shadow-xs overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <textarea
                className="w-full p-3.5 sm:p-4 min-h-[110px] sm:min-h-[120px] outline-none resize-none text-zinc-800 placeholder:text-zinc-400 text-base sm:text-sm"
                placeholder={t.fileReport.placeholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAutoAnalyze() }
                }}
              />
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border-t border-zinc-200/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-md transition-colors shadow-xs min-h-[40px] cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-zinc-500" />
                    <span>{t.fileReport.addEvidence}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScenarioId(null)
                      setInputType('voice')
                      const q = inputText.trim() ? `&text=${encodeURIComponent(inputText)}` : ''
                      router.push(`/intake?category=auto&mode=voice${q}`)
                    }}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-md transition-colors shadow-xs min-h-[40px] cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-primary" />
                    <span>{t.fileReport.voiceNote}</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAnalyze}
                  disabled={!inputText.trim()}
                  className="flex items-center justify-center p-2.5 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm min-h-[40px] min-w-[40px] cursor-pointer"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="mt-6 sm:mt-8 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {loc.pickCategory}
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {categories.map((cat) => (
                <button
                  key={cat.rawKey}
                  onClick={() => handleCategory(cat.rawKey)}
                  className="flex flex-col justify-between items-start p-5 rounded-lg bg-white border border-zinc-200/90 hover:border-primary/50 hover:shadow-xs transition-all text-start cursor-pointer h-full"
                >
                  <div className="flex-1 w-full">
                    <div className={`p-2.5 rounded-md mb-3 inline-block ${cat.iconBg}`}>{cat.icon}</div>
                    <h3 className="text-sm font-bold text-foreground mb-1 leading-snug">{cat.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{cat.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <WhatsAppChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        language={language}
        prefilledText={inputText}
      />

      <WhatsAppSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        language={language}
      />
    </section>
  )
}
