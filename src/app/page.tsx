'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Mic, ArrowRight, Bookmark, Building2, Briefcase, DollarSign, List, Shield, User, Globe, Plus, ArrowUp, Smartphone } from 'lucide-react'
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
    <main className="min-h-screen bg-white font-sans pb-20">
      {/* Top Header Area */}
      <div className="pt-8 pb-12 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-gray-900 font-bold text-2xl tracking-tight">Samarthan</span>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>

          <h1 className="text-gray-900 text-4xl md:text-5xl font-bold mb-4">
            {hi ? 'अपनी शिकायत दर्ज करें' : "Let's map your cyber report"}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {hi 
              ? 'सर्वश्रेष्ठ साइबर सुरक्षा उपकरणों के साथ अपराध की रिपोर्ट करें। AI को काम करने दें।'
              : 'Discover the correct category and generate a formal complaint instantly using AI.'}
          </p>
        </div>
      </div>

      {/* Hidden File Input for Direct Upload */}
      <input 
        type="file" 
        ref={fileRef} 
        hidden 
        accept="image/*,.pdf" 
        onChange={handleFileSelect} 
      />

      {/* Main AI Chatbox */}
      <div className="max-w-4xl mx-auto px-6 relative z-20">
        <form 
          onSubmit={handleAutoAnalyze} 
          className="bg-white border-2 border-gray-100 rounded-[32px] shadow-lg p-6 flex flex-col transition-all duration-300 w-full"
        >
          <div className="flex-1 w-full relative mb-4">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={hi ? 'कुछ भी पूछें...' : 'Ask anything...'}
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
              {hi ? 'इमेज जोड़ें' : 'Add Image'}
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
              {hi ? 'बोलें' : 'Speak'}
            </button>
            
            <div className="flex-1"></div>

            {inputText.trim() && (
              <button 
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors shadow-md"
              >
                {hi ? 'भेजें' : 'Send'}
                <ArrowUp className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f, i) => (
            <button 
              key={i}
              onClick={() => handleCategoryPill(f)}
              className="whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Category Cards Area */}
      <div className="max-w-6xl mx-auto px-6 mt-12 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {hi ? 'श्रेणी चुनें' : 'Select a Category'}
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
              icon: <DollarSign className="w-12 h-12 text-white/80" />
            },
            { 
              title: 'Social Media Hacking', 
              titleHi: 'सोशल मीडिया हैकिंग',
              desc: 'Report hacked accounts, fake profiles, and impersonation.',
              descHi: 'हैक किए गए खाते, फर्जी प्रोफाइल और रूप धरने की रिपोर्ट करें।',
              bg: 'from-emerald-500 to-teal-400',
              icon: <Smartphone className="w-12 h-12 text-white/80" />
            },
            { 
              title: 'Women/Children Crime', 
              titleHi: 'महिला/बाल अपराध',
              desc: 'Report harassment, cyberbullying, and abuse.',
              descHi: 'उत्पीड़न, साइबरबुलिंग और दुर्व्यवहार की रिपोर्ट करें।',
              bg: 'from-pink-500 to-rose-400',
              icon: <User className="w-12 h-12 text-white/80" />
            },
            { 
              title: 'Hate Speech', 
              titleHi: 'अभद्र भाषा (Hate Speech)',
              desc: 'Report inflammatory or threatening content.',
              descHi: 'भड़काऊ या धमकी भरे सामग्री की रिपोर्ट करें।',
              bg: 'from-orange-500 to-red-500',
              icon: <Shield className="w-12 h-12 text-white/80" />
            },
            { 
              title: 'Online Ragging', 
              titleHi: 'ऑनलाइन रैगिंग',
              desc: 'Report online bullying and institutional harassment.',
              descHi: 'ऑनलाइन बुलिंग और संस्थागत उत्पीड़न की रिपोर्ट करें।',
              bg: 'from-purple-500 to-indigo-500',
              icon: <Globe className="w-12 h-12 text-white/80" />
            },
            { 
              title: 'Other Cyber Crime', 
              titleHi: 'अन्य साइबर अपराध',
              desc: 'Report hacking, data theft, and other crimes.',
              descHi: 'हैकिंग, डेटा चोरी और अन्य अपराधों की रिपोर्ट करें।',
              bg: 'from-gray-600 to-gray-800',
              icon: <Briefcase className="w-12 h-12 text-white/80" />
            }
          ].map((cat, i) => (
            <div 
              key={i}
              onClick={() => handleCategoryPill(cat.title)}
              className="bg-white border border-gray-200 rounded-[32px] overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[280px]"
            >
              {/* Top Image / Gradient Area */}
              <div className={`h-32 bg-gradient-to-br ${cat.bg} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                {cat.icon}
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col justify-start">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {hi ? cat.titleHi : cat.title}
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
