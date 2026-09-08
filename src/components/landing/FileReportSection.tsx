'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTriage } from '@/context/TriageContext'
import {
  DollarSign, User, ShieldAlert, Fingerprint, ShoppingCart, Briefcase,
  Plus, ArrowUp, Mic, Phone, MessageCircle, Globe, ExternalLink,
} from 'lucide-react'
import WhatsAppChoiceModal from '@/components/WhatsAppChoiceModal'
import WhatsAppSimulatorModal from '@/components/WhatsAppSimulatorModal'

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
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [liveState, setLiveState] = useState<{ isRunning: boolean; status: string; userPhone: string | null }>({
    isRunning: false,
    status: 'DISCONNECTED',
    userPhone: null,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  // Poll live WhatsApp state
  useEffect(() => {
    let mounted = true
    const checkLive = async () => {
      try {
        const res = await fetch('/api/whatsapp/live')
        if (res.ok && mounted) {
          const data = await res.json()
          setLiveState(data)
        }
      } catch {}
    }
    checkLive()
    const interval = setInterval(checkLive, 4000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const categories = [
    { title: 'Financial Fraud', titleHi: 'वित्तीय धोखाधड़ी', desc: 'UPI, banking, and credit-card fraud.', descHi: 'UPI, बैंकिंग और क्रेडिट कार्ड धोखाधड़ी।', icon: <DollarSign className="w-5 h-5" />, iconBg: 'bg-primary-tint text-primary' },
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

  const cleanPhone = (liveState.userPhone || '+916303807967').replace(/\D/g, '')

  const handleVisitAgent = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      hi
        ? 'नमस्ते समर्थन, मुझे एक साइबर धोखाधड़ी की रिपोर्ट करनी है।'
        : 'Hi Samarthan, I want to report a cybercrime incident.'
    )}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const tabs: { id: Channel; label: string; labelHi: string; icon: React.ReactNode }[] = [
    { id: 'call', label: 'Call 1930', labelHi: '1930 पर कॉल करें', icon: <Phone className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', labelHi: 'व्हाट्सएप', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'web', label: 'Use the web', labelHi: 'वेब पर करें', icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <section id="file-report" className="py-12 sm:py-20 md:py-24 bg-surface border-t border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 sm:mb-3">
            {hi ? 'शुरू करें' : 'Get started'}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {hi ? 'कैसे रिपोर्ट करना चाहते हैं?' : 'How do you want to report?'}
          </h2>
        </div>

        {/* Channel tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setChannel(t.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-[44px] cursor-pointer ${
                channel === t.id
                  ? 'bg-primary text-white shadow-sm'
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
          <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 text-center">
            <p className="text-xs sm:text-sm text-zinc-500 mb-2">{hi ? 'राष्ट्रीय साइबर अपराध हेल्पलाइन' : 'National Cybercrime Helpline'}</p>
            <a href="tel:1930" className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">1930</a>
            <p className="mt-3 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
              {hi
                ? 'अपनी भाषा में बात करें। एक बार में एक स्पष्ट सवाल। तुरंत बैंक खाता फ्रीज़ के लिए यही सबसे तेज़ रास्ता है।'
                : 'Talk in the language you are comfortable with. One clear question at a time. This is the fastest route to an emergency account freeze.'}
            </p>
          </div>
        )}

        {channel === 'whatsapp' && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 text-center max-w-xl mx-auto shadow-xs">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">
              {hi ? 'व्हाट्सएप AI साइबर सहायता एजेंट' : 'Samarthan WhatsApp Cyber Agent'}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 mb-6 leading-relaxed">
              {hi
                ? 'हमारे 24x7 AI एजेंट को वॉइस नोट, मैसेज या स्क्रीनशॉट भेजें। एजेंट विवरण निकालेगा, कानून धाराएं जोड़ेगा और लाइव पोर्टल ट्रैकिंग लिंक देगा।'
                : 'Chat directly with our 24x7 WhatsApp AI triage agent. Send a voice note, message, or screenshot to receive instant legal advice, freeze steps, and your live complaint tracking link.'}
            </p>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsChoiceModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fa851] active:scale-[0.99] text-white rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-lg cursor-pointer min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{hi ? 'व्हाट्सएप AI एजेंट से बात करें' : 'Chat with WhatsApp AI Agent'}</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </button>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs font-mono text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{hi ? 'व्हाट्सएप AI एजेंट सक्रिय (24x7)' : 'WhatsApp AI Agent Active (24x7)'}</span>
            </div>
          </div>
        )}

        {channel === 'web' && (
          <>
            <input type="file" ref={fileRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf" />
            <div className="rounded-xl border border-zinc-300 bg-white shadow-xs overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <textarea
                className="w-full p-3.5 sm:p-4 min-h-[110px] sm:min-h-[120px] outline-none resize-none text-zinc-800 placeholder:text-zinc-400 text-base sm:text-sm"
                placeholder={hi ? 'मुझे एक फिशिंग लिंक मिला...' : 'I received a phishing link...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAutoAnalyze() }
                }}
              />
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border-t border-zinc-200/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-md transition-colors shadow-xs min-h-[40px] cursor-pointer"
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
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-md transition-colors shadow-xs min-h-[40px] cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-primary" />
                    <span>{hi ? 'आवाज़' : 'Use voice'}</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAnalyze}
                  disabled={!inputText.trim()}
                  className="flex items-center justify-center p-2.5 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm min-h-[40px] min-w-[40px] cursor-pointer"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="mt-6 sm:mt-8 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {hi ? 'या श्रेणी चुनें' : 'Or pick a category'}
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.title}
                  onClick={() => handleCategory(cat.title)}
                  className="flex flex-col items-start p-5 rounded-lg bg-white border border-zinc-200/90 hover:border-primary/50 hover:shadow-xs transition-all text-left cursor-pointer"
                >
                  <div className={`p-2.5 rounded-md mb-3 ${cat.iconBg}`}>{cat.icon}</div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{hi ? cat.titleHi : cat.title}</h3>
                  <p className="text-xs text-zinc-500">{hi ? cat.descHi : cat.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <WhatsAppChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        language={language}
        prefilledText={inputText}
      />

      <WhatsAppSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        language={language}
      />
    </section>
  )
}
