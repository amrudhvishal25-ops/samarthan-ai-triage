'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Check, X, ArrowRight } from 'lucide-react'

interface ComparisonTableProps {
  language: 'en' | 'hi'
}

export default function ComparisonTable({ language }: ComparisonTableProps) {
  const isHi = language === 'hi'

  const samarthanPoints = [
    {
      en: "Triage & formal complaint ready in under 60 seconds",
      hi: "60 सेकंड के भीतर औपचारिक शिकायत और कानूनी ट्रायज तैयार"
    },
    {
      en: "Zero typing required — conversational Hindi & English voice intake",
      hi: "बिना टाइप किए बोलकर शिकायत — हिंदी और अंग्रेजी वॉइस इनटेक"
    },
    {
      en: "1-click identity verification with DigiLocker (Aadhaar/PAN)",
      hi: "डिजीलॉकर के साथ 1-क्लिक पहचान सत्यापन (आधार/पैन)"
    },
    {
      en: "Direct 1930 Helpline operator handoff with pre-filled case brief",
      hi: "1930 हेल्पलाइन ऑपरेटर को पूरा केस डेटा सीधे ट्रांसफर"
    },
    {
      en: "Actionable bank freeze guide with UTR & account transaction tracking",
      hi: "UTR और खाता लेनदेन ट्रैकिंग के साथ बैंक खाता फ्रीज गाइड"
    },
    {
      en: "Auto-detected IT Act & BNS legal sections for instant FIR",
      hi: "त्वरित FIR के लिए IT एक्ट और BNS की कानूनी धाराएं"
    },
    {
      en: "Built-in cryptographic Evidence Vault with tamper-proof logs",
      hi: "अखंडता प्रमाण के साथ इन-बिल्ट सुरक्षित एविडेंस वॉल्ट"
    },
    {
      en: "24x7 WhatsApp companion bot for automated live case updates",
      hi: "रियल-टाइम केस अपडेट के लिए 24x7 व्हाट्सएप बॉट साथी"
    }
  ]

  const othersPoints = [
    {
      en: "30 to 45 minutes of tedious 15+ mandatory form fields",
      hi: "15+ जटिल फॉर्म भरने में 30 से 45 मिनट का भारी समय"
    },
    {
      en: "Text-only forms with zero voice or regional language accessibility",
      hi: "केवल टेक्स्ट फॉर्म — कोई वॉयस या क्षेत्रीय भाषा सहायता नहीं"
    },
    {
      en: "Manual name/ID entry with no verified authentication proof",
      hi: "बिना आधिकारिक सत्यापन के केवल अनवेरिफाइड डेटा प्रविष्टि"
    },
    {
      en: "Helpline phone lines frequently busy with zero digital context",
      hi: "व्यस्त हेल्पलाइन लाइन्स — ऑपरेटर को कोई पूर्व केस डेटा नहीं मिलता"
    },
    {
      en: "Victims left alone to locate bank nodal officers & freeze accounts",
      hi: "बैंक खाता फ्रीज कराने के लिए पीड़ित को खुद भागदौड़ करनी पड़ती है"
    },
    {
      en: "No legal section detection — victims struggle with police IPC/BNS",
      hi: "कानूनी धाराओं की कोई पहचान नहीं — पुलिस में FIR कराने में असमर्थ"
    },
    {
      en: "Messy email attachments with no chain-of-custody preservation",
      hi: "अव्यवस्थित ईमेल अटैचमेंट — कोर्ट में सबूतों की वैधता पर सवाल"
    },
    {
      en: "Static manual portal lookups with no proactive notifications",
      hi: "बिना किसी सक्रिय नोटिफिकेशन के पोर्टल पर बार-बार स्टेटस चेक करना"
    }
  ]

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
    <section id="comparison" className="py-24 bg-white border-t border-zinc-200">
      <div className="max-w-5xl mx-auto px-6">
        {/* Top Centered Pill Badge */}
        <div className="flex justify-center mb-5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-300 rounded-none shadow-xs text-xs font-semibold text-zinc-800 tracking-tight"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span>{isHi ? "समर्थन क्यों?" : "Why Samarthan"}</span>
          </motion.div>
        </div>

        {/* Headline & Subheadline */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight"
          >
            {isHi ? "पहले दिन से अलग, उद्देश्यपूर्ण।" : "Built differently, on purpose"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="text-zinc-500 text-sm md:text-base mt-4 leading-relaxed"
          >
            {isHi
              ? "हमने उन महत्वपूर्ण 'गोल्डन ऑवर' विवरणों पर ध्यान केंद्रित किया जिन्हें पारंपरिक पोर्टल अनदेखा कर देते हैं। जानिए इसका साइबर पीड़ितों के लिए क्या मतलब है।"
              : "We obsessed over the critical golden hour details legacy systems ignore. Here is what that means for victims every single second."}
          </motion.p>
        </div>

        {/* Two-Column Side-by-Side Cards (Us vs. Them) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* LEFT CARD: Samarthan (Recommended / Hero) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border-2 border-zinc-950 rounded-none p-7 md:p-8 flex flex-col justify-between shadow-sm relative hover:border-zinc-900 transition-colors"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-zinc-950 tracking-tight">
                  {isHi ? "समर्थन" : "Samarthan"}
                </h3>
                <span className="bg-zinc-950 text-white text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-none font-semibold">
                  {isHi ? "अनुशंसित" : "Recommended"}
                </span>
              </div>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                {isHi
                  ? "गोल्डन ऑवर में वह सब कुछ जो एक पीड़ित को चाहिए, बिना प्रशासनिक झंझट के।"
                  : "Everything a victim needs in the golden hour, without the administrative runaround."}
              </p>

              {/* Divider */}
              <div className="border-b border-zinc-200 my-6" />

              {/* Checkmark List */}
              <ul className="space-y-4">
                {samarthanPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-zinc-950 text-white flex items-center justify-center shrink-0 rounded-none mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 leading-snug">
                      {isHi ? point.hi : point.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-8">
              <button
                onClick={handleScrollToReport}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold py-3.5 px-6 rounded-none text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer group shadow-xs"
              >
                <span>{isHi ? "मुफ़्त शिकायत दर्ज करें" : "Start for Free"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>

          {/* RIGHT CARD: The others (Traditional Portals) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-zinc-50/70 border border-zinc-300 rounded-none p-7 md:p-8 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold text-zinc-800 tracking-tight">
                  {isHi ? "पारंपरिक पोर्टल" : "The others"}
                </h3>
              </div>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                {isHi
                  ? "पारंपरिक पुलिस और सरकारी पोर्टलों पर पीड़ितों द्वारा झेली जाने वाली सामान्य रुकावटें।"
                  : "Common friction points victims encounter with legacy reporting platforms."}
              </p>

              {/* Divider */}
              <div className="border-b border-zinc-200 my-6" />

              {/* Cross Points List */}
              <ul className="space-y-4">
                {othersPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-zinc-200/90 text-zinc-400 flex items-center justify-center shrink-0 rounded-none mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                    <span className="text-sm text-zinc-500 leading-snug">
                      {isHi ? point.hi : point.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-8">
              <button
                onClick={handleScrollToHowItWorks}
                className="w-full bg-zinc-200/70 hover:bg-zinc-200 text-zinc-700 font-semibold py-3.5 px-6 rounded-none text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer group"
              >
                <span>{isHi ? "देखें पीड़ित समर्थन क्यों चुनते हैं" : "See Why Victims Switch"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

