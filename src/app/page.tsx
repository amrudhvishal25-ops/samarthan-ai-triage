'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Mic, ArrowRight, Bookmark, Building2, Briefcase, DollarSign, List, Shield, User, Globe, Plus, ArrowUp, Smartphone, ShieldCheck } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SCENARIOS } from '@/data/scenarios'
import clsx from 'clsx'

export default function Home() {
  const router = useRouter()
  const { language, setLanguage, setScenarioId, setInputType, setSharedImage } = useTriage()
  const hi = language === 'hi'

  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0])
  const [inputText, setInputText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleRunDemo = () => {
    setScenarioId(selectedScenario.id)
    router.push('/intake')
  }

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
      router.push('/intake?category=auto&autoStart=true')
    }
  }

  const handleCategoryPill = (category: string) => {
    setScenarioId(null)
    setInputType('text')
    router.push(`/intake?category=${encodeURIComponent(category)}`)
  }

  const filters = hi 
    ? ['वित्तीय धोखाधड़ी', 'सोशल मीडिया हैकिंग', 'महिलाओं/बच्चों के अपराध', 'हेट स्पीच', 'ऑनलाइन रैगिंग', 'अन्य साइबर अपराध']
    : ['Financial Fraud', 'Social Media Hacking', 'Women/Children Crime', 'Hate Speech', 'Online Ragging', 'Other Cyber Crime']

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans pb-20 relative overflow-hidden">
      {/* Light dot matrix background pattern */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Navbar Area */}
      <div className="px-6 py-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">Samarthan</span>
          </div>
          
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-sm"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-10 pb-12 px-6 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          {hi ? 'समर्थन: Varun Mayya x OpenAI की एक पहल' : 'Samarthan: A Varun Mayya x OpenAI Initiative'}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tighter leading-tight mb-6 max-w-4xl mx-auto">
          {hi ? 'साइबर अपराध रिपोर्टिंग' : 'Report Cyber Crime'}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            {hi ? 'अब हुआ आसान' : 'in Seconds.'}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium mb-12">
          {hi 
            ? 'AI-संचालित प्लेटफ़ॉर्म: तुरंत शिकायत का मसौदा तैयार करें, नोडल अधिकारियों को खोजें और अपनी FIR ट्रैक करें।' 
            : 'AI-powered platform to instantly draft formal complaints, alert nodal officers, and track your resolution.'}
        </p>
      </div>

      {/* Hidden File Input for Direct Upload */}
      <input 
        type="file" 
        ref={fileRef} 
        hidden 
        accept="image/*,.pdf" 
        onChange={handleFileSelect} 
      />

      {/* Main AI Chatbox (Command Palette Style) */}
      <div className="max-w-4xl mx-auto px-6 relative z-20 -mt-4">
        <form 
          onSubmit={handleAutoAnalyze} 
          className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-3 md:p-4 flex flex-col transition-all duration-300 w-full hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]"
        >
          <div className="bg-white border border-gray-100 rounded-[24px] shadow-inner p-4 md:p-6 flex flex-col">
            <div className="flex-1 w-full relative mb-4">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={hi ? 'क्या हुआ, विस्तार से बताएं...' : 'Describe what happened...'}
                className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 resize-none py-2 text-xl md:text-2xl font-medium"
                rows={inputText ? 3 : 1}
                style={{ minHeight: inputText ? '80px' : '40px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) handleAutoAnalyze(e as any);
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                type="button"
                onClick={handleAttachClick}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                {hi ? 'इमेज जोड़ें' : 'Add Evidence'}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setScenarioId(null)
                  setInputType('voice')
                  router.push('/intake?category=auto&mode=voice')
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full font-semibold transition-colors"
              >
                <Mic className="w-5 h-5" />
                {hi ? 'बोलें' : 'Voice'}
              </button>
              
              <div className="flex-1"></div>

              {inputText.trim() && (
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {hi ? 'जनरेट करें' : 'Generate'}
                  <ArrowUp className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Filter Pills - FIXED overflow issue with flex-shrink-0 */}
        <div className="flex justify-center w-full">
          <div className="flex items-center justify-start md:justify-center gap-3 mt-8 overflow-x-auto pb-4 scrollbar-hide max-w-full px-2 w-full">
            {filters.map((f, i) => (
              <button 
                key={i}
                onClick={() => handleCategoryPill(f)}
                className="flex-shrink-0 whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Category Cards Area */}
      <div className="max-w-6xl mx-auto px-6 mt-20 mb-20 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {hi ? 'सामान्य अपराध श्रेणियां' : 'Common Cybercrimes'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              title: 'Financial Fraud', 
              titleHi: 'वित्तीय धोखाधड़ी',
              desc: 'Report UPI, OTP, and investment scams.',
              descHi: 'UPI, OTP और निवेश घोटालों की रिपोर्ट करें।',
              bg: 'from-blue-500 to-cyan-400',
              icon: <DollarSign className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Social Media Hacking', 
              titleHi: 'सोशल मीडिया हैकिंग',
              desc: 'Report hacked accounts, fake profiles, and impersonation.',
              descHi: 'हैक किए गए खाते, फर्जी प्रोफाइल और रूप धरने की रिपोर्ट करें।',
              bg: 'from-emerald-500 to-teal-400',
              icon: <Smartphone className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Women/Children Crime', 
              titleHi: 'महिला/बाल अपराध',
              desc: 'Report harassment, cyberbullying, and abuse.',
              descHi: 'उत्पीड़न, साइबरबुलिंग और दुर्व्यवहार की रिपोर्ट करें।',
              bg: 'from-pink-500 to-rose-400',
              icon: <User className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Hate Speech', 
              titleHi: 'अभद्र भाषा (Hate Speech)',
              desc: 'Report inflammatory or threatening content.',
              descHi: 'भड़काऊ या धमकी भरे सामग्री की रिपोर्ट करें।',
              bg: 'from-orange-500 to-red-500',
              icon: <Shield className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Online Ragging', 
              titleHi: 'ऑनलाइन रैगिंग',
              desc: 'Report online bullying and institutional harassment.',
              descHi: 'ऑनलाइन बुलिंग और संस्थागत उत्पीड़न की रिपोर्ट करें।',
              bg: 'from-purple-500 to-indigo-500',
              icon: <Globe className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Other Cyber Crime', 
              titleHi: 'अन्य साइबर अपराध',
              desc: 'Report hacking, data theft, and other crimes.',
              descHi: 'हैकिंग, डेटा चोरी और अन्य अपराधों की रिपोर्ट करें।',
              bg: 'from-gray-700 to-gray-900',
              icon: <Briefcase className="w-10 h-10 text-white/90" />
            }
          ].map((cat, i) => (
            <div 
              key={i}
              onClick={() => handleCategoryPill(cat.title)}
              className="bg-white border border-gray-200 rounded-[32px] p-2 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              <div className={`h-40 rounded-[24px] bg-gradient-to-br ${cat.bg} flex items-center justify-center relative overflow-hidden mb-2`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-start">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                  {hi ? cat.titleHi : cat.title}
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </h3>
                <p className="text-gray-500 text-sm">
                  {hi ? cat.descHi : cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
