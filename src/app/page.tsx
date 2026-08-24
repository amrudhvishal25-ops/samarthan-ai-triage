'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, ArrowRight, DollarSign, Shield, User, Globe, Plus, ArrowUp, ShieldCheck, ShieldAlert, Fingerprint, ShoppingCart, Briefcase } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SCENARIOS } from '@/data/scenarios'

export default function Home() {
  const router = useRouter()
  const { language, setLanguage, setScenarioId, setInputType, setSharedImage } = useTriage()
  const hi = language === 'hi'

  const [inputText, setInputText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAutoAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    setScenarioId(null)
    setInputType('text')
    router.push(`/intake?category=auto&text=${encodeURIComponent(inputText)}&autoStart=true`)
  }

  const handleAttachClick = () => {
    fileRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSharedImage(file)
      setScenarioId(null)
      setInputType('screenshot')
      router.push('/intake?category=auto')
    }
  }

  const handleCategoryPill = (category: string) => {
    setScenarioId(null)
    setInputType('text')
    router.push(`/intake?category=${encodeURIComponent(category)}`)
  }

  const filters = hi
    ? ['वित्तीय धोखाधड़ी', 'महिला/बाल अपराध', 'जबरन वसूली', 'पहचान की चोरी', 'ई-कॉमर्स धोखाधड़ी', 'अन्य साइबर अपराध']
    : ['Financial Fraud', 'Women/Children Crime', 'Extortion & Blackmail', 'Identity Theft', 'E-Commerce Scams', 'Other Cyber Crimes']

  const categories = [
    {
      title: 'Financial Fraud',
      titleHi: 'वित्तीय धोखाधड़ी',
      desc: 'Report UPI, banking, and credit card frauds.',
      descHi: 'UPI, बैंकिंग और क्रेडिट कार्ड धोखाधड़ी की रिपोर्ट करें।',
      icon: <DollarSign className="w-5 h-5" />,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Women/Children Crime',
      titleHi: 'महिला/बाल अपराध',
      desc: 'Report harassment, cyberbullying, and abuse.',
      descHi: 'उत्पीड़न, साइबरबुलिंग और दुर्व्यवहार की रिपोर्ट करें।',
      icon: <User className="w-5 h-5" />,
      iconBg: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Extortion & Blackmail',
      titleHi: 'जबरन वसूली (Extortion)',
      desc: 'Report digital loan apps, sextortion, and threats.',
      descHi: 'डिजिटल ऋण ऐप, ब्लैकमेल और धमकियों की रिपोर्ट करें।',
      icon: <ShieldAlert className="w-5 h-5" />,
      iconBg: 'bg-red-50 text-red-600',
    },
    {
      title: 'Identity Theft',
      titleHi: 'पहचान की चोरी',
      desc: 'Report PAN/Aadhaar misuse and fake profiles.',
      descHi: 'पैन/आधार के दुरुपयोग और फर्जी प्रोफाइल की रिपोर्ट करें।',
      icon: <Fingerprint className="w-5 h-5" />,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'E-Commerce Scams',
      titleHi: 'ई-कॉमर्स धोखाधड़ी',
      desc: 'Report fake websites, OLX, and delivery frauds.',
      descHi: 'फर्जी वेबसाइटों, OLX और डिलीवरी धोखाधड़ी की रिपोर्ट करें।',
      icon: <ShoppingCart className="w-5 h-5" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Other Cyber Crimes',
      titleHi: 'अन्य साइबर अपराध',
      desc: 'Report hacking, data theft, and other threats.',
      descHi: 'हैकिंग, डेटा चोरी और अन्य साइबर खतरों की रिपोर्ट करें।',
      icon: <Briefcase className="w-5 h-5" />,
      iconBg: 'bg-zinc-100 text-zinc-600',
    },
  ]

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight">Samarthan</span>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 rounded-md px-3 py-1.5 transition-colors h-auto min-h-0"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 border border-zinc-200 rounded-full px-3 py-1 text-xs font-medium text-zinc-600 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          {hi ? 'Varun Mayya x OpenAI की पहल' : 'A Varun Mayya x OpenAI Initiative'}
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tighter leading-[1.1] mb-5 max-w-3xl">
          {hi ? (
            <>समर्थन साइबर अपराध<br /><span className="text-zinc-400">पोर्टल प्रोजेक्ट</span></>
          ) : (
            <>Samarthan Cyber Crime<br /><span className="text-zinc-400">Portal Project</span></>
          )}
        </h1>

        <p className="text-base text-zinc-500 max-w-xl mb-10 leading-relaxed">
          {hi
            ? 'AI-संचालित प्लेटफ़ॉर्म: तुरंत शिकायत का मसौदा तैयार करें, नोडल अधिकारियों को खोजें और अपनी FIR ट्रैक करें।'
            : 'AI-powered platform to instantly draft formal complaints, alert nodal officers, and track your resolution.'}
        </p>

        {/* ── CHATBOX ── */}
        <input type="file" ref={fileRef} hidden accept="image/*,.pdf" onChange={handleFileSelect} />

        <form onSubmit={handleAutoAnalyze} className="border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden w-full max-w-3xl text-left">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={hi ? 'क्या हुआ? विस्तार से बताएं…' : 'Describe what happened…'}
            className="w-full px-5 pt-5 pb-2 text-base text-zinc-900 placeholder-zinc-400 resize-none outline-none bg-transparent"
            rows={inputText ? 3 : 2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (inputText.trim()) handleAutoAnalyze(e as any)
              }
            }}
          />
          <div className="flex items-center gap-2 px-4 pb-4 pt-1 border-t border-zinc-100 mt-2">
            <button
              type="button"
              onClick={handleAttachClick}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 rounded-lg px-3 py-2 transition-all h-auto min-h-0 bg-zinc-50 hover:bg-zinc-100"
            >
              <Plus className="w-3.5 h-3.5" />
              {hi ? 'सबूत जोड़ें' : 'Add Evidence'}
            </button>
            <button
              type="button"
              onClick={() => {
                setScenarioId(null)
                setInputType('voice')
                router.push('/intake?category=auto&mode=voice')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 rounded-lg px-3 py-2 transition-all h-auto min-h-0 bg-zinc-50 hover:bg-zinc-100"
            >
              <Mic className="w-3.5 h-3.5" />
              {hi ? 'बोलें' : 'Voice'}
            </button>
            <div className="flex-1" />
            {inputText.trim() && (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg px-4 py-2 transition-all h-auto min-h-0"
              >
                {hi ? 'विश्लेषण करें' : 'Analyze'}
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* ── FILTER PILLS ── */}
        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap pb-1 scrollbar-hide w-full max-w-3xl">
          {filters.map((f, i) => (
            <button
              key={i}
              onClick={() => handleCategoryPill(f)}
              className="flex-shrink-0 inline-flex items-center text-xs font-medium text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-md px-3 py-1.5 transition-all h-auto min-h-0"
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES SECTION ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            {hi ? 'सामान्य अपराध श्रेणियां' : 'Common Cybercrime Categories'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => handleCategoryPill(cat.title)}
              className="group cursor-pointer bg-white border border-zinc-200 rounded-2xl p-6 hover:border-zinc-400 hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${cat.iconBg}`}>
                {cat.icon}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1 flex items-center justify-between">
                {hi ? cat.titleHi : cat.title}
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {hi ? cat.descHi : cat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
