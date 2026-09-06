'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'

interface FooterSectionProps {
  language: 'en' | 'hi'
}

export default function FooterSection({ language }: FooterSectionProps) {
  const hi = language === 'hi'
  const router = useRouter()
  const { setScenarioId, setInputType } = useTriage()

  const startReport = () => {
    setScenarioId(null)
    setInputType('text')
    router.push('/intake?category=auto')
  }

  const scrollTo = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Final CTA */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {hi ? 'गोल्डन ऑवर में हर मिनट मायने रखता है।' : 'Every minute matters in the golden hour.'}
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            {hi
              ? 'धोखाधड़ी की रिपोर्ट जितनी जल्दी होगी, पैसा वापस मिलने की संभावना उतनी ज़्यादा। अभी शुरू करें।'
              : 'The sooner a fraud is reported, the higher the chance of getting the money back. Start now.'}
          </p>
          <button
            onClick={startReport}
            className="mt-8 inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#152d54] text-white rounded-md px-8 py-3.5 text-sm font-semibold transition-colors shadow-sm"
          >
            {hi ? 'रिपोर्ट शुरू करें' : 'Start a report'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-white border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold">Samarthan</div>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                {hi ? 'AI साइबर अपराध ट्रायज। घबराहट से FIR तक।' : 'AI cybercrime triage. From panic to FIR.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                {hi ? 'लिंक' : 'Links'}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><a href="#how-it-works" onClick={(e) => scrollTo('how-it-works', e)} className="hover:text-white transition-colors">{hi ? 'यह कैसे काम करता है' : 'How it works'}</a></li>
                <li><a href="#comparison" onClick={(e) => scrollTo('comparison', e)} className="hover:text-white transition-colors">{hi ? 'समर्थन क्यों?' : 'Why Samarthan'}</a></li>
                <li><a href="#file-report" onClick={(e) => scrollTo('file-report', e)} className="hover:text-white transition-colors">{hi ? 'शुरू करें' : 'Get started'}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                {hi ? 'आपातकाल' : 'Emergency'}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><a href="tel:1930" className="hover:text-white transition-colors">{hi ? 'साइबर हेल्पलाइन: 1930' : 'Cyber Helpline: 1930'}</a></li>
                <li><a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">cybercrime.gov.in</a></li>
                <li><a href="tel:100" className="hover:text-white transition-colors">{hi ? 'पुलिस: 100' : 'Police: 100'}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                {hi ? 'के बारे में' : 'About'}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>{hi ? 'Aevy TV × OpenAI हैकाथॉन के लिए बनाया' : 'Built for Aevy TV × OpenAI Hackathon'}</li>
                <li>{hi ? 'DigiLocker सत्यापित पहचान' : 'DigiLocker verified identity'}</li>
                <li>{hi ? 'GPT-4o द्वारा संचालित' : 'Powered by GPT-4o'}</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-zinc-800 text-xs text-zinc-500">
            {hi
              ? 'सिम्युलेटेड डेमो: कोई वास्तविक बैंक या पुलिस एकीकरण नहीं। कानूनी सलाह नहीं।'
              : 'Simulated demo: no real bank or police integration. Not legal advice.'}
          </div>
        </div>
      </footer>
    </>
  )
}
