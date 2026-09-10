'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SupportedLanguage } from '@/lib/i18n/languages'

interface FooterSectionProps {
  language: SupportedLanguage
}

const FOOTER_I18N: Record<SupportedLanguage, {
  ctaHeadline: string
  ctaDesc: string
  ctaBtn: string
  tagline: string
  linksTitle: string
  howItWorks: string
  whySamarthan: string
  getStarted: string
  emergencyTitle: string
  helpline1930: string
  police100: string
  aboutTitle: string
  hackathonTag: string
  digilockerVerified: string
  poweredBy: string
  disclaimer: string
}> = {
  en: {
    ctaHeadline: 'Every minute matters in the golden hour.',
    ctaDesc: 'The sooner a fraud is reported, the higher the chance of getting the money back. Start now.',
    ctaBtn: 'Start a report',
    tagline: 'AI cybercrime triage. From panic to FIR.',
    linksTitle: 'Links',
    howItWorks: 'How it works',
    whySamarthan: 'Why Samarthan',
    getStarted: 'Get started',
    emergencyTitle: 'Emergency',
    helpline1930: 'Cyber Helpline: 1930',
    police100: 'Police: 100',
    aboutTitle: 'About',
    hackathonTag: 'Built for Build What Moves India Hackathon',
    digilockerVerified: 'DigiLocker verified identity',
    poweredBy: 'Powered by GPT-4o',
    disclaimer: 'Disclaimer: This platform is an AI simulation & prototype developed for the Build What Moves India Hackathon. It is NOT an official government website (the official government portal is cybercrime.gov.in). For real emergency cybercrime assistance, immediately dial 1930.',
  },
  hi: {
    ctaHeadline: 'गोल्डन ऑवर में हर मिनट मायने रखता है।',
    ctaDesc: 'धोखाधड़ी की रिपोर्ट जितनी जल्दी होगी, पैसा वापस मिलने की संभावना उतनी ज़्यादा। अभी शुरू करें।',
    ctaBtn: 'रिपोर्ट शुरू करें',
    tagline: 'AI साइबर अपराध ट्रायज। घबराहट से FIR तक।',
    linksTitle: 'लिंक',
    howItWorks: 'यह कैसे काम करता है',
    whySamarthan: 'समर्थन क्यों?',
    getStarted: 'शुरू करें',
    emergencyTitle: 'आपातकाल',
    helpline1930: 'साइबर हेल्पलाइन: 1930',
    police100: 'पुलिस: 100',
    aboutTitle: 'के बारे में',
    hackathonTag: 'Build What Moves India हैकथॉन के लिए बनाया गया',
    digilockerVerified: 'DigiLocker सत्यापित पहचान',
    poweredBy: 'GPT-4o द्वारा संचालित',
    disclaimer: 'अस्वीकरण: यह वेबसाइट Build What Moves India हैकथॉन के लिए बनाया गया एक AI सिमुलेशन और प्रोटोटाइप है। यह कोई आधिकारिक सरकारी वेबसाइट नहीं है (आधिकारिक राष्ट्रीय साइबर अपराध पोर्टल cybercrime.gov.in है)। वास्तविक आपातकाल में तत्काल 1930 पर कॉल करें।',
  },
  bn: {
    ctaHeadline: 'গোল্ডেন আওয়ারের প্রতিটি মিনিট মূল্যবান।',
    ctaDesc: 'যত দ্রুত প্রতারণার অভিযোগ নথিভুক্ত করবেন, টাকা ফেরত পাওয়ার সম্ভাবনা তত বেশি। এখনই শুরু করুন।',
    ctaBtn: 'অভিযোগ শুরু করুন',
    tagline: 'AI সাইবার ক্রাইম ট্রায়াজ। আতঙ্ক থেকে এফআইআর।',
    linksTitle: 'লিঙ্ক',
    howItWorks: 'এটি কীভাবে কাজ করে',
    whySamarthan: 'সমর্থন কেন?',
    getStarted: 'শুরু করুন',
    emergencyTitle: 'জরুরী সহায়তা',
    helpline1930: 'সাইবার হেল্পলাইন: 1930',
    police100: 'পুলিশ: 100',
    aboutTitle: 'আমাদের সম্পর্কে',
    hackathonTag: 'Build What Moves India হ্যাকাথনের জন্য নির্মিত',
    digilockerVerified: 'DigiLocker যাচাইকৃত পরিচয়',
    poweredBy: 'GPT-4o দ্বারা চালিত',
    disclaimer: 'দাবিত্যাগ: এই প্ল্যাটফর্মটি Build What Moves India হ্যাকাথনের জন্য তৈরি একটি AI সিমুলেশন ও প্রোটোটাইপ। এটি কোনো সরকারি ওয়েবসাইট নয় (সরকারি পোর্টাল হল cybercrime.gov.in)। আসল জরুরি সাইবার ক্রাইম সহায়তার জন্য অবিলম্বে 1930 নম্বরে ডায়াল করুন।',
  },
  mr: {
    ctaHeadline: 'गोल्डन अवरमध्ये प्रत्येक मिनिट महत्त्वाचा असतो.',
    ctaDesc: 'फसवणुकीची तक्रार जितक्या लवकर कराल, पैसे परत मिळण्याची शक्यता तितकीच जास्त. आताच सुरू करा.',
    ctaBtn: 'तक्रार सुरू करा',
    tagline: 'AI सायबर गुन्हे ट्रायज. घाबरण्यापासून एफआयआरपर्यंत.',
    linksTitle: 'दुवे',
    howItWorks: 'हे कसे कार्य करते',
    whySamarthan: 'समर्थन का?',
    getStarted: 'सुरू करा',
    emergencyTitle: 'तातडीची मदत',
    helpline1930: 'सायबर हेल्पलाइन: 1930',
    police100: 'पोलीस: 100',
    aboutTitle: 'बद्दल',
    hackathonTag: 'Build What Moves India हॅकाथॉनसाठी तयार केले',
    digilockerVerified: 'DigiLocker पडताळलेली ओळख',
    poweredBy: 'GPT-4o द्वारे समर्थित',
    disclaimer: 'अस्वीकरण: हे व्यासपीठ Build What Moves India हॅकाथॉनसाठी विकसित केलेले AI सिम्युलेशन आणि प्रोटोटाइप आहे. ही कोणतीही अधिकृत सरकारी वेबसाइट नाही (अधिकृत सरकारी पोर्टल cybercrime.gov.in आहे). वास्तविक आपत्कालीन मदतीसाठी त्वरित 1930 वर कॉल करा.',
  },
  te: {
    ctaHeadline: 'గోల్డెన్ అవర్‌లో ప్రతి నిమిషం చాలా ముఖ్యం.',
    ctaDesc: 'మోసం గురించి ఎంత త్వరగా ఫిర్యాదు చేస్తే, డబ్బు తిరిగి పొందే అవకాశం అంత ఎక్కువగా ఉంటుంది. ఇప్పుడే ప్రారంభించండి.',
    ctaBtn: 'రిపోర్ట్ ప్రారంభించండి',
    tagline: 'AI సైబర్ క్రైమ్ ట్రయాజ్. భయం నుండి ఎఫ్ఐఆర్ వరకు.',
    linksTitle: 'లింకులు',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    whySamarthan: 'సమర్థన్ ఎందుకు?',
    getStarted: 'ప్రారంభించండి',
    emergencyTitle: 'అత్యవసర',
    helpline1930: 'సైబర్ హెల్ప్‌లైన్: 1930',
    police100: 'పోలీస్: 100',
    aboutTitle: 'గురించి',
    hackathonTag: 'Build What Moves India హ్యాకథాన్ కోసం రూపొందించబడింది',
    digilockerVerified: 'DigiLocker ధృవీకరించబడిన గుర్తింపు',
    poweredBy: 'GPT-4o ద్వారా ఆధారితం',
    disclaimer: 'నిరాకరణ: ఈ ప్లాట్‌ఫారమ్ Build What Moves India హ్యాకథాన్ కోసం అభివృద్ధి చేయబడిన AI సిమ్యులేషన్ & ప్రోటోటైప్. ఇది అధికారిక ప్రభుత్వ వెబ్‌సైట్ కాదు (అధికారిక ప్రభుత్వ పోర్టల్ cybercrime.gov.in). అత్యవసర సైబర్ క్రైమ్ సహాయం కోసం వెంటనే 1930కి డయల్ చేయండి.',
  },
  ta: {
    ctaHeadline: 'தங்க நேரத்தில் ஒவ்வொரு நிமிடமும் முக்கியமானது.',
    ctaDesc: 'மோசடி பற்றி எவ்வளவு விரைவாக புகார் செய்கிறீர்களோ, பணம் திரும்பக் கிடைக்க வாய்ப்பு அதிகம். இப்போதே தொடங்குங்கள்.',
    ctaBtn: 'புகார் தொடங்கவும்',
    tagline: 'AI சைபர் கிரைம் ட்ரையாஜ். பதற்றத்திலிருந்து முதல் தகவல் அறிக்கை வரை.',
    linksTitle: 'இணைப்புகள்',
    howItWorks: 'இது எப்படி செயல்படுகிறது',
    whySamarthan: 'ஏன் சமர்தன்?',
    getStarted: 'தொடங்குங்கள்',
    emergencyTitle: 'அவசரம்',
    helpline1930: 'சைபர் உதவி எண்: 1930',
    police100: 'காவல்துறை: 100',
    aboutTitle: 'பற்றி',
    hackathonTag: 'Build What Moves India ஹேக்கத்தானுக்காக உருவாக்கப்பட்டது',
    digilockerVerified: 'DigiLocker சரிபார்க்கப்பட்ட அடையாளம்',
    poweredBy: 'GPT-4o மூலம் இயக்கப்படுகிறது',
    disclaimer: 'மறுப்பு: இந்த தளம் Build What Moves India ஹேக்கத்தானுக்காக உருவாக்கப்பட்ட AI உருவகப்படுத்துதல் மற்றும் மாதிரி வடிவம் ஆகும். இது அதிகாரப்பூர்வ அரசு வலைத்தளம் அல்ல (அதிகாரப்பூர்வ அரசு தளம் cybercrime.gov.in). அவசர உதவிக்கு உடனடியாக 1930 என்ற எண்ணை டயல் செய்யவும்.',
  },
  gu: {
    ctaHeadline: 'ગોલ્ડન અવરમાં દરેક મિનિટ મહત્વપૂર્ણ છે.',
    ctaDesc: 'જેટલી ઝડપથી છેતરપિંડીની જાણ કરશો, પૈસા પાછા મળવાની શક્યતા એટલી જ વધારે. અત્યારે જ શરૂ કરો.',
    ctaBtn: 'રિપોર્ટ શરૂ કરો',
    tagline: 'AI સાયબર ક્રાઇમ ટ્રાયાજ. ગભરાટથી એફઆઈઆર સુધી.',
    linksTitle: 'લિંક્સ',
    howItWorks: 'આ કેવી રીતે કાર્ય કરે છે',
    whySamarthan: 'સમર્થન શા માટે?',
    getStarted: 'શરૂ કરો',
    emergencyTitle: 'કટોકટી',
    helpline1930: 'સાયબર હેલ્પલાઇન: 1930',
    police100: 'પોલીસ: 100',
    aboutTitle: 'વિશે',
    hackathonTag: 'Build What Moves India હેકાથોન માટે બનાવેલ',
    digilockerVerified: 'DigiLocker પ્રમાણિત ઓળખ',
    poweredBy: 'GPT-4o દ્વારા સંચાલિત',
    disclaimer: 'અસ્વીકરણ: આ પ્લેટફોર્મ Build What Moves India હેકાથોન માટે વિકસાવવામાં આવેલ AI સિમ્યુલેશન અને પ્રોટોટાઇપ છે. આ કોઈ સત્તાવાર સરકારી વેબસાઇટ નથી (સત્તાવાર સરકારી પોર્ટલ cybercrime.gov.in છે). વાસ્તવિક કટોકટી સહાય માટે તાત્કાલિક 1930 ડાયલ કરો.',
  },
  ur: {
    ctaHeadline: 'گولڈن آور میں ہر منٹ قیمتی ہے۔',
    ctaDesc: 'دھوکہ دہی کی اطلاع جتنی جلدی دی جائے گی، رقم واپس ملنے کا امکان اتنا ہی زیادہ ہوگا۔ ابھی شروع کریں۔',
    ctaBtn: 'رپورٹ درج کرنا شروع کریں',
    tagline: 'AI سائبر کرائم ٹرائیژ۔ خوف و ہراس سے ایف آئی آر تک۔',
    linksTitle: 'لنکس',
    howItWorks: 'یہ کیسے کام کرتا ہے',
    whySamarthan: 'سمرتھن کیوں؟',
    getStarted: 'شروع کریں',
    emergencyTitle: 'ہنگامی امداد',
    helpline1930: 'سائبر ہیلپ لائن: 1930',
    police100: 'پولیس: 100',
    aboutTitle: 'تعارف',
    hackathonTag: 'Build What Moves India ہیکاتھن کے لیے تیار کیا گیا',
    digilockerVerified: 'ڈیجی لاکر سے تصدیق شدہ شناخت',
    poweredBy: 'GPT-4o کے ذریعے چلنے والا',
    disclaimer: 'دستبرداری: یہ پلیٹ فارم Build What Moves India ہیکاتھن کے لیے تیار کیا گیا ایک AI سمیولیشن اور پروٹوٹائپ ہے۔ یہ کوئی سرکاری ویب سائٹ نہیں ہے (سرکاری پورٹل cybercrime.gov.in ہے)۔ حقیقی ہنگامی مدد کے لیے فوری طور پر 1930 ڈائل کریں۔',
  },
  kn: {
    ctaHeadline: 'ಗೋಲ್ಡನ್ ಅವರ್‌ನಲ್ಲಿ ಪ್ರತಿ ನಿಮಿಷವೂ ಅತ್ಯಂತ ಅಮೂಲ್ಯ.',
    ctaDesc: 'ವಂಚನೆಯ ಬಗ್ಗೆ ಎಷ್ಟು ಬೇಗನೆ ವರದಿ ಮಾಡುತ್ತೀರೋ, ಹಣ ಮರಳಿ ಪಡೆಯುವ ಸಾಧ್ಯತೆ ಅಷ್ಟೇ ಹೆಚ್ಚು. ಈಗಲೇ ಪ್ರಾರಂಭಿಸಿ.',
    ctaBtn: 'ವರದಿ ಪ್ರಾರಂಭಿಸಿ',
    tagline: 'AI ಸೈಬರ್ ಕ್ರೈಮ್ ಟ್ರಯಾಜ್. ಆತಂಕದಿಂದ ಎಫ್‌ಐಆರ್‌ವರೆಗೆ.',
    linksTitle: 'ಲಿಂಕ್‌ಗಳು',
    howItWorks: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    whySamarthan: 'ಸಮರ್ಥನ್ ಏಕೆ?',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    emergencyTitle: 'ತುರ್ತು',
    helpline1930: 'ಸೈಬರ್ ಸಹಾಯವಾಣಿ: 1930',
    police100: 'ಪೊಲೀಸ್: 100',
    aboutTitle: 'ಬಗ್ಗೆ',
    hackathonTag: 'Build What Moves India ಹ್ಯಾಕಥಾನ್‌ಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ',
    digilockerVerified: 'DigiLocker ಪರಿಶೀಲಿಸಿದ ಗುರುತು',
    poweredBy: 'GPT-4o ಮೂಲಕ ಚಾಲಿತ',
    disclaimer: 'ಹಕ್ಕು ನಿರಾಕರಣೆ: ಈ ವೇದಿಕೆಯು Build What Moves India ಹ್ಯಾಕಥಾನ್‌ಗಾಗಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾದ AI ಸಿಮ್ಯುಲೇಶನ್ ಮತ್ತು ಮೂಲಮಾದರಿಯಾಗಿದೆ. ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್ ಅಲ್ಲ (ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ cybercrime.gov.in). ನೈಜ ತುರ್ತು ಸೈಬರ್ ಕ್ರೈಮ್ ಸಹಾಯಕ್ಕಾಗಿ ತಕ್ಷಣ 1930 ಗೆ ಡಯಲ್ ಮಾಡಿ.',
  },
  or: {
    ctaHeadline: 'ଗୋଲ୍ଡେନ୍ ଆୱାର୍‌ରେ ପ୍ରତ୍ୟେକ ମିନିଟ୍ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ।',
    ctaDesc: 'ଯେତେ ଶୀଘ୍ର ଠକେଇ ଅଭିଯୋଗ କରିବେ, ଟଙ୍କା ଫେରି ପାଇବାର ସମ୍ଭାବନା ସେତେ ଅଧିକ। ଏବେ ଆରମ୍ଭ କରନ୍ତୁ।',
    ctaBtn: 'ଅଭିଯୋଗ ଆରମ୍ଭ କରନ୍ତୁ',
    tagline: 'AI ସାଇବର ଅପରାଧ ଟ୍ରାଇଜ୍। ଆତଙ୍କରୁ FIR ଯାଏଁ।',
    linksTitle: 'ଲିଙ୍କ୍',
    howItWorks: 'ଏହା କିପରି କାମ କରେ',
    whySamarthan: 'ସମର୍ଥନ କାହିଁକି?',
    getStarted: 'ଆରମ୍ଭ କରନ୍ତୁ',
    emergencyTitle: 'ଜରୁରୀକାଳୀନ',
    helpline1930: 'ସାଇବର ହେଲ୍ପଲାଇନ: 1930',
    police100: 'ପୋଲିସ: 100',
    aboutTitle: 'ବିବରଣୀ',
    hackathonTag: 'Build What Moves India ହ୍ୟାକାଥନ୍ ପାଇଁ ନିର୍ମିତ',
    digilockerVerified: 'DigiLocker ପ୍ରମାଣିତ ପରିଚୟ',
    poweredBy: 'GPT-4o ଦ୍ୱାରା ପରିଚାଳିତ',
    disclaimer: 'ଦାବିତ୍ୟାଗ: ଏହି ପ୍ଲାଟଫର୍ମଟି Build What Moves India ହ୍ୟାକାଥନ୍ ପାଇଁ ବିକଶିତ ଏକ AI ସିମ୍ୟୁଲେସନ୍ ଏବଂ ପ୍ରୋଟୋଟାଇପ୍। ଏହା କୌଣସି ସରକାରୀ ୱେବସାଇଟ୍ ନୁହେଁ (ସରକାରୀ ପୋର୍ଟାଲ୍ ହେଉଛି cybercrime.gov.in)। ପ୍ରକୃତ ଜରୁରୀ ସାହାଯ୍ୟ ପାଇଁ ତୁରନ୍ତ 1930 ରେ ଡାଏଲ୍ କରନ୍ତୁ।',
  },
  ml: {
    ctaHeadline: 'ഗോൾഡൻ അവറിൽ ഓരോ മിനിറ്റും നിർണായകമാണ്.',
    ctaDesc: 'തട്ടിപ്പ് എത്രയും വേഗം റിപ്പോർട്ട് ചെയ്യുന്നുവോ, പണം തിരികെ ലഭിക്കാനുള്ള സാധ്യത അത്രയും കൂടും. ഇപ്പോൾ ആരംഭിക്കുക.',
    ctaBtn: 'റിപ്പോർട്ട് ആരംഭിക്കുക',
    tagline: 'AI സൈബർ കുറ്റകൃത്യ ട്രയേജ്. പരിഭ്രാന്തിയിൽ നിന്ന് FIR-ലേക്ക്.',
    linksTitle: 'ലിങ്കുകൾ',
    howItWorks: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    whySamarthan: 'എന്തുകൊണ്ട് സമർത്ഥൻ?',
    getStarted: 'ആരംഭിക്കുക',
    emergencyTitle: 'അടിയന്തിരം',
    helpline1930: 'സൈബർ ഹെൽപ്പ്‌ലൈൻ: 1930',
    police100: 'പോലീസ്: 100',
    aboutTitle: 'കുറിച്ച്',
    hackathonTag: 'Build What Moves India ഹാക്കത്തോണിനായി നിർമ്മിച്ചത്',
    digilockerVerified: 'ഡിജിലോക്കർ സ്ഥിരീകരിച്ച തിരിച്ചറിയൽ',
    poweredBy: 'GPT-4o നൽകുന്നത്',
    disclaimer: 'നിരാകരണം: ഈ പ്ലാറ്റ്‌ഫോം Build What Moves India ഹാക്കത്തോണിനായി വികസിപ്പിച്ചെടുത്ത ഒരു AI സിമുലേഷനും പ്രോട്ടോടൈപ്പുമാണ്. ഇത് ഒരു ഔദ്യോഗിക സർക്കാർ വെബ്‌സൈറ്റല്ല (ഔദ്യോഗിക സർക്കാർ പോർട്ടൽ cybercrime.gov.in ആണ്). അടിയന്തിര സഹായത്തിനായി ഉടൻ 1930 ഡയൽ ചെയ്യുക.',
  },
  pa: {
    ctaHeadline: 'ਗੋਲਡਨ ਆਵਰ ਵਿੱਚ ਹਰ ਮਿੰਟ ਕੀਮਤੀ ਹੈ।',
    ctaDesc: 'ਧੋਖਾਧੜੀ ਦੀ ਰਿਪੋਰਟ ਜਿੰਨੀ ਜਲਦੀ ਕਰੋਗੇ, ਪੈਸੇ ਵਾਪਸ ਮਿਲਣ ਦੀ ਸੰਭਾਵਨਾ ਓਨੀ ਹੀ ਵੱਧ ਹੋਵੇਗੀ। ਹੁਣੇ ਸ਼ੁਰੂ ਕਰੋ।',
    ctaBtn: 'ਰਿਪੋਰਟ ਸ਼ੁਰੂ ਕਰੋ',
    tagline: 'AI ਸਾਈਬਰ ਕ੍ਰਾਈਮ ਟ੍ਰਾਇਜ। ਘਬਰਾਹਟ ਤੋਂ ਐੱਫ.ਆਈ.ਆਰ. ਤੱਕ।',
    linksTitle: 'ਲਿੰਕ',
    howItWorks: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    whySamarthan: 'ਸਮਰਥਨ ਕਿਉਂ?',
    getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
    emergencyTitle: 'ਐਮਰਜੈਂਸੀ',
    helpline1930: 'ਸਾਈਬਰ ਹੈਲਪਲਾਈਨ: 1930',
    police100: 'ਪੁਲਿਸ: 100',
    aboutTitle: 'ਬਾਰੇ',
    hackathonTag: 'Build What Moves India ਹੈਕਾਥੌਨ ਲਈ ਬਣਾਇਆ ਗਿਆ',
    digilockerVerified: 'DigiLocker ਪ੍ਰਮਾਣਿਤ ਪਛਾਣ',
    poweredBy: 'GPT-4o ਦੁਆਰਾ ਸੰਚਾਲਿਤ',
    disclaimer: 'ਬੇਦਾਅਵਾ: ਇਹ ਪਲੇਟਫਾਰਮ Build What Moves India ਹੈਕਾਥੌਨ ਲਈ ਵਿਕਸਤ ਕੀਤਾ ਗਿਆ ਇੱਕ AI ਸਿਮੂਲੇਸ਼ਨ ਅਤੇ ਪ੍ਰੋਟੋਟਾਈਪ ਹੈ। ਇਹ ਕੋਈ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟ ਨਹੀਂ ਹੈ (ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਪੋਰਟਲ cybercrime.gov.in ਹੈ)। ਅਸਲ ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ ਲਈ ਤੁਰੰਤ 1930 ਡਾਇਲ ਕਰੋ।',
  },
}

export default function FooterSection({ language }: FooterSectionProps) {
  const t = FOOTER_I18N[language] || FOOTER_I18N.en
  const router = useRouter()
  const { setScenarioId, setInputType } = useTriage()

  const startReport = () => {
    setScenarioId(null)
    setInputType('text')
    router.push('/intake?category=auto')
  }

  const scrollTo = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Final CTA */}
      <section className="bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground indic-headline">
            {t.ctaHeadline}
          </h2>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed indic-body">
            {t.ctaDesc}
          </p>
          <button
            onClick={startReport}
            className="mt-6 sm:mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-8 py-3.5 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
          >
            <span>{t.ctaBtn}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold text-foreground">Samarthan</div>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed indic-body">
                {t.tagline}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                {t.linksTitle}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li><a href="#how-it-works" onClick={(e) => scrollTo('how-it-works', e)} className="hover:text-primary transition-colors">{t.howItWorks}</a></li>
                <li><a href="#comparison" onClick={(e) => scrollTo('comparison', e)} className="hover:text-primary transition-colors">{t.whySamarthan}</a></li>
                <li><a href="#file-report" onClick={(e) => scrollTo('file-report', e)} className="hover:text-primary transition-colors">{t.getStarted}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                {t.emergencyTitle}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li><a href="tel:1930" className="hover:text-primary transition-colors">{t.helpline1930}</a></li>
                <li><a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">cybercrime.gov.in</a></li>
                <li><a href="tel:100" className="hover:text-primary transition-colors">{t.police100}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                {t.aboutTitle}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li>{t.hackathonTag}</li>
                <li>{t.digilockerVerified}</li>
                <li>{t.poweredBy}</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <p className="max-w-3xl leading-relaxed indic-body">
              🏆 <strong>Build What Moves India Hackathon Project</strong> • ⚠️ <em>{t.disclaimer}</em>
            </p>
            <p className="whitespace-nowrap font-medium text-zinc-400">
              Made with ❤️ for India
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
