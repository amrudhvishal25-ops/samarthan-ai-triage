'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Mic, ArrowRight, Bookmark, Building2, Briefcase, DollarSign, List, Shield, User, Globe, Plus, ArrowUp } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SCENARIOS } from '@/data/scenarios'
import clsx from 'clsx'

export default function Home() {
  const router = useRouter()
  const { language, setLanguage, setScenarioId, setInputType } = useTriage()
  const hi = language === 'hi'

  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0])
  const [inputText, setInputText] = useState('')

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
    setScenarioId(null)
    setInputType('screenshot')
    router.push('/intake?category=auto&mode=screenshot')
  }

  const handleCategoryPill = (category: string) => {
    setScenarioId(null)
    setInputType('text')
    router.push(`/intake?category=${encodeURIComponent(category)}`)
  }

  const filters = hi 
    ? ['वित्तीय धोखाधड़ी', 'महिलाओं/बच्चों के अपराध', 'हेट स्पीच', 'ऑनलाइन रैगिंग', 'अन्य साइबर अपराध']
    : ['Financial Fraud', 'Women/Children Crime', 'Hate Speech', 'Online Ragging', 'Other Cyber Crime']

  return (
    <main className="min-h-screen bg-[#f4f7f9] font-sans pb-20">
      {/* Top Dark Header Area */}
      <div className="bg-[#003b5c] pt-12 pb-24 px-6 relative overflow-hidden">
        {/* Subtle background pattern/shapes could go here */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-2xl tracking-tight">Samarthan</span>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>

          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
            {hi ? 'अपनी शिकायत दर्ज करें' : "Let's map your cyber report"}
          </h1>
          <p className="text-[#8db1c7] text-lg max-w-2xl">
            {hi 
              ? 'सर्वश्रेष्ठ साइबर सुरक्षा उपकरणों के साथ अपराध की रिपोर्ट करें। AI को काम करने दें।'
              : 'Discover the correct category and generate a formal complaint instantly using AI.'}
          </p>
        </div>
      </div>

      {/* Floating AI Chatbox */}
      <div className="max-w-4xl mx-auto px-6 relative -mt-10 z-20">
        <form 
          onSubmit={handleAutoAnalyze} 
          className="bg-[#171717] rounded-[32px] shadow-2xl p-4 flex flex-col transition-all duration-300 w-full"
        >
          <div className="flex-1 w-full relative">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={hi ? 'कुछ भी पूछें...' : 'Ask anything...'}
              className="w-full bg-transparent outline-none text-white placeholder-gray-400 resize-none py-2 px-2 text-lg sm:text-xl font-medium"
              rows={inputText ? 3 : 1}
              style={{ minHeight: inputText ? '80px' : '36px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim()) handleAutoAnalyze(e as any);
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 px-2">
            {/* Left side: Empty as requested to remove GPT 5.5 */}
            <div></div>
            
            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={handleAttachClick}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>

              {inputText.trim() ? (
                <button 
                  type="submit"
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-md"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  type="button"
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-md"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
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
              className="bg-[#171717] rounded-[32px] overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-xl flex flex-col min-h-[320px]"
            >
              {/* Top Image / Gradient Area */}
              <div className={`h-48 bg-gradient-to-br ${cat.bg} flex items-center justify-center relative overflow-hidden`}>
                {/* Decorative Pattern overlay */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                {cat.icon}
              </div>
              
              {/* Bottom Content */}
              <div className="p-6 flex-1 flex flex-col justify-end">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {hi ? cat.titleHi : cat.title}
                </h3>
                <p className="text-gray-400 text-sm">
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
