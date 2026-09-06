'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface ComparisonTableProps {
  language: 'en' | 'hi'
}

export default function ComparisonTable({ language }: ComparisonTableProps) {
  const isHi = language === 'hi'

  const features = [
    {
      label: isHi ? "फाइल करने का समय" : "Filing time",
      trad: isHi ? "30-45 मिनट" : "30-45 minutes",
      sam: isHi ? "60 सेकंड" : "60 seconds",
      highlight: true
    },
    {
      label: isHi ? "इनपुट का तरीका" : "Input method",
      trad: isHi ? "15+ फॉर्म फील्ड्स" : "15+ form fields",
      sam: isHi ? "बस बोलें" : "Just speak",
      highlight: false
    },
    {
      label: isHi ? "पहचान सत्यापन" : "Identity verification",
      trad: isHi ? "मैनुअल एंट्री" : "Manual entry",
      sam: isHi ? "DigiLocker प्रमाणित" : "DigiLocker verified",
      highlight: true
    },
    {
      label: isHi ? "कानूनी मार्गदर्शन" : "Legal guidance",
      trad: isHi ? "कोई नहीं" : "None",
      sam: isHi ? "स्वचालित IT एक्ट धाराएं" : "Auto-detected IT Act sections",
      highlight: false
    },
    {
      label: isHi ? "शिकायत का ड्राफ्ट" : "Complaint draft",
      trad: isHi ? "खुद लिखें" : "Write yourself",
      sam: isHi ? "AI द्वारा द्विभाषी ड्राफ्ट" : "AI-generated bilingual draft",
      highlight: false
    },
    {
      label: isHi ? "फ़ॉलो-अप और स्टेटस" : "Follow-up & updates",
      trad: isHi ? "पोर्टल पर मैनुअल जांच" : "Check portal manually",
      sam: isHi ? "AI के साथ निरंतर अपडेट" : "Continuous updates with AI",
      highlight: false
    },
    {
      label: isHi ? "सबूत प्रबंधन" : "Evidence management",
      trad: isHi ? "ईमेल अटैचमेंट" : "Email attachments",
      sam: isHi ? "इन-बिल्ट एविडेंस वॉल्ट" : "Built-in evidence vault",
      highlight: false
    }
  ]

  return (
    <section id="comparison" className="py-24 bg-white border-t border-zinc-200/80">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2.5">
            {isHi ? "समर्थन क्यों?" : "Why Samarthan?"}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-950 tracking-tight">
            {isHi ? "पहले दिन से अलग।" : "Built different from day one."}
          </h2>
        </div>

        {/* Sharper, cleaner table container */}
        <div className="w-full bg-white border border-zinc-300 rounded-xl overflow-hidden shadow-xs">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.6fr] border-b border-zinc-200">
            <div className="bg-zinc-50/80 px-6 py-4 text-xs font-bold text-zinc-600 uppercase tracking-wider border-r border-zinc-200 flex items-center">
              {isHi ? "सुविधा" : "Feature"}
            </div>
            <div className="bg-zinc-50/80 px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-r border-zinc-200 flex items-center">
              {isHi ? "पारंपरिक पोर्टल" : "Traditional Portal"}
            </div>
            <div className="bg-[#1A3A6B] px-6 py-4 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>{isHi ? "समर्थन" : "Samarthan"}</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full font-medium tracking-normal lowercase">
                ai-powered
              </span>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-zinc-200">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.6fr] group hover:bg-zinc-50/50 transition-colors"
              >
                {/* Feature Name */}
                <div className="px-6 py-4 text-sm font-medium text-zinc-900 flex items-center border-r-0 md:border-r border-zinc-200">
                  <span className="md:hidden font-bold mr-2 text-zinc-400 text-xs uppercase tracking-wider">
                    {isHi ? "सुविधा:" : "Feature:"}
                  </span>
                  {item.label}
                </div>

                {/* Traditional Portal */}
                <div className="px-6 py-3 md:py-4 text-sm text-zinc-500 flex items-center border-r-0 md:border-r border-zinc-200 bg-zinc-50/30 md:bg-transparent">
                  <span className="md:hidden font-bold mr-2 text-zinc-400 text-xs uppercase tracking-wider">
                    {isHi ? "पारंपरिक:" : "Traditional:"}
                  </span>
                  {item.trad}
                </div>

                {/* Samarthan Column */}
                <div className="px-6 py-3.5 md:py-4 text-sm font-semibold text-zinc-950 flex items-center gap-2 bg-blue-50/30">
                  <span className="md:hidden font-bold mr-2 text-blue-900 text-xs uppercase tracking-wider">
                    {isHi ? "समर्थन:" : "Samarthan:"}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{item.sam}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
