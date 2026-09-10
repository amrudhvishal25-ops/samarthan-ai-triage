'use client'

import React from 'react'
import { ShieldCheck, Check, X, ArrowRight } from 'lucide-react'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { SAMARTHAN_POINTS_12, OTHERS_POINTS_12 } from '@/lib/i18n/componentTranslations'

interface ComparisonTableProps {
  language: SupportedLanguage
}

const COMPARISON_I18N: Record<string, {
  eyebrow: string
  headline: string
  subheadline: string
  samarthanTitle: string
  recommended: string
  samarthanDesc: string
  samarthanBtn: string
  othersTitle: string
  othersDesc: string
  othersBtn: string
}> = {
  en: {
    eyebrow: "Why Samarthan",
    headline: "Built differently, on purpose",
    subheadline: "We obsessed over the critical golden hour details legacy systems ignore. Here is what that means for victims every single second.",
    samarthanTitle: "Samarthan",
    recommended: "Recommended",
    samarthanDesc: "Everything a victim needs in the golden hour, without the administrative runaround.",
    samarthanBtn: "Start for Free",
    othersTitle: "The others",
    othersDesc: "Common friction points victims encounter with legacy reporting platforms.",
    othersBtn: "See Why Victims Switch",
  },
  hi: {
    eyebrow: "समर्थन क्यों?",
    headline: "पहले दिन से अलग, उद्देश्यपूर्ण।",
    subheadline: "हमने उन महत्वपूर्ण 'गोल्डन ऑवर' विवरणों पर ध्यान केंद्रित किया जिन्हें पारंपरिक पोर्टल अनदेखा कर देते हैं। जानिए इसका पीड़ितों के लिए क्या महत्व है।",
    samarthanTitle: "समर्थन",
    recommended: "अनुशंसित",
    samarthanDesc: "गोल्डन ऑवर में वह सब कुछ जो एक पीड़ित को चाहिए, बिना प्रशासनिक झंझट के।",
    samarthanBtn: "मुफ़्त शिकायत दर्ज करें",
    othersTitle: "पारंपरिक पोर्टल",
    othersDesc: "पारंपरिक पुलिस और सरकारी पोर्टलों पर पीड़ितों द्वारा झेली जाने वाली सामान्य रुकावटें।",
    othersBtn: "देखें पीड़ित समर्थन क्यों चुनते हैं",
  },
  bn: {
    eyebrow: "কেন সমর্থন?",
    headline: "প্রথম দিন থেকেই উদ্দেশ্যমূলকভাবে ভিন্ন।",
    subheadline: "আমরা গোল্ডেন আওয়ারের সেই গুরুত্বপূর্ণ বিবরণগুলির উপর নজর রেখেছি যা প্রচলিত ব্যবস্থা উপেক্ষা করে।",
    samarthanTitle: "সমর্থন",
    recommended: "প্রস্তাবিত",
    samarthanDesc: "গোল্ডেন আওয়ারে একজন ক্ষতিগ্রস্তের যা যা প্রয়োজন, কোনো জটিল প্রক্রিয়া ছাড়াই।",
    samarthanBtn: "বিনামূল্যে অভিযোগ দায়ের করুন",
    othersTitle: "প্রচলিত পোর্টাল",
    othersDesc: "পুরোনো ব্যবস্থায় ভুক্তভোগীদের যেসব সমস্যার সম্মুখীন হতে হয়।",
    othersBtn: "কেন নাগরিকরা সমর্থন বেছে নেন",
  },
  mr: {
    eyebrow: "समर्थन का?",
    headline: "पहिल्या दिवसापासून वेगळे, उद्देशपूर्ण.",
    subheadline: "आम्ही महत्त्वाच्या 'गोल्डन अवर' तपशिलांवर लक्ष केंद्रित केले जे पारंपारिक पोर्टल दुर्लक्षित करतात.",
    samarthanTitle: "समर्थन",
    recommended: "शिफारस केलेले",
    samarthanDesc: "गोल्डन अवरमध्ये पीडिताला आवश्यक असणारे सर्व काही, प्रशासकीय त्रासाशिवाय.",
    samarthanBtn: "मोफत तक्रार नोंदवा",
    othersTitle: "पारंपारिक पोर्टल",
    othersDesc: "पारंपारिक प्रणालींमध्ये नागरिकांना येणाऱ्या सामान्य अडचणी.",
    othersBtn: "नागरिक समर्थन का निवडतात ते पहा",
  },
  te: {
    eyebrow: "ఎందుకు సమర్థన్?",
    headline: "మొదటి రోజు నుంచే భిన్నమైనది.",
    subheadline: "పాత పోర్టల్స్ విస్మరించే గోల్డెన్ అవర్ ముఖ్య అంశాలపై మేము దృష్టి పెట్టాము.",
    samarthanTitle: "సమర్థన్",
    recommended: "సిఫార్సు చేయబడింది",
    samarthanDesc: "ఎలాంటి పరిపాలనాపరమైన ఇబ్బందులు లేకుండా బాధితుడికి అవసరమైన ప్రతిదీ.",
    samarthanBtn: "ఉచితంగా ఫిర్యాదు చేయండి",
    othersTitle: "సాంప్రదాయ పోర్టల్స్",
    othersDesc: "పాత వ్యవస్థల్లో బాధితులు ఎదుర్కొనే సాధారణ సమస్యలు.",
    othersBtn: "బాధితులు సమర్థన్‌ను ఎందుకు ఎంచుకుంటారో చూడండి",
  },
  ta: {
    eyebrow: "ஏன் சமர்த்தன்?",
    headline: "முதல் நாளிலிருந்தே வித்தியாசமானது.",
    subheadline: "பாரம்பரிய அமைப்புகள் புறக்கணிக்கும் தங்க நேர விவரங்களில் நாங்கள் கவனம் செலுத்துகிறோம்.",
    samarthanTitle: "சமர்த்தன்",
    recommended: "பரிந்துரைக்கப்படுகிறது",
    samarthanDesc: "சிக்கலான நடைமுறைகள் இன்றி பாதிக்கப்பட்டவருக்கு தேவையான அனைத்தும்.",
    samarthanBtn: "இலவசமாக புகார் பதிவு செய்க",
    othersTitle: "பாரம்பரிய தளங்கள்",
    othersDesc: "பாரம்பரிய அமைப்புகளில் மக்கள் எதிர்கொள்ளும் பொதுவான தடைகள்.",
    othersBtn: "பாதிக்கப்பட்டவர்கள் ஏன் மாறுகிறார்கள் என காண்க",
  },
  gu: {
    eyebrow: "સમર્થન કેમ?",
    headline: "પ્રથમ દિવસથી અલગ અને હેતુપૂર્ણ.",
    subheadline: "અમે તે મહત્વપૂર્ણ 'ગોલ્ડન અવર' વિગતો પર ધ્યાન કેન્દ્રિત કર્યું છે જેને જૂની પ્રણાલીઓ અવગણે છે.",
    samarthanTitle: "સમર્થન",
    recommended: "ભલામણ કરેલ",
    samarthanDesc: "ગોલ્ડન અવરમાં પીડિતને જરૂરી તમામ સહાય, કોઈપણ વહીવટી મુશ્કેલી વિના.",
    samarthanBtn: "મફત ફરિયાદ નોંધાવો",
    othersTitle: "પરંપરાગત પોર્ટલ",
    othersDesc: "જૂની પ્રણાલીઓમાં પીડિતો દ્વારા અનુભવાતી સામાન્ય અડચણો.",
    othersBtn: "નાગરિકો સમર્થન કેમ પસંદ કરે છે તે જુઓ",
  },
  ur: {
    eyebrow: "سمرتھن کیوں؟",
    headline: "پہلے دن سے مختلف اور با مقصد۔",
    subheadline: "ہم نے گولڈن آور کی ان اہم تفصیلات پر توجہ مرکوز کی جنہیں روایتی پورٹل نظر انداز کرتے ہیں۔",
    samarthanTitle: "سمرتھن",
    recommended: "تجویز کردہ",
    samarthanDesc: "گولڈن آور میں متاثرہ شہری کو درکار تمام چیزیں، بغیر کسی دفتری رکاوٹ کے۔",
    samarthanBtn: "مفت شکایت درج کریں",
    othersTitle: "روایتی پورٹلز",
    othersDesc: "پرانے نظاموں میں شہریوں کو درپیش عام مسائل۔",
    othersBtn: "جانیں کہ شہری سمرتھن کیوں منتخب کرتے ہیں",
  },
  kn: {
    eyebrow: "ಸಮರ್ಥನ್ ಏಕೆ?",
    headline: "ಮೊದಲ ದಿನದಿಂದಲೇ ವಿಭಿನ್ನ ಹಾಗೂ ಉದ್ದೇಶಪೂರ್ವಕ.",
    subheadline: "ಸಾಂಪ್ರದಾಯಿಕ ವ್ಯವಸ್ಥೆಗಳು ನಿರ್ಲಕ್ಷಿಸುವ ಗೋಲ್ಡನ್ ಅವರ್ ವಿವರಗಳ ಮೇಲೆ ನಾವು ಗಮನಹರಿಸಿದ್ದೇವೆ.",
    samarthanTitle: "ಸಮರ್ಥನ್",
    recommended: "ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
    samarthanDesc: "ಆಡಳಿತಾತ್ಮಕ ತೊಂದರೆಗಳಿಲ್ಲದೆ ಗೋಲ್ಡನ್ ಅವರ್‌ನಲ್ಲಿ ಸಂತ್ರಸ್ತರಿಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ.",
    samarthanBtn: "ಉಚಿತವಾಗಿ ದೂರು ದಾಖಲಿಸಿ",
    othersTitle: "ಸಾಂಪ್ರದಾಯಿಕ ಪೋರ್ಟಲ್‌ಗಳು",
    othersDesc: "ಹಳೆಯ ವ್ಯವಸ್ಥೆಗಳಲ್ಲಿ ನಾಗರಿಕರು ಎದುರಿಸುವ ಸಾಮಾನ್ಯ ತೊಂದರೆಗಳು.",
    othersBtn: "ಸಂತ್ರಸ್ತರು ಸಮರ್ಥನ್ ಅನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡುತ್ತಾರೆ ನೋಡಿ",
  },
  or: {
    eyebrow: "କାହିଁକି ସମର୍ଥନ?",
    headline: "ପ୍ରଥମ ଦିନରୁ ହିଁ ଭିନ୍ନ ଓ ଉଦ୍ଦେଶ୍ୟପୂର୍ଣ୍ଣ।",
    subheadline: "ଆମେ ଗୋଲ୍ଡେନ୍ ଆୱାରର ସେହି ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ବିବରଣୀ ଉପରେ ଧ୍ୟାନ ଦେଇଛୁ ଯାହାକୁ ପୁରୁଣା ପୋର୍ଟାଲ୍ ଅଣଦେଖା କରନ୍ତି।",
    samarthanTitle: "ସମର୍ଥନ",
    recommended: "ପ୍ରସ୍ତାବିତ",
    samarthanDesc: "ଗୋଲ୍ଡେନ୍ ଆୱାରରେ ଜଣେ ପୀଡ଼ିତଙ୍କୁ ଆବଶ୍ୟକ ସମସ୍ତ ସାହାଯ୍ୟ, କୌଣସି ଜଟିଳତା ବିନା।",
    samarthanBtn: "ମାଗଣାରେ ଅଭିଯୋଗ କରନ୍ତୁ",
    othersTitle: "ପାରମ୍ପରିକ ପୋର୍ଟାଲ୍",
    othersDesc: "ପୁରୁଣା ବ୍ୟବସ୍ଥାରେ ସାଧାରଣ ନାଗରିକଙ୍କ ସମସ୍ୟା।",
    othersBtn: "ଲୋକେ କାହିଁକି ସମର୍ଥନ ବାଛନ୍ତି ଦେଖନ୍ତୁ",
  },
  ml: {
    eyebrow: "എന്തുകൊണ്ട് സമർത്ഥൻ?",
    headline: "ആദ്യ ദിനം മുതൽ തികച്ചും വ്യത്യസ്തം.",
    subheadline: "പരമ്പരാഗത പോർട്ടലുകൾ അവഗണിക്കുന്ന ഗോൾഡൻ അവർ വിശദാംശങ്ങളിൽ ഞങ്ങൾ ശ്രദ്ധ കേന്ദ്രീകരിക്കുന്നു.",
    samarthanTitle: "സമർത്ഥൻ",
    recommended: "ശുപാർശ ചെയ്യുന്നത്",
    samarthanDesc: "സങ്കീർണ്ണതകളില്ലാതെ ഗോൾഡൻ അവറിൽ ഒരു ഇരയ്ക്ക് ആവശ്യമായതെല്ലാം.",
    samarthanBtn: "സൗജന്യമായി പരാതി നൽകുക",
    othersTitle: "പരമ്പരാഗത പോർട്ടലുകൾ",
    othersDesc: "പഴയ സംവിധാനങ്ങളിൽ ആളുകൾ നേരിടുന്ന സാധാരണ തടസ്സങ്ങൾ.",
    othersBtn: "എന്തുകൊണ്ട് സമർത്ഥൻ തിരഞ്ഞെടുക്കുന്നു എന്ന് കാണുക",
  },
  pa: {
    eyebrow: "ਸਮਰਥਨ ਕਿਉਂ?",
    headline: "ਪਹਿਲੇ ਦਿਨ ਤੋਂ ਹੀ ਵੱਖਰਾ ਅਤੇ ਮਕਸਦਪੂਰਨ।",
    subheadline: "ਅਸੀਂ ਗੋਲਡਨ ਆਵਰ ਦੇ ਉਨ੍ਹਾਂ ਮਹੱਤਵਪੂਰਨ ਵੇਰਵਿਆਂ 'ਤੇ ਧਿਆਨ ਦਿੱਤਾ ਹੈ ਜਿਨ੍ਹਾਂ ਨੂੰ ਰਵਾਇਤੀ ਪੋਰਟਲ ਨਜ਼ਰਅੰਦਾਜ਼ ਕਰਦੇ ਹਨ।",
    samarthanTitle: "ਸਮਰਥਨ",
    recommended: "ਸਿਫ਼ਾਰਿਸ਼ ਕੀਤਾ",
    samarthanDesc: "ਗੋਲਡਨ ਆਵਰ ਵਿੱਚ ਪੀੜਤ ਨੂੰ ਲੋੜੀਂਦੀ ਹਰ ਸਹਾਇਤਾ, ਬਿਨਾਂ ਕਿਸੇ ਪ੍ਰਸ਼ਾਸਕੀ ਰੁਕਾਵਟ ਦੇ।",
    samarthanBtn: "ਮੁਫ਼ਤ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ",
    othersTitle: "ਰਵਾਇਤੀ ਪੋਰਟਲ",
    othersDesc: "ਪੁਰਾਣੇ ਸਿਸਟਮਾਂ ਵਿੱਚ ਨਾਗਰਿਕਾਂ ਨੂੰ ਆਉਣ ਵਾਲੀਆਂ ਮੁਸ਼ਕਲਾਂ।",
    othersBtn: "ਵੇਖੋ ਪੀੜਤ ਸਮਰਥਨ ਕਿਉਂ ਚੁਣਦੇ ਹਨ",
  },
}

export default function ComparisonTable({ language }: ComparisonTableProps) {
  const isHi = language === 'hi'
  const loc = COMPARISON_I18N[language] || COMPARISON_I18N.en

  const samarthanPoints = SAMARTHAN_POINTS_12
  const othersPoints = OTHERS_POINTS_12

  const handleScrollToReport = () => {
    const el = document.getElementById('file-report')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/intake'
    }
  }

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="comparison" className="py-14 sm:py-24 bg-white border-t border-zinc-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Centered Pill Badge */}
        <div className="flex justify-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 rounded-md shadow-xs text-xs font-semibold text-zinc-800 tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span>{loc.eyebrow}</span>
          </div>
        </div>

        {/* Headline & Subheadline */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight indic-headline">
            {loc.headline}
          </h2>
          <p className="text-zinc-500 text-sm md:text-base mt-3 sm:mt-4 leading-relaxed">
            {loc.subheadline}
          </p>
        </div>

        {/* Two-Column Side-by-Side Cards (Us vs. Them) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* LEFT CARD: Samarthan (Recommended / Hero) */}
          <div className="bg-white border-2 border-primary rounded-xl p-5 sm:p-7 md:p-8 flex flex-col justify-between shadow-sm relative transition-colors h-full">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  {loc.samarthanTitle}
                </h3>
                <span className="bg-primary text-white text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded font-semibold">
                  {loc.recommended}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
                {loc.samarthanDesc}
              </p>

              {/* Divider */}
              <div className="border-b border-zinc-200 my-5 sm:my-6" />

              {/* Checkmark List */}
              <ul className="space-y-3.5 sm:space-y-4">
                {samarthanPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary text-white flex items-center justify-center shrink-0 rounded-sm mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">
                      {point[language] || point.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-6 sm:pt-8">
              <button
                onClick={handleScrollToReport}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-6 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer group min-h-[44px]"
              >
                <span>{loc.samarthanBtn}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
            </div>
          </div>

          {/* RIGHT CARD: The others (Traditional Portals) */}
          <div className="bg-zinc-50/70 border border-zinc-200 rounded-xl p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full">
            <div>
              {/* Header */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-800 tracking-tight">
                  {loc.othersTitle}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
                {loc.othersDesc}
              </p>

              {/* Divider */}
              <div className="border-b border-zinc-200 my-5 sm:my-6" />

              {/* Cross Points List */}
              <ul className="space-y-3.5 sm:space-y-4">
                {othersPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-zinc-200/90 text-zinc-400 flex items-center justify-center shrink-0 rounded-sm mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                    <span className="text-xs sm:text-sm text-zinc-500 leading-snug">
                      {point[language] || point.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-6 sm:pt-8">
              <button
                onClick={handleScrollToHowItWorks}
                className="w-full bg-zinc-200/70 hover:bg-zinc-200 text-zinc-700 font-semibold py-3.5 px-6 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer group min-h-[44px]"
              >
                <span>{loc.othersBtn}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

