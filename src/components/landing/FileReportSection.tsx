'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTriage } from '@/context/TriageContext'
import {
  DollarSign, User, ShieldAlert, Fingerprint, ShoppingCart, Briefcase,
  Plus, ArrowUp, Mic, Phone, MessageCircle, Globe,
} from 'lucide-react'

interface FileReportSectionProps {
  language: 'en' | 'hi'
}

type Channel = 'web' | 'call' | 'whatsapp'

export default function FileReportSection({ language }: FileReportSectionProps) {
  const router = useRouter()
  const hi = language === 'hi'
  const { setScenarioId, setInputType, setSharedImage } = useTriage()

  const [inputText, setInputText] = useState('')
  const [channel, setChannel] = useState<Channel>('web')
  const fileRef = useRef<HTMLInputElement>(null)

  const categories = [
    { title: 'Financial Fraud', titleHi: 'वित्तीय धोखाधड़ी', desc: 'UPI, banking, and credit-card fraud.', descHi: 'UPI, बैंकिंग और क्रेडिट कार्ड धोखाधड़ी।', icon: <DollarSign className="w-5 h-5" />, iconBg: 'bg-blue-50 text-blue-600' },
    { title: 'Women/Children Related Crime', titleHi: 'महिला/बाल अपराध', desc: 'Harassment, cyberbullying, and abuse.', descHi: 'उत्पीड़न, साइबरबुलिंग और दुर्व्यवहार।', icon: <User className="w-5 h-5" />, iconBg: 'bg-pink-50 text-pink-600' },
    { title: 'Extortion & Blackmail', titleHi: 'जबरन वसूली', desc: 'Loan apps, sextortion, and threats.', descHi: 'ऋण ऐप, ब्लैकमेल और धमकियाँ।', icon: <ShieldAlert className="w-5 h-5" />, iconBg: 'bg-red-50 text-red-600' },
    { title: 'Identity Theft', titleHi: 'पहचान की चोरी', desc: 'PAN/Aadhaar misuse and fake profiles.', descHi: 'पैन/आधार दुरुपयोग और फर्जी प्रोफाइल।', icon: <Fingerprint className="w-5 h-5" />, iconBg: 'bg-purple-50 text-purple-600' },
    { title: 'E-Commerce Scams', titleHi: 'ई-कॉमर्स धोखाधड़ी', desc: 'Fake sites, OLX, and delivery fraud.', descHi: 'फर्जी वेबसाइट, OLX और डिलीवरी धोखाधड़ी।', icon: <ShoppingCart className="w-5 h-5" />, iconBg: 'bg-emerald-50 text-emerald-600' },
    { title: 'Other Cyber Crime', titleHi: 'अन्य साइबर अपराध', desc: 'Hacking, data theft, and other threats.', descHi: 'हैकिंग, डेटा चोरी और अन्य खतरे।', icon: <Briefcase className="w-5 h-5" />, iconBg: 'bg-zinc-100 text-zinc-600' },
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

  const tabs: { id: Channel; label: string; labelHi: string; icon: React.ReactNode }[] = [
    { id: 'call', label: 'Call 1930', labelHi: '1930 पर कॉल करें', icon: <Phone className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', labelHi: 'व्हाट्सएप', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'web', label: 'Use the web', labelHi: 'वेब पर करें', icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <section id="file-report" className="py-24 bg-[#FAFAF8] border-t border-zinc-200">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
            {hi ? 'शुरू करें' : 'Get started'}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
            {hi ? 'कैसे रिपोर्ट करना चाहते हैं?' : 'How do you want to report?'}
          </h2>
        </motion.div>

        {/* Channel tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setChannel(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                channel === t.id
                  ? 'bg-[#1A3A6B] text-white shadow-sm'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {t.icon}
              {hi ? t.labelHi : t.label}
            </button>
          ))}
        </div>

        {/* Channel body */}
        {channel === 'call' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm text-zinc-500 mb-2">{hi ? 'राष्ट्रीय साइबर अपराध हेल्पलाइन' : 'National Cybercrime Helpline'}</p>
            <a href="tel:1930" className="text-5xl font-extrabold text-[#0A0A0A] tracking-tight">1930</a>
            <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto">
              {hi
                ? 'अपनी भाषा में बात करें। एक बार में एक स्पष्ट सवाल। तुरंत बैंक खाता फ्रीज़ के लिए यही सबसे तेज़ रास्ता है।'
                : 'Talk in the language you are comfortable with. One clear question at a time. This is the fastest route to an emergency account freeze.'}
            </p>
          </div>
        )}

        {channel === 'whatsapp' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm text-zinc-500 mb-4">
              {hi ? 'व्हाट्सएप पर वॉइस नोट या स्क्रीनशॉट भेजें' : 'Send a voice note or screenshot on WhatsApp'}
            </p>
            <a
              href="https://wa.me/911930"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white rounded-full px-6 py-3 text-sm font-semibold transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              {hi ? 'व्हाट्सएप खोलें' : 'Open WhatsApp'}
            </a>
            <p className="mt-3 text-xs text-zinc-400">{hi ? 'डेमो: नंबर सांकेतिक है' : 'Demo: number is illustrative'}</p>
          </div>
        )}

        {channel === 'web' && (
          <>
            <input type="file" ref={fileRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf" />
            <div className="rounded-xl border border-zinc-300 bg-white shadow-xs overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
              <textarea
                className="w-full p-4 min-h-[120px] outline-none resize-none text-zinc-800 placeholder:text-zinc-400"
                placeholder={hi ? 'मुझे एक फिशिंग लिंक मिला...' : 'I received a phishing link...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAutoAnalyze() }
                }}
              />
              <div className="px-4 py-3 bg-[#FAFAF8] border-t border-zinc-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-zinc-500" />
                    <span>{hi ? 'सबूत जोड़ें' : 'Add evidence'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScenarioId(null)
                      setInputType('voice')
                      const q = inputText.trim() ? `&text=${encodeURIComponent(inputText)}` : ''
                      router.push(`/intake?category=auto&mode=voice${q}`)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg transition-colors shadow-xs"
                  >
                    <Mic className="w-4 h-4 text-blue-600" />
                    <span>{hi ? 'आवाज़ का उपयोग करें' : 'Use voice'}</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAnalyze}
                  disabled={!inputText.trim()}
                  className="flex items-center justify-center p-2 rounded-full bg-[#1A3A6B] text-white hover:bg-[#152d54] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="mt-8 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {hi ? 'या श्रेणी चुनें' : 'Or pick a category'}
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => handleCategory(cat.title)}
                  className="flex flex-col items-start p-5 rounded-xl bg-white border border-zinc-200/90 hover:border-blue-500/50 hover:shadow-xs transition-all text-left"
                >
                  <div className={`p-2.5 rounded-xl mb-3 ${cat.iconBg}`}>{cat.icon}</div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] mb-1">{hi ? cat.titleHi : cat.title}</h3>
                  <p className="text-xs text-zinc-500">{hi ? cat.descHi : cat.desc}</p>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
