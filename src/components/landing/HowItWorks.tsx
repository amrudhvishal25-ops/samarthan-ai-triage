import React from 'react'
import { Clock } from 'lucide-react'

interface HowItWorksProps {
  language: 'en' | 'hi'
}

interface StepItem {
  n: string
  timeWindow: string
  title: string
  body: string
  chips: string[]
  shot: string
}

const EN = {
  eyebrow: 'How it works',
  title: 'Three steps. Sixty seconds.',
  subtitle: 'How Samarthan compresses 45 minutes of tedious administrative runaround into 60 seconds — powered by Web intake, 24x7 WhatsApp AI triage, and real-time database sync.',
  steps: [
    {
      n: '01',
      timeWindow: '00:00 – 00:15s',
      title: 'Zero-Form Intake on Web or WhatsApp',
      body: 'Report your incident in your own words in conversational Hindi or English. Speak into the mic, drop a voice note, or upload a transaction screenshot. Connect directly via our 24x7 WhatsApp Bot (+91 63038 07967), the zero-download In-App WhatsApp Simulator, or the Web portal with 1-click DigiLocker identity verification. No 15-field questionnaires.',
      chips: [
        '💬 24x7 WhatsApp Bot (+91 63038 07967)',
        '📱 In-App WhatsApp Simulator',
        '🎙️ Bilingual Voice Notes (Hindi/English)',
        '📸 Scam Receipt & Payment Screenshot OCR',
        '🔒 1-Click DigiLocker Identity Verification',
      ],
      shot: '/landing/shot-intake.jpg',
    },
    {
      n: '02',
      timeWindow: '00:15 – 00:35s',
      title: 'Automated Forensic Triage & IT Act Mapping',
      body: 'The AI classifies the cybercrime category (UPI fraud, investment scam, sextortion, fake profile), extracts critical forensics — 12-digit UTR, fraudster UPI ID, beneficiary bank account, and scam phone numbers — and cites the exact statutory sections under the IT Act (66C, 66D, 66E) and Bharatiya Nyaya Sanhita (BNS). It generates a formal FIR-ready complaint in Hindi and English.',
      chips: [
        '⚖️ Auto IT Act (66C/66D/66E) & BNS Sections',
        '🔍 Automated Forensic Extraction (UTR, UPI, A/C)',
        '📄 Bilingual FIR-Ready Complaint Draft',
        '🛡️ Cryptographic Evidence Vault Recording',
      ],
      shot: '/landing/shot-dashboard.jpg',
    },
    {
      n: '03',
      timeWindow: '00:35 – 00:60s',
      title: 'Golden-Hour Fund Freeze & Continuous Live Sync',
      body: 'Act immediately within the golden hour with pre-filled 1930 Helpline operator scripts, 1-click bank nodal officer freeze advisories, and official NCRP submission. Ongoing updates — such as subsequent fraud messages, bank SMS, or new UTRs sent on WhatsApp or the Web — automatically append to your active Neon DB dossier in the same thread without restarting.',
      chips: [
        '📞 1930 Helpline Operator Script Hand-off',
        '🏦 Bank Nodal Officer Account Freeze Advisory',
        '🔄 Continuous WhatsApp Auto-Updates (Neon DB Sync)',
        '🌐 Live Status Tracking & PDF Formal Dossier',
      ],
      shot: '/landing/shot-complaints.png',
    },
  ] as StepItem[],
}

const HI = {
  eyebrow: 'यह कैसे काम करता है',
  title: 'तीन कदम। साठ सेकंड।',
  subtitle: 'समर्थन कैसे 45 मिनट की जटिल कागजी कार्रवाई को 60 सेकंड में बदलता है — वेब इनटेक, 24x7 व्हाट्सएप AI ट्रायज और रियल-टाइम डेटाबेस सिंक द्वारा संचालित।',
  steps: [
    {
      n: '01',
      timeWindow: '00:00 – 00:15s',
      title: 'वेब या व्हाट्सएप पर बिना फॉर्म इनटेक',
      body: 'अपनी स्वाभाविक भाषा (हिंदी या अंग्रेजी) में बोलें, वॉयस नोट भेजें या लेनदेन का स्क्रीनशॉट अपलोड करें। हमारे 24x7 व्हाट्सएप बॉट (+91 63038 07967), सीधे इन-ऐप व्हाट्सएप सिम्युलेटर, या डिजीलॉकर पहचान सत्यापन के साथ वेब पोर्टल पर रिपोर्ट करें। कोई 15-फील्ड जटिल फॉर्म नहीं।',
      chips: [
        '💬 24x7 व्हाट्सएप बॉट (+91 63038 07967)',
        '📱 इन-ऐप व्हाट्सएप सिम्युलेटर',
        '🎙️ द्विभाषी वॉयस नोट्स (हिंदी/अंग्रेजी)',
        '📸 पेमेंट स्क्रीनशॉट व रसीद OCR',
        '🔒 1-क्लिक डिजीलॉकर पहचान सत्यापन',
      ],
      shot: '/landing/shot-intake.jpg',
    },
    {
      n: '02',
      timeWindow: '00:15 – 00:35s',
      title: 'ऑटोमेटेड फॉरेंसिक ट्रायज और कानूनी मैपिंग',
      body: 'हमारा AI तुरंत साइबर अपराध की श्रेणी (UPI फ्रॉड, निवेश स्कैम, जबरन वसूली, फर्जी प्रोफाइल) वर्गीकृत करता है, 12-अंकों का UTR, बैंक खाता, धोखेबाज़ का UPI ID और फोन नंबर निकालता है, और IT एक्ट (धारा 66C, 66D, 66E) तथा भारतीय न्याय संहिता (BNS) की धाराएं जोड़ता है। हिंदी और अंग्रेजी दोनों में आधिकारिक FIR शिकायत तैयार होती है।',
      chips: [
        '⚖️ स्वचालित IT एक्ट (66C/66D) व BNS धाराएं',
        '🔍 फॉरेंसिक डेटा निष्कर्षण (UTR, खाता, UPI)',
        '📄 हिंदी-अंग्रेजी आधिकारिक FIR शिकायत ड्राफ्ट',
        '🛡️ अखंडता प्रमाण के साथ एविडेंस वॉल्ट',
      ],
      shot: '/landing/shot-dashboard.jpg',
    },
    {
      n: '03',
      timeWindow: '00:35 – 00:60s',
      title: 'गोल्डन ऑवर खाता फ्रीज और निरंतर लाइव सिंक',
      body: 'महत्वपूर्ण गोल्डन ऑवर में सीधे 1930 हेल्पलाइन ऑपरेटर स्क्रिप्ट, बैंक नोडल अधिकारी खाता फ्रीज ड्राफ्ट और आधिकारिक NCRP सबमिशन के साथ तुरंत कार्रवाई करें। निरंतर केस अपडेट — जैसे व्हाट्सएप या वेब पर भेजा गया नया UTR, बैंक SMS या अतिरिक्त सबूत — बिना नया फॉर्म भरे सीधे आपकी Neon DB फाइल में स्वतः जुड़ते हैं।',
      chips: [
        '📞 1930 ऑपरेटर हैंड-ऑफ स्क्रिप्ट',
        '🏦 बैंक नोडल अधिकारी खाता फ्रीज ड्राफ्ट',
        '🔄 निरंतर व्हाट्सएप ऑटो-अपडेट (Neon DB सिंक)',
        '🌐 लाइव स्थिति ट्रैकिंग और PDF FIR डॉसियर',
      ],
      shot: '/landing/shot-complaints.png',
    },
  ] as StepItem[],
}

export default function HowItWorks({ language }: HowItWorksProps) {
  const c = language === 'hi' ? HI : EN

  return (
    <section id="how-it-works" className="py-24 bg-surface border-t border-zinc-200/80">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2.5">{c.eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{c.title}</h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {c.subtitle}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="space-y-20">
          {c.steps.map((step, i) => (
            <div
              key={step.n}
              className={`grid md:grid-cols-2 gap-10 lg:gap-14 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
            >
              {/* Text column */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-1 rounded-md">
                    {step.n}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {step.timeWindow}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-foreground tracking-tight">{step.title}</h3>
                <p className="mt-4 text-zinc-600 dark:text-zinc-300 leading-relaxed text-[15px]">{step.body}</p>

                {/* Feature Chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {step.chips.map((chip, chipIdx) => (
                    <span
                      key={chipIdx}
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xs"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screenshot column */}
              <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={step.shot} alt={step.title} className="w-full h-auto max-h-[420px] object-cover object-top" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
