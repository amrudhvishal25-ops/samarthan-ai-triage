'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  MessageCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { SupportedLanguage } from '@/lib/i18n/languages'

interface WhatsAppChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSimulator: () => void
  language?: SupportedLanguage
  prefilledText?: string
}

export default function WhatsAppChoiceModal({
  isOpen,
  onClose,
  onOpenSimulator,
  language = 'en',
  prefilledText,
}: WhatsAppChoiceModalProps) {
  const isHi = language === 'hi'
  const [botOnline, setBotOnline] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    fetch('/api/whatsapp/live')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setBotOnline(data.status === 'CONNECTED')
        }
      })
      .catch(() => {
        if (isMounted) setBotOnline(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

const WA_MODAL_I18N: Record<SupportedLanguage, {
  title: string
  subtitle: string
  defaultText: string
  simTitle: string
  recommended: string
  simDesc: string
  simLaunch: string
  realTitle: string
  realTag: string
  realDesc: string
  evalHeadsUp: string
  evalNotice: string
  botOnline: string
  botStandby: string
  botChecking: string
  openWa: string
  footerAi: string
  close: string
}> = {
  en: {
    title: 'Samarthan WhatsApp AI Triage',
    subtitle: 'Build What Moves India Hackathon Prototype',
    defaultText: 'Hi Samarthan, I want to report a cybercrime incident.',
    simTitle: 'In-App WhatsApp Simulator',
    recommended: 'Recommended',
    simDesc: 'Interactive WhatsApp mockup running inside this app. Zero phone needed — test voice notes, screenshot triage, and live complaint generation on the identical GPT-4o engine.',
    simLaunch: 'Launch In-App Simulator',
    realTitle: 'Open Real WhatsApp App',
    realTag: 'WhatsApp AI Agent',
    realDesc: 'Chat directly in your WhatsApp mobile or web app with our AI agent.',
    evalHeadsUp: '💡 Hackathon Evaluator Heads-up:',
    evalNotice: 'The real WhatsApp bot runs via our live host daemon bridge. If the host machine is closed or sleeping, the bot socket might pause. Use the In-App Simulator above for the 100% identical, guaranteed live experience!',
    botOnline: 'Host Bridge: Connected',
    botStandby: 'Host Bridge: Standby / Sleep',
    botChecking: 'Checking bridge...',
    openWa: 'Open WhatsApp',
    footerAi: 'Both options use the identical Samarthan AI Engine',
    close: 'Close',
  },
  hi: {
    title: 'व्हाट्सएप AI ट्रायज एजेंट',
    subtitle: 'Build What Moves India हैकथॉन प्रोटोटाइप सिमुलेशन',
    defaultText: 'नमस्ते समर्थन, मुझे एक साइबर अपराध घटना की रिपोर्ट करनी है।',
    simTitle: 'ब्राउज़र में व्हाट्सएप सिम्युलेटर खोलें',
    recommended: 'अनुशंसित',
    simDesc: 'बिना फोन के सीधे इसी ऐप में पूरी तरह से कार्यात्मक व्हाट्सएप इंटरफेस। वॉइस नोट, टेक्स्ट और स्क्रीनशॉट सपोर्ट के साथ बिल्कुल असली बॉट की तरह।',
    simLaunch: 'सिम्युलेटर शुरू करें',
    realTitle: 'असली व्हाट्सएप ऐप में खोलें',
    realTag: 'व्हाट्सएप AI एजेंट',
    realDesc: 'अपने फोन या व्हाट्सएप डेस्कटॉप ऐप पर सीधे हमारे AI एजेंट से चैट करें।',
    evalHeadsUp: '💡 हैकाथॉन मूल्यांकनकर्ताओं के लिए सूचना:',
    evalNotice: 'असली व्हाट्सएप बॉट हमारे होस्ट कंप्यूटर के डेमन ब्रिज पर निर्भर करता है। यदि कंप्यूटर स्टैंडबाय में है, तो तुरंत और गारंटीड अनुभव के लिए ऊपर दिए गए "व्हाट्सएप सिम्युलेटर" का उपयोग करें!',
    botOnline: 'होस्ट बॉट: ऑनलाइन',
    botStandby: 'होस्ट बॉट: स्टैंडबाय',
    botChecking: 'स्थिति जांची जा रही है...',
    openWa: 'व्हाट्सएप खोलें',
    footerAi: 'दोनों विकल्प एक ही AI इंजन से संचालित हैं',
    close: 'बंद करें',
  },
  bn: {
    title: 'হোয়াটসঅ্যাপ AI ট্রায়াজ এজেন্ট',
    subtitle: 'Build What Moves India হ্যাকাথন প্রোটোটাইপ সিমুলেশন',
    defaultText: 'নমস্কার সমর্থন, আমি একটি সাইবার অপরাধের ঘটনা রিপোর্ট করতে চাই।',
    simTitle: 'ইন-অ্যাপ হোয়াটসঅ্যাপ সিমুলেটর খুলুন',
    recommended: 'সুপারিশকৃত',
    simDesc: 'ফোনের প্রয়োজন ছাড়াই সরাসরি এই অ্যাপে সম্পূর্ণ কার্যকরী হোয়াটসঅ্যাপ ইন্টারফেস। ভয়েস নোট, স্ক্রিনশট এবং লাইভ এফআইআর জেনারেশন সহ হুবহু আসল বট।',
    simLaunch: 'সিমুলেটর চালু করুন',
    realTitle: 'আসল হোয়াটসঅ্যাপ অ্যাপে খুলুন',
    realTag: 'হোয়াটসঅ্যাপ AI এজেন্ট',
    realDesc: 'আপনার ফোন বা ডেস্কটপ হোয়াটসঅ্যাপে সরাসরি আমাদের এআই এজেন্টের সাথে চ্যাট করুন।',
    evalHeadsUp: '💡 হ্যাকাথন মূল্যায়কদের জন্য বিজ্ঞপ্তি:',
    evalNotice: 'আসল হোয়াটসঅ্যাপ বটটি লাইভ হোস্ট মেশিনের সাথে সংযুক্ত। নিশ্চিত এবং দ্রুত পরীক্ষার জন্য উপরের "ইন-অ্যাপ সিমুলেটর" ব্যবহার করুন!',
    botOnline: 'হোस्ट বট: অনলাইন',
    botStandby: 'হোস্ট বট: স্ট্যান্ডবাই',
    botChecking: 'যাচাই করা হচ্ছে...',
    openWa: 'হোয়াটসঅ্যাপ খুলুন',
    footerAi: 'উভয় বিকল্পই একই AI ইঞ্জিন দ্বারা পরিচালিত',
    close: 'বন্ধ করুন',
  },
  mr: {
    title: 'व्हॉट्सअॅप AI ट्रायज एजंट',
    subtitle: 'Build What Moves India हॅकाथॉन प्रोटोटाइप',
    defaultText: 'नमस्कार समर्थन, मला सायबर गुन्ह्याची तक्रार करायची आहे.',
    simTitle: 'अॅपमधील व्हॉट्सअॅप सिम्युलेटर उघडा',
    recommended: 'शिफारस केलेले',
    simDesc: 'फोनची गरज नसताना थेट या अॅपमध्ये कार्यरत व्हॉट्सअॅप इंटरफेस. व्हॉईस नोट्स, स्क्रीनशॉट आणि थेट तक्रार नोंदणीसह अगदी खऱ्या बॉटसारखा.',
    simLaunch: 'सिम्युलेटर सुरू करा',
    realTitle: 'खऱ्या व्हॉट्सअॅप अॅपमध्ये उघडा',
    realTag: 'व्हॉट्सअॅप AI एजंट',
    realDesc: 'तुमच्या मोबाईलवर थेट आमच्या AI एजंटशी गप्पा मारा.',
    evalHeadsUp: '💡 मूल्यांकनकर्त्यांसाठी सूचना:',
    evalNotice: 'खात्रीशीर आणि त्वरित अनुभवासाठी वरील इन-अॅप सिम्युलेटर वापरा!',
    botOnline: 'होस्ट बॉट: कनेक्टेड',
    botStandby: 'होस्ट बॉट: स्टँडबाय',
    botChecking: 'तपासत आहे...',
    openWa: 'व्हॉट्सअॅप उघडा',
    footerAi: 'दोन्ही पर्याय एकाच AI इंजिनवर चालतात',
    close: 'बंद करा',
  },
  te: {
    title: 'వాట్సాప్ AI ట్రయాజ్ ఏజెంట్',
    subtitle: 'Build What Moves India హ్యాకథాన్ ప్రోటోటైప్',
    defaultText: 'నమస్కారం సమర్థన్, నేను సైబర్ క్రైమ్ సంఘటనను నివేదించాలనుకుంటున్నాను.',
    simTitle: 'యాప్‌లో వాట్సాప్ సిమ్యులేటర్ ప్రారంభించండి',
    recommended: 'సిఫార్సు చేయబడింది',
    simDesc: 'ఫోన్ అవసరం లేకుండా నేరుగా ఈ యాప్‌లోనే వాట్సాప్ ఇంటర్‌ఫేస్. వాయిస్ నోట్స్, స్క్రీన్‌షాట్ ట్రయాజ్ మరియు లైవ్ ఫిర్యాదు డ్రాఫ్టింగ్‌తో పూర్తి అనుభవం.',
    simLaunch: 'సిమ్యులేటర్ ప్రారంభించండి',
    realTitle: 'నిజమైన వాట్సాప్ యాప్‌లో తెరవండి',
    realTag: 'వాట్సాప్ AI ఏజెంట్',
    realDesc: 'మీ ఫోన్ వాట్సాప్‌లో మా AI ఏజెంట్‌తో నేరుగా చాట్ చేయండి.',
    evalHeadsUp: '💡 మూల్యాంకనదారులకు సూచన:',
    evalNotice: 'ఖచ్చితమైన మరియు వేగవంతమైన అనుభవం కోసం పైన ఉన్న ఇన్-యాప్ సిమ్యులేటర్‌ను ఉపయోగించండి!',
    botOnline: 'హోస్ట్ బాట్: కనెక్ట్ చేయబడింది',
    botStandby: 'హోస్ట్ బాట్: స్టాండ్‌బై',
    botChecking: 'తనిఖీ చేస్తోంది...',
    openWa: 'వాట్సాప్ తెరవండి',
    footerAi: 'రెండు ఎంపికలు ఒకే AI ఇంజిన్‌ను ఉపయోగిస్తాయి',
    close: 'మూసివేయి',
  },
  ta: {
    title: 'வாட்ஸ்அப் AI ட்ரையாஜ் முகவர்',
    subtitle: 'Build What Moves India ஹேக்கத்தான் மாதிரி வடிவம்',
    defaultText: 'வணக்கம் சமர்தன், நான் ஒரு சைபர் கிரைம் சம்பவத்தை புகார் செய்ய விரும்புகிறேன்.',
    simTitle: 'செயலியில் வாட்ஸ்அப் சிமுலேட்டரைத் திறக்கவும்',
    recommended: 'பரிந்துரைக்கப்படுகிறது',
    simDesc: 'தொலைபேசி இல்லாமல் நேரடியாக இந்த செயலியில் முழுமையான வாட்ஸ்அப் இடைமுகம். குரல் குறிப்புகள், ஸ்கிரீன்ஷாட் பகுப்பாய்வு ஆகியவற்றுடன் நிஜ பாட் போன்றே செயல்படும்.',
    simLaunch: 'சிமுலேட்டரைத் தொடங்கவும்',
    realTitle: 'உண்மையான வாட்ஸ்அப் செயலியில் திறக்கவும்',
    realTag: 'வாட்ஸ்அப் AI முகவர்',
    realDesc: 'உங்கள் தொலைபேசியில் எங்கள் AI முகவருடன் நேரடியாக அரட்டையடிக்கவும்.',
    evalHeadsUp: '💡 நடுவர்களுக்கான குறிப்பு:',
    evalNotice: 'உடனடி மற்றும் நம்பகமான பயன்பாட்டிற்கு மேலே உள்ள இன்-ஆப் சிமுலேட்டரைப் பயன்படுத்தவும்!',
    botOnline: 'பாட்: ஆன்லைன்',
    botStandby: 'பாட்: காத்திருப்பு',
    botChecking: 'சரிபார்க்கிறது...',
    openWa: 'வாட்ஸ்அப்பைத் திறக்கவும்',
    footerAi: 'இரண்டு விருப்பங்களும் ஒரே AI இயந்திரத்தைப் பயன்படுத்துகின்றன',
    close: 'மூடு',
  },
  gu: {
    title: 'વ્હોટ્સએપ AI ટ્રાયાજ એજન્ટ',
    subtitle: 'Build What Moves India હેકાથોન પ્રોટોટાઇપ',
    defaultText: 'નમસ્તે સમર્થન, મારે સાયબર ક્રાઈમની ફરિયાદ નોંધાવવી છે.',
    simTitle: 'ઇન-એપ વ્હોટ્સએપ સિમ્યુલેટર ખોલો',
    recommended: 'ભલામણ કરેલ',
    simDesc: 'ફોનની જરૂર વગર સીધા આ જ એપમાં સંપૂર્ણ વ્હોટ્સએપ ઇન્ટરફેસ. વૉઇસ નોટ્સ, સ્ક્રીનશૉટ્સ અને લાઇવ ફરિયાદ નિર્માણ સાથે બિલકુલ અસલી બૉટ જેવો અનુભવ.',
    simLaunch: 'સિમ્યુલેટર શરૂ કરો',
    realTitle: 'સાચા વ્હોટ્સએપ એપમાં ખોલો',
    realTag: 'વ્હોટ્સએપ AI એજન્ટ',
    realDesc: 'તમારા ફોનમાં સીધા અમારા AI એજન્ટ સાથે વાત કરો.',
    evalHeadsUp: '💡 મૂલ્યાંકનકારો માટે સૂચના:',
    evalNotice: 'તાત્કાલિક અને ખાતરીપૂર્વકના અનુભવ માટે ઉપર આપેલા ઇન-એપ સિમ્યુલેટરનો ઉપયોગ કરો!',
    botOnline: 'હોસ્ટ બૉટ: ઓનલાઇન',
    botStandby: 'હોસ્ટ બૉટ: સ્ટેન્ડબાય',
    botChecking: 'ચકાસી રહ્યું છે...',
    openWa: 'વ્હોટ્સએપ ખોલો',
    footerAi: 'બંને વિકલ્પો એક જ AI એન્જિનનો ઉપયોગ કરે છે',
    close: 'બંધ કરો',
  },
  ur: {
    title: 'واٹس ایپ AI ٹرائیژ ایجنٹ',
    subtitle: 'Build What Moves India ہیکاتھن پروٹوٹائپ',
    defaultText: 'ہیلو سمرتھن، میں ایک سائبر کرائم واقعے کی اطلاع دینا چاہتا ہوں۔',
    simTitle: 'ان-ایپ واٹس ایپ سمیلیٹر کھولیں',
    recommended: 'تجویز کردہ',
    simDesc: 'بغیر فون کے براہ راست اسی ایپ میں فعال واٹس ایپ انٹرفیس۔ وائس نوٹس، اسکرین شاٹس اور لائیو ایف آئی آر مسودہ سازی کی مکمل صلاحیت۔',
    simLaunch: 'سمیلیٹر شروع کریں',
    realTitle: 'اصلی واٹس ایپ ایپ میں کھولیں',
    realTag: 'واٹس ایپ AI ایجنٹ',
    realDesc: 'اپنے فون پر براہ راست ہمارے AI ایجنٹ سے بات چیت کریں۔',
    evalHeadsUp: '💡 ججز اور مبصرین کے لیے اطلاع:',
    evalNotice: 'فوری اور یقینی تجربے کے لیے اوپر دیا گیا ان-ایپ سمیلیٹر استعمال کریں!',
    botOnline: 'ہوسٹ بوٹ: آن لائن',
    botStandby: 'ہوسٹ بوٹ: اسٹینڈ بائی',
    botChecking: 'جانچ جاری ہے...',
    openWa: 'واٹس ایپ کھولیں',
    footerAi: 'دونوں آپشنز ایک ہی AI انجن پر کام کرتے ہیں',
    close: 'بند کریں',
  },
  kn: {
    title: 'ವಾಟ್ಸಾಪ್ AI ಟ್ರಯಾಜ್ ಏಜೆಂಟ್',
    subtitle: 'Build What Moves India ಹ್ಯಾಕಥಾನ್ ಮೂಲಮಾದರಿ',
    defaultText: 'ನಮಸ್ಕಾರ ಸಮರ್ಥನ್, ನಾನು ಸೈಬರ್ ಅಪರಾಧ ಘಟನೆಯನ್ನು ವರದಿ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.',
    simTitle: 'ಇನ್-ಆಪ್ ವಾಟ್ಸಾಪ್ ಸಿಮ್ಯುಲೇಟರ್ ತೆರೆಯಿರಿ',
    recommended: 'ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
    simDesc: 'ಫೋನ್ ಅಗತ್ಯವಿಲ್ಲದೇ ನೇರವಾಗಿ ಈ ಆಪ್‌ನಲ್ಲಿ ಸಂಪೂರ್ಣ ವಾಟ್ಸಾಪ್ ಇಂಟರ್ಫೇಸ್. ಧ್ವನಿ ಟಿಪ್ಪಣಿಗಳು, ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಮತ್ತು ಲೈವ್ ದೂರು ರಚನೆಯೊಂದಿಗೆ ಅಸಲಿ ಬಾಟ್‌ನಂತೆಯೇ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
    simLaunch: 'ಸಿಮ್ಯುಲೇಟರ್ ಪ್ರಾರಂಭಿಸಿ',
    realTitle: 'ನೈಜ ವಾಟ್ಸಾಪ್ ಆಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ',
    realTag: 'ವಾಟ್ಸಾಪ್ AI ಏಜೆಂಟ್',
    realDesc: 'ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ನಮ್ಮ AI ಏಜೆಂಟ್ ಜೊತೆ ಚಾಟ್ ಮಾಡಿ.',
    evalHeadsUp: '💡 ಮೌಲ್ಯಮಾಪಕರಿಗೆ ಸೂಚನೆ:',
    evalNotice: 'ಖಚಿತವಾದ ಮತ್ತು ತ್ವರಿತ ಅನುಭವಕ್ಕಾಗಿ ಮೇಲಿನ ಇನ್-ಆಪ್ ಸಿಮ್ಯುಲೇಟರ್ ಬಳಸಿ!',
    botOnline: 'ಹೋಸ್ಟ್ ಬಾಟ್: ಸಂಪರ್ಕದಲ್ಲಿದೆ',
    botStandby: 'ಹೋಸ್ಟ್ ಬಾಟ್: ಸ್ಟ್ಯಾಂಡ್‌ಬೈ',
    botChecking: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    openWa: 'ವಾಟ್ಸಾಪ್ ತೆರೆಯಿರಿ',
    footerAi: 'ಎರಡೂ ಆಯ್ಕೆಗಳು ಒಂದೇ AI ಎಂಜಿನ್ ಅನ್ನು ಬಳಸುತ್ತವೆ',
    close: 'ಮುಚ್ಚಿ',
  },
  or: {
    title: 'ହ୍ୱାଟ୍ସଆପ୍ AI ଟ୍ରାଇଜ୍ ଏଜେଣ୍ଟ',
    subtitle: 'Build What Moves India ହ୍ୟାକାଥନ୍ ପ୍ରୋଟୋଟାଇପ୍',
    defaultText: 'ନମସ୍କାର ସମର୍ଥନ, ମୁଁ ଏକ ସାଇବର ଅପରାଧ ଘଟଣା ରିପୋର୍ଟ କରିବାକୁ ଚାହୁଁଛି।',
    simTitle: 'ଇନ୍-ଆପ୍ ହ୍ୱାଟ୍ସଆପ୍ ସିମୁଲେଟର୍ ଖୋଲନ୍ତୁ',
    recommended: 'ସୁପାରିଶ କରାଯାଇଛି',
    simDesc: 'ଫୋନ୍ ବିନା ସିଧାସଳଖ ଏହି ଆପ୍ ମଧ୍ୟରେ କାର୍ଯ୍ୟକ୍ଷମ ହ୍ୱାଟ୍ସଆପ୍ ଇଣ୍ଟରଫେସ୍। ଭଏସ୍ ନୋଟ୍, ସ୍କ୍ରିନଶଟ୍ ଏବଂ ଲାଇଭ୍ ଅଭିଯୋଗ ଡ୍ରାଫ୍ଟ ସହିତ ପୂର୍ଣ୍ଣ ଅନୁଭବ।',
    simLaunch: 'ସିମୁଲେଟର୍ ଆରମ୍ଭ କରନ୍ତୁ',
    realTitle: 'ପ୍ରକୃତ ହ୍ୱାଟ୍ସଆପ୍ ଆପ୍‌ରେ ଖୋଲନ୍ତୁ',
    realTag: 'ହ୍ୱାଟ୍ସଆପ୍ AI ଏଜେଣ୍ଟ',
    realDesc: 'ଆପଣଙ୍କ ଫୋନ୍‌ରେ ଆମ AI ଏଜେଣ୍ଟ ସହିତ ସିଧାସଳଖ ଚାଟ୍ କରନ୍ତୁ।',
    evalHeadsUp: '💡 ମୂଲ୍ୟାଙ୍କନକାରୀଙ୍କ ପାଇଁ ସୂଚନା:',
    evalNotice: 'ତୁରନ୍ତ ଏବଂ ନିଶ୍ଚିତ ଅନୁଭୂତି ପାଇଁ ଉପରୋକ୍ତ ଇନ୍-ଆପ୍ ସିମୁଲେଟର୍ ବ୍ୟବହାର କରନ୍ତୁ!',
    botOnline: 'ହୋଷ୍ଟ ବଟ୍: ଅନଲାଇନ୍',
    botStandby: 'ହୋଷ୍ଟ ବଟ୍: ଷ୍ଟାଣ୍ଡବାଏ',
    botChecking: 'ଯାଞ୍ଚ ହେଉଛି...',
    openWa: 'ହ୍ୱାଟ୍ସଆପ୍ ଖୋଲନ୍ତୁ',
    footerAi: 'ଉଭୟ ବିକଳ୍ପ ସମାନ AI ଇଞ୍ଜିନ୍ ବ୍ୟବହାର କରେ',
    close: 'ବନ୍ଦ କରନ୍ତୁ',
  },
  ml: {
    title: 'വാട്ട്‌സ്ആപ്പ് AI ട്രയേജ് ഏജന്റ്',
    subtitle: 'Build What Moves India ഹാക്കത്തോൺ പ്രോട്ടോടൈപ്പ്',
    defaultText: 'നമസ്കാരം സമർത്ഥൻ, എനിക്ക് ഒരു സൈബർ കുറ്റകൃത്യ സംഭവം റിപ്പോർട്ട് ചെയ്യണം.',
    simTitle: 'ഇൻ-ആപ്പ് വാട്ട്‌സ്ആപ്പ് സിമുലേറ്റർ തുറക്കുക',
    recommended: 'ശുപാർശ ചെയ്യുന്നത്',
    simDesc: 'ഫോൺ ആവശ്യമില്ലാതെ തന്നെ ഈ ആപ്പിൽ പൂർണ്ണമായി പ്രവർത്തിക്കുന്ന വാട്ട്‌സ്ആപ്പ് ഇന്റർഫേസ്. വോയ്‌സ് നോട്ടുകൾ, സ്‌ക്രീൻഷോട്ടുകൾ, തത്സമയ പരാതി തയ്യാറാക്കൽ എന്നിവ ലഭ്യമാണ്.',
    simLaunch: 'സിമുലേറ്റർ ആരംഭിക്കുക',
    realTitle: 'യഥാർത്ഥ വാട്ട്‌സ്ആപ്പ് ആപ്പിൽ തുറക്കുക',
    realTag: 'വാട്ട്‌സ്ആപ്പ് AI ഏജന്റ്',
    realDesc: 'നിങ്ങളുടെ ഫോണിൽ ഞങ്ങളുടെ AI ഏജന്റുമായി നേരിട്ട് ചാറ്റ് ചെയ്യുക.',
    evalHeadsUp: '💡 മൂല്യനിർണ്ണയക്കാർക്കുള്ള അറിയിപ്പ്:',
    evalNotice: 'ഉറപ്പുള്ളതും വേഗത്തിലുള്ളതുമായ അനുഭവത്തിനായി മുകളിലുള്ള ഇൻ-ആപ്പ് സിമുലേറ്റർ ഉപയോഗിക്കുക!',
    botOnline: 'ഹോസ്റ്റ് ബോട്ട്: ഓൺലൈൻ',
    botStandby: 'ഹോസ്റ്റ് ബോട്ട്: സ്റ്റാൻഡ്‌ബൈ',
    botChecking: 'പരിശോധിക്കുന്നു...',
    openWa: 'വാട്ട്‌സ്ആപ്പ് തുറക്കുക',
    footerAi: 'രണ്ട് ഓപ്ഷനുകളും ഒരേ AI എഞ്ചിനാണ് ഉപയോഗിക്കുന്നത്',
    close: 'അടയ്ക്കുക',
  },
  pa: {
    title: 'ਵਟਸਐਪ AI ਟ੍ਰਾਇਜ ਏਜੰਟ',
    subtitle: 'Build What Moves India ਹੈਕਾਥੌਨ ਪ੍ਰੋਟੋਟਾਈਪ',
    defaultText: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਸਮਰਥਨ, ਮੈਂ ਇੱਕ ਸਾਈਬਰ ਕ੍ਰਾਈਮ ਘਟਨਾ ਦੀ ਰਿਪੋਰਟ ਕਰਨਾ ਚਾਹੁੰਦਾ ਹਾਂ।',
    simTitle: 'ਇਨ-ਐਪ ਵਟਸਐਪ ਸਿਮੂਲੇਟਰ ਖੋਲ੍ਹੋ',
    recommended: 'ਸਿਫ਼ਾਰਿਸ਼ ਕੀਤੀ ਗਈ',
    simDesc: 'ਬਿਨਾਂ ਫ਼ੋਨ ਦੇ ਸਿੱਧੇ ਇਸ ਐਪ ਵਿੱਚ ਪੂਰੀ ਤਰ੍ਹਾਂ ਕੰਮ ਕਰਨ ਵਾਲਾ ਵਟਸਐਪ ਇੰਟਰਫੇਸ। ਵੌਇਸ ਨੋਟਸ, ਸਕ੍ਰੀਨਸ਼ੌਟਸ ਅਤੇ ਲਾਈਵ ਸ਼ਿਕਾਇਤ ਡਰਾਫਟਿੰਗ ਦੇ ਨਾਲ ਅਸਲ ਬੋਟ ਵਾਂਗ ਕੰਮ ਕਰਦਾ ਹੈ।',
    simLaunch: 'ਸਿਮੂਲੇਟਰ ਸ਼ੁਰੂ ਕਰੋ',
    realTitle: 'ਅਸਲ ਵਟਸਐਪ ਐਪ ਵਿੱਚ ਖੋਲ੍ਹੋ',
    realTag: 'ਵਟਸਐਪ AI ਏਜੰਟ',
    realDesc: 'ਆਪਣੇ ਫ਼ੋਨ ਵਿੱਚ ਸਿੱਧਾ ਸਾਡੇ AI ਏਜੰਟ ਨਾਲ ਗੱਲ ਕਰੋ।',
    evalHeadsUp: '💡 ਮੁਲਾਂਕਣਕਰਤਾਵਾਂ ਲਈ ਸੂਚਨਾ:',
    evalNotice: 'ਤੁਰੰਤ ਅਤੇ ਗਾਰੰਟੀਸ਼ੁਦਾ ਅਨੁਭਵ ਲਈ ਉੱਪਰ ਦਿੱਤੇ ਇਨ-ਐਪ ਸਿਮੂਲੇਟਰ ਦੀ ਵਰਤੋਂ ਕਰੋ!',
    botOnline: 'ਹੋਸਟ ਬੋਟ: ਆਨਲਾਈਨ',
    botStandby: 'ਹੋਸਟ ਬੋਟ: ਸਟੈਂਡਬਾਏ',
    botChecking: 'ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    openWa: 'ਵਟਸਐਪ ਖੋਲ੍ਹੋ',
    footerAi: 'ਦੋਵੇਂ ਵਿਕਲਪ ਇੱਕੋ AI ਇੰਜਣ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹਨ',
    close: 'ਬੰਦ ਕਰੋ',
  },
}

  if (!isOpen || !mounted) return null

  const t = WA_MODAL_I18N[language] || WA_MODAL_I18N.en
  const defaultText = t.defaultText

  const textToForward = prefilledText?.trim() || defaultText
  const realWhatsAppUrl = `https://wa.me/916303807967?text=${encodeURIComponent(textToForward)}`

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#075E54] dark:bg-[#064e46] text-white p-4 sm:p-6 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-bold indic-headline">
                  {t.title}
                </h3>
                <span className="bg-emerald-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  24x7 AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5 sm:mt-1 leading-relaxed indic-body">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Content */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {/* Option 1: In-App WhatsApp Web Simulator */}
          <div
            onClick={() => {
              onClose()
              onOpenSimulator()
            }}
            className="group relative p-4 sm:p-5 rounded-xl border-2 border-emerald-500/70 dark:border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors indic-headline">
                      {t.simTitle}
                    </span>
                    <span className="bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {t.recommended}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed indic-body">
                    {t.simDesc}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <span className="indic-body">{t.simLaunch}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Real WhatsApp Bot */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 indic-headline">
                      {t.realTitle}
                    </span>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md indic-body">
                      {t.realTag}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed indic-body">
                    {t.realDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Heads-up / Offline notice callout */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5 indic-headline">
                  {t.evalHeadsUp}
                </span>
                <span className="indic-body">
                  {t.evalNotice}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    botOnline === true
                      ? 'bg-emerald-500 animate-pulse'
                      : botOnline === false
                      ? 'bg-amber-500'
                      : 'bg-zinc-400'
                  }`}
                />
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 indic-body">
                  {botOnline === true
                    ? t.botOnline
                    : botOnline === false
                    ? t.botStandby
                    : t.botChecking}
                </span>
              </div>

              <a
                href={realWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span className="indic-body">{t.openWa}</span>
                <ExternalLink className="w-3.5 h-3.5 rtl:rotate-90" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-5 sm:px-6 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 indic-body">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {t.footerAi}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline font-medium cursor-pointer indic-body"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
