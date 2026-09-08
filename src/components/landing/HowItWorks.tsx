import React from 'react'
import { Clock, MessageSquare, Mic, FileImage, ShieldCheck, Scale, Phone, Building2, RefreshCw } from 'lucide-react'

interface HowItWorksProps {
  language: 'en' | 'hi'
}

interface StepItem {
  n: string
  duration: string
  title: string
  body: string
  points: { icon: React.ReactNode; text: string }[]
  shot: string
}

export default function HowItWorks({ language }: HowItWorksProps) {
  const isHi = language === 'hi'

  const steps: StepItem[] = isHi
    ? [
        {
          n: '01',
          duration: 'लगभग 15 सेकंड',
          title: 'अपनी बात सीधे बताएं, कोई लंबा फॉर्म नहीं',
          body: 'अपनी सामान्य भाषा में बोलें, संदेश लिखें या बैंक से आया मैसेज और स्क्रीनशॉट भेजें। आप वेबसाइट के ज़रिए रिपोर्ट कर सकते हैं, हमारे व्हाट्सएप नंबर (+91 63038 07967) पर भेज सकते हैं, या ब्राउज़र में सीधे व्हाट्सएप सिम्युलेटर आज़मा सकते हैं। पहचान के लिए डिजीलॉकर से तुरंत सत्यापन की सुविधा भी है।',
          points: [
            { icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />, text: 'व्हाट्सएप बॉट (+91 63038 07967) व सिम्युलेटर' },
            { icon: <Mic className="w-3.5 h-3.5 text-primary" />, text: 'हिंदी और अंग्रेजी में बोलकर शिकायत' },
            { icon: <FileImage className="w-3.5 h-3.5 text-amber-600" />, text: 'लेनदेन रसीद और स्क्रीनशॉट से ऑटो-रीडिंग' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-primary" />, text: 'डिजीलॉकर से सुरक्षित आधार/पैन सत्यापन' },
          ],
          shot: '/landing/shot-intake.jpg',
        },
        {
          n: '02',
          duration: 'लगभग 20 सेकंड',
          title: 'मामले की जांच और कानूनी धाराओं की पहचान',
          body: 'सिस्टम अपराध के प्रकार को समझकर धोखेबाज़ की UPI आईडी, बैंक खाता, 12 अंकों का UTR नंबर और फोन नंबर अलग से दर्ज कर लेता है। इसके बाद मामले के अनुसार IT एक्ट और भारतीय न्याय संहिता की सही धाराएं जोड़कर हिंदी और अंग्रेजी में पुलिस शिकायत पत्र तैयार कर देता है।',
          points: [
            { icon: <Scale className="w-3.5 h-3.5 text-primary" />, text: 'IT एक्ट और BNS की जरूरी कानूनी धाराएं' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, text: 'धोखेबाज़ का खाता, UPI और UTR नंबर की पहचान' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />, text: 'हिंदी और अंग्रेजी में तैयार पुलिस शिकायत' },
            { icon: <FileImage className="w-3.5 h-3.5 text-zinc-600" />, text: 'सुरक्षित डिजिटल एविडेंस रिकॉर्ड' },
          ],
          shot: '/landing/shot-dashboard.jpg',
        },
        {
          n: '03',
          duration: 'लगभग 25 सेकंड',
          title: 'खाता फ्रीज करने की तैयारी और केस अपडेट',
          body: 'गोल्डन ऑवर में पैसे को आगे ट्रांसफर होने से रोकने के लिए 1930 हेल्पलाइन पर बोलने योग्य जरूरी बातें और बैंक नोडल अधिकारी के लिए खाता फ्रीज ईमेल तैयार मिलता है। अगर बाद में धोखेबाज़ का नया मैसेज या कोई और UTR मिले, तो बस व्हाट्सएप या वेबसाइट पर भेज दें। वह बिना नया फॉर्म भरे पुरानी शिकायत में ही जुड़ जाएगा।',
          points: [
            { icon: <Phone className="w-3.5 h-3.5 text-red-600" />, text: '1930 हेल्पलाइन ऑपरेटर को बताने के मुख्य बिंदु' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, text: 'बैंक नोडल अधिकारी को खाता फ्रीज अनुरोध' },
            { icon: <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />, text: 'व्हाट्सएप से नई जानकारी स्वतः शिकायत में दर्ज' },
            { icon: <Clock className="w-3.5 h-3.5 text-primary" />, text: 'लाइव केस स्टेटस ट्रैकिंग और PDF डाउनलोड' },
          ],
          shot: '/landing/shot-complaints.png',
        },
      ]
    : [
        {
          n: '01',
          duration: 'Takes ~15 seconds',
          title: 'Explain what happened in plain words, without forms',
          body: 'Describe the incident naturally using voice, text, or a screenshot of the scam transaction. You can use the web portal, message our WhatsApp assistant at +91 63038 07967, or try the in-browser simulator. DigiLocker is available for quick citizen identity verification.',
          points: [
            { icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />, text: 'WhatsApp assistant (+91 63038 07967) and web simulator' },
            { icon: <Mic className="w-3.5 h-3.5 text-primary" />, text: 'Spoken voice reporting in Hindi or English' },
            { icon: <FileImage className="w-3.5 h-3.5 text-amber-600" />, text: 'Automatic details from payment receipts and screenshots' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-primary" />, text: 'Official DigiLocker identity confirmation' },
          ],
          shot: '/landing/shot-intake.jpg',
        },
        {
          n: '02',
          duration: 'Takes ~20 seconds',
          title: 'Incident review and applicable legal sections',
          body: 'The system identifies the type of fraud and extracts actionable details like the 12-digit UTR, suspect UPI handle, destination bank account, and phone numbers. It matches applicable provisions under the IT Act and BNS, then formats an official FIR complaint in English and Hindi.',
          points: [
            { icon: <Scale className="w-3.5 h-3.5 text-primary" />, text: 'Mapped IT Act and BNS criminal sections' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, text: 'Extracted UTR, recipient account, and UPI details' },
            { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />, text: 'FIR-ready complaint in Hindi and English' },
            { icon: <FileImage className="w-3.5 h-3.5 text-zinc-600" />, text: 'Chain-of-custody evidence preservation' },
          ],
          shot: '/landing/shot-dashboard.jpg',
        },
        {
          n: '03',
          duration: 'Takes ~25 seconds',
          title: 'Emergency account freeze and continuous updates',
          body: 'During the golden hour, victims receive a clear script for the 1930 helpline and an account freeze notice addressed to the bank nodal officer. Any new information received later, such as follow-up bank SMS or extra transaction IDs sent on WhatsApp, is automatically added to the existing record.',
          points: [
            { icon: <Phone className="w-3.5 h-3.5 text-red-600" />, text: 'Prepared talking points for 1930 helpline staff' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, text: 'Draft notice for bank nodal officers to freeze accounts' },
            { icon: <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />, text: 'New WhatsApp messages update the active case automatically' },
            { icon: <Clock className="w-3.5 h-3.5 text-primary" />, text: 'Live tracking portal and printable PDF dossier' },
          ],
          shot: '/landing/shot-complaints.png',
        },
      ]

  return (
    <section id="how-it-works" className="py-28 md:py-36 bg-surface border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-20 md:mb-24 max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-3.5">
            {isHi ? 'प्रक्रिया • 60 सेकंड समाधान' : 'The Process • 60-Second Resolution'}
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.08]">
            {isHi ? 'तीन सरल कदम। एक मिनट में समाधान।' : 'Three clear steps. Finished in under a minute.'}
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal max-w-3xl mx-auto">
            {isHi
              ? 'बिना किसी जटिल कानूनी फॉर्म के साइबर धोखाधड़ी की शिकायत दर्ज करें, सही धाराएं प्राप्त करें और बैंक खाता फ्रीज कराने की प्रक्रिया शुरू करें।'
              : 'File cybercrime complaints, obtain applicable legal sections, and initiate bank freeze steps without navigating complicated bureaucratic questionnaires.'}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="space-y-28 md:space-y-36">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
            >
              {/* Text column (5 cols) */}
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-base font-mono font-extrabold text-primary bg-primary-tint border border-primary/20 px-3 py-1 rounded-lg">
                    {step.n}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-lg shadow-2xs">
                    <Clock className="w-4 h-4 text-primary" />
                    {step.duration}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">{step.title}</h3>
                <p className="mt-4 text-zinc-600 dark:text-zinc-300 leading-relaxed text-base sm:text-[17px]">{step.body}</p>

                {/* Grounded feature point list */}
                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {step.points.map((point, ptIdx) => (
                    <div
                      key={ptIdx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs"
                    >
                      <span className="shrink-0 mt-0.5">{point.icon}</span>
                      <span className="leading-snug">{point.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screenshot column: 7 cols (Generous width & natural height, noticeable details) */}
              <div className="lg:col-span-7">
                <div className="rounded-[18px] border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.06)] group">
                  {/* Browser top chrome bar */}
                  <div className="h-8 md:h-9 px-4 bg-zinc-100/90 dark:bg-zinc-850 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
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
