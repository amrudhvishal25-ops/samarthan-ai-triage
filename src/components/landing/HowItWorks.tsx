'use client'

import { motion } from 'framer-motion'

interface HowItWorksProps {
  language: 'en' | 'hi'
}

const EN = {
  eyebrow: 'How it works',
  title: 'Three steps. Sixty seconds.',
  steps: [
    {
      n: '01',
      title: 'Speak, type, or upload',
      body: 'Describe what happened in your own words using a voice note, a few lines of text, or a screenshot of the scam message. No forms, no 15-field questionnaire.',
      shot: '/landing/shot-intake.jpg',
    },
    {
      n: '02',
      title: 'AI triages the incident',
      body: 'It classifies the fraud, pulls out the fraudster’s number, the beneficiary account, the money trail and the UTR, then cites the exact IT Act sections and drafts a formal complaint in Hindi and English.',
      shot: '/landing/shot-dashboard.jpg',
    },
    {
      n: '03',
      title: 'Act inside the golden hour',
      body: 'Call 1930, notify the bank nodal officer, or file on cybercrime.gov.in with the right channel pre-filled for your case. Track the complaint until it is resolved.',
      shot: '/landing/shot-complaints.png',
    },
  ],
}

const HI = {
  eyebrow: 'यह कैसे काम करता है',
  title: 'तीन कदम। साठ सेकंड।',
  steps: [
    {
      n: '01',
      title: 'बोलें, लिखें, या अपलोड करें',
      body: 'अपने शब्दों में बताएं क्या हुआ: वॉइस नोट, कुछ पंक्तियाँ टेक्स्ट, या धोखाधड़ी संदेश का स्क्रीनशॉट। कोई फॉर्म नहीं, कोई 15-फील्ड प्रश्नावली नहीं।',
      shot: '/landing/shot-intake.jpg',
    },
    {
      n: '02',
      title: 'AI घटना का ट्रायज करता है',
      body: 'यह धोखाधड़ी वर्गीकृत करता है, धोखेबाज़ का नंबर, लाभार्थी खाता, मनी ट्रेल और UTR निकालता है, फिर सटीक IT एक्ट धाराएं बताता है और हिंदी-अंग्रेज़ी दोनों में औपचारिक शिकायत ड्राफ्ट करता है।',
      shot: '/landing/shot-dashboard.jpg',
    },
    {
      n: '03',
      title: 'गोल्डन ऑवर में कार्रवाई करें',
      body: '1930 पर कॉल करें, बैंक के नोडल अधिकारी को सूचित करें, या cybercrime.gov.in पर दर्ज करें। आपके मामले के लिए सही चैनल, पहले से भरा हुआ। हल होने तक शिकायत ट्रैक करें।',
      shot: '/landing/shot-complaints.png',
    },
  ],
}

export default function HowItWorks({ language }: HowItWorksProps) {
  const c = language === 'hi' ? HI : EN

  return (
    <section id="how-it-works" className="py-24 bg-[#FAFAF8] border-t border-zinc-200/80">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2.5">{c.eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">{c.title}</h2>
        </div>

        <div className="space-y-20">
          {c.steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5 }}
              className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
            >
              <div>
                <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-none">{step.n}</span>
                <h3 className="mt-3 text-2xl font-bold text-[#0A0A0A]">{step.title}</h3>
                <p className="mt-4 text-zinc-600 leading-relaxed text-[15px]">{step.body}</p>
              </div>
              <div className="rounded-none border border-zinc-300/80 bg-white shadow-xs overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={step.shot} alt={step.title} className="w-full h-auto max-h-[420px] object-cover object-top" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
