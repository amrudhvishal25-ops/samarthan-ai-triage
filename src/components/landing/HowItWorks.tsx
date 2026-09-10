import React from 'react'
import { Clock, MessageSquare, Mic, FileImage, ShieldCheck, Scale, Phone, Building2, RefreshCw } from 'lucide-react'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { getTranslation } from '@/lib/i18n/translations'

interface HowItWorksProps {
  language: SupportedLanguage
}

interface StepItem {
  n: string
  duration: string
  title: string
  body: string
  points: { icon: React.ReactNode; text: string }[]
  shot: string
}

const DURATION_MAP: Record<string, { s1: string; s2: string; s3: string }> = {
  en: { s1: 'Takes ~15 seconds', s2: 'Takes ~20 seconds', s3: 'Takes ~25 seconds' },
  hi: { s1: 'लगभग 15 सेकंड', s2: 'लगभग 20 सेकंड', s3: 'लगभग 25 सेकंड' },
  bn: { s1: 'প্রায় ১৫ সেকেন্ড', s2: 'প্রায় ২০ সেকেন্ড', s3: 'প্রায় ২৫ সেকেন্ড' },
  mr: { s1: 'सुमारे १५ सेकंद', s2: 'सुमारे २० सेकंद', s3: 'सुमारे २५ सेकंद' },
  te: { s1: 'సుమారు 15 సెకన్లు', s2: 'సుమారు 20 సెకన్లు', s3: 'సుమారు 25 సెకన్లు' },
  ta: { s1: 'சுமார் 15 வினாடிகள்', s2: 'சுமார் 20 வினாடிகள்', s3: 'சுமார் 25 வினாடிகள்' },
  gu: { s1: 'લગભગ 15 સેકન્ડ', s2: 'લગભગ 20 સેકન્ડ', s3: 'લગભગ 25 સેકન્ડ' },
  ur: { s1: 'تقریباً 15 سیکنڈ', s2: 'تقریباً 20 سیکنڈ', s3: 'تقریباً 25 سیکنڈ' },
  kn: { s1: 'ಸುಮಾರು 15 ಸೆಕೆಂಡುಗಳು', s2: 'ಸುಮಾರು 20 ಸೆಕೆಂಡುಗಳು', s3: 'ಸುಮಾರು 25 ಸೆಕೆಂಡುಗಳು' },
  or: { s1: 'ପ୍ରାୟ ୧୫ ସେକେଣ୍ଡ', s2: 'ପ୍ରାୟ ୨୦ ସେକେଣ୍ଡ', s3: 'ପ୍ରାୟ ୨୫ ସେକେଣ୍ଡ' },
  ml: { s1: 'ഏകദേശം 15 സെക്കൻഡ്', s2: 'ഏകദേശം 20 സെക്കൻഡ്', s3: 'ഏകദേശം 25 സെക്കൻഡ്' },
  pa: { s1: 'ਲਗਭਗ 15 ਸਕਿੰਟ', s2: 'ਲਗਭਗ 20 ਸਕਿੰਟ', s3: 'ਲਗਭਗ 25 ਸਕਿੰਟ' },
}

const SUBTITLE_MAP: Record<string, string> = {
  en: 'File cybercrime complaints, obtain applicable legal sections, and initiate bank freeze steps without navigating complicated bureaucratic questionnaires.',
  hi: 'बिना किसी जटिल कानूनी फॉर्म के साइबर धोखाधड़ी की शिकायत दर्ज करें, सही धाराएं प्राप्त करें और बैंक खाता फ्रीज कराने की प्रक्रिया शुरू करें।',
  bn: 'জটিল ফর্ম পূরণ ছাড়াই সাইবার প্রতারণার অভিযোগ দায়ের করুন, আইনি ধারা জানুন এবং ব্যাংক অ্যাকাউন্ট ফ্রিজ করার প্রক্রিয়া শুরু করুন।',
  mr: 'जटिल फॉर्म न भरता सायबर फसवणुकीची तक्रार नोंदवा, योग्य कायदेशीर कलमे मिळवा आणि बँक खाते गोठवण्याची प्रक्रिया सुरू करा.',
  te: 'సంక్లిష్టమైన ఫారమ్‌లు లేకుండా సైబర్ క్రైమ్ ఫిర్యాదులను నమోదు చేయండి, సంబంధిత చట్ట విభాగాలను పొందండి మరియు బ్యాంక్ ఫ్రీజ్ ప్రక్రియను ప్రారంభించండి.',
  ta: 'சிக்கலான படிவங்கள் இல்லாமல் சைபர் குற்றப் புகார்களைப் பதிவு செய்து, சட்டப் பிரிவுகளைப் பெற்று, வங்கி முடக்க நடவடிக்கையைத் தொடங்குங்கள்.',
  gu: 'કોઈપણ જટિલ ફોર્મ વગર સાયબર છેતરપિંડીની ફરિયાદ નોંધાવો, કાનૂની કલમો મેળવો અને બેંક એકાઉન્ટ ફ્રીઝ કરવાની પ્રક્રિયા શરૂ કરો.',
  ur: 'کسی پیچیدہ فارم کے بغیر سائبر کرائم کی شکایت درج کریں، قانونی دفعات حاصل کریں اور بینک اکاؤنٹ فریز کرنے کا عمل شروع کریں۔',
  kn: 'ಯಾವುದೇ ಸಂಕೀರ್ಣ ಫಾರ್ಮ್‌ಗಳಿಲ್ಲದೆ ಸೈಬರ್ ಅಪರಾಧ ದೂರುಗಳನ್ನು ಸಲ್ಲಿಸಿ, ಕಾನೂನು ವಿಭಾಗಗಳನ್ನು ಪಡೆಯಿರಿ ಮತ್ತು ಬ್ಯಾಂಕ್ ಖಾತೆ ಫ್ರೀಜ್ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ.',
  or: 'କୌଣସି ଜଟିଳ ଫର୍ମ ବିନା ସାଇବର୍ ଅପରାଧ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ, ଆଇନଗତ ଧାରା ଜାଣନ୍ତୁ ଏବଂ ବ୍ୟାଙ୍କ ଖାତା ଫ୍ରିଜ୍ ପ୍ରକ୍ରିୟା ଆରମ୍ଭ କରନ୍ତୁ।',
  ml: 'സങ്കീർണ്ണമായ ഫോമുകളില്ലാതെ സൈബർ കുറ്റകൃത്യ പരാതികൾ നൽകുക, നിയമ വകുപ്പുകൾ നേടുക, ബാങ്ക് അക്കൗണ്ട് ഫ്രീസ് ചെയ്യുക.',
  pa: 'ਬਿਨਾਂ ਕਿਸੇ ਗੁੰਝਲਦਾਰ ਫਾਰਮ ਦੇ ਸਾਈਬਰ ਅਪਰਾਧ ਦੀ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ, ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ ਅਤੇ ਬੈਂਕ ਖਾਤਾ ਫ੍ਰੀਜ਼ ਕਰਨ ਦੀ ਪ੍ਰਕਿਰਿਆ ਸ਼ੁਰੂ ਕਰੋ।',
}

export default function HowItWorks({ language }: HowItWorksProps) {
  const isHi = language === 'hi'
  const isEn = language === 'en'
  const t = getTranslation(language)
  const durations = DURATION_MAP[language] || DURATION_MAP.en
  const subtitle = SUBTITLE_MAP[language] || SUBTITLE_MAP.en

  const steps: StepItem[] = [
    {
      n: '01',
      duration: durations.s1,
      title: t.howItWorks.step1Title,
      body: t.howItWorks.step1Desc,
      points: isHi
        ? [
            { icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />, text: 'व्हाट्सएप AI एजेंट व सिम्युलेटर' },
            { icon: <Mic className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'बोलकर या लिखकर त्वरित शिकायत' },
            { icon: <FileImage className="w-3.5 h-3.5 text-amber-600 shrink-0" />, text: 'लेनदेन रसीद व स्क्रीनशॉट ऑटो-रीडिंग' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'डिजीलॉकर से सुरक्षित आधार सत्यापन' },
          ]
        : [
            { icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />, text: 'WhatsApp AI agent & web simulator' },
            { icon: <Mic className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'Voice & text reporting in 12 languages' },
            { icon: <FileImage className="w-3.5 h-3.5 text-amber-600 shrink-0" />, text: 'Auto-reads receipts & screenshots' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'DigiLocker verified citizen identity' },
          ],
      shot: '/landing/shot-intake.png',
    },
    {
      n: '02',
      duration: durations.s2,
      title: t.howItWorks.step2Title,
      body: t.howItWorks.step2Desc,
      points: isHi
        ? [
            { icon: <Scale className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'IT एक्ट और BNS की कानूनी धाराएं' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'धोखेबाज़ का खाता, UPI व UTR नंबर' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />, text: 'तैयार औपचारिक पुलिस शिकायत पत्र' },
            { icon: <FileImage className="w-3.5 h-3.5 text-zinc-600 shrink-0" />, text: 'सुरक्षित डिजिटल एविडेंस रिकॉर्ड' },
          ]
        : [
            { icon: <Scale className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'Mapped IT Act & BNS legal sections' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'Extracted UTR, bank account & UPI' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />, text: 'Dual-draft formal police complaint' },
            { icon: <FileImage className="w-3.5 h-3.5 text-zinc-600 shrink-0" />, text: 'Cryptographic evidence vault' },
          ],
      shot: '/landing/shot-dashboard.png',
    },
    {
      n: '03',
      duration: durations.s3,
      title: t.howItWorks.step3Title,
      body: t.howItWorks.step3Desc,
      points: isHi
        ? [
            { icon: <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />, text: '1930 ऑपरेटर को बताने के मुख्य बिंदु' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'बैंक नोडल अधिकारी को खाता फ्रीज नोटिस' },
            { icon: <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />, text: 'व्हाट्सएप से स्वतः केस अपडेट' },
            { icon: <Clock className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'लाइव केस स्टेटस और PDF डाउनलोड' },
          ]
        : [
            { icon: <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />, text: '1930 helpline operator briefing points' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'Bank nodal officer freeze notice' },
            { icon: <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />, text: 'Automatic WhatsApp case tracking' },
            { icon: <Clock className="w-3.5 h-3.5 text-primary shrink-0" />, text: 'Live tracking portal & printable PDF' },
          ],
      shot: '/landing/shot-complaints.png',
    },
  ]

  return (
    <section id="how-it-works" className="py-14 sm:py-20 md:py-24 bg-surface border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 sm:mb-14 md:mb-16 max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            {t.howItWorks.eyebrow}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="space-y-16 sm:space-y-24 md:space-y-36">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className={`grid lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
            >
              {/* Text column (5 cols) */}
              <div className="lg:col-span-5">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <span className="text-sm sm:text-base font-mono font-extrabold text-primary bg-primary-tint border border-primary/20 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                    {step.n}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg shadow-2xs">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    {step.duration}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-snug">{step.title}</h3>
                <p className="mt-3 sm:mt-4 text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base md:text-[17px]">{step.body}</p>

                {/* Grounded feature point list */}
                <div className="mt-5 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {step.points.map((point, ptIdx) => (
                    <div
                      key={ptIdx}
                      className="flex items-start gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs"
                    >
                      <span className="shrink-0 mt-0.5">{point.icon}</span>
                      <span className="leading-snug">{point.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screenshot column: 7 cols (Generous width & natural height, noticeable details) */}
              <div className="lg:col-span-7">
                <div className="rounded-xl sm:rounded-[18px] border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.04)] sm:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.06)] group">
                  {/* Browser top chrome bar */}
                  <div className="h-8 md:h-9 px-3 sm:px-4 bg-zinc-100/90 dark:bg-zinc-850 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600 block" />
                    </div>
                    <span className="text-[11px] md:text-xs font-mono text-zinc-400 dark:text-zinc-500 tracking-tight select-none">
                      {step.n === '01' ? 'samarthan.gov.in/intake' : step.n === '02' ? 'samarthan.gov.in/dossier' : 'samarthan.gov.in/complaints'}
                    </span>
                    <span className="w-3" />
                  </div>
                  {/* Screenshot display */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.shot}
                      alt={step.title}
                      className="w-full h-auto object-cover object-top block transition-transform duration-500 group-hover:scale-[1.012]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
