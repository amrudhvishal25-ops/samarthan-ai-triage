'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useTriage } from '@/context/TriageContext'
import { SupportedLanguage } from '@/lib/i18n/languages'

interface FooterSectionProps {
  language: SupportedLanguage
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
      <section className="bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            {hi ? 'गोल्डन ऑवर में हर मिनट मायने रखता है।' : 'Every minute matters in the golden hour.'}
          </h2>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed">
            {hi
              ? 'धोखाधड़ी की रिपोर्ट जितनी जल्दी होगी, पैसा वापस मिलने की संभावना उतनी ज़्यादा। अभी शुरू करें।'
              : 'The sooner a fraud is reported, the higher the chance of getting the money back. Start now.'}
          </p>
          <button
            onClick={startReport}
            className="mt-6 sm:mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-8 py-3.5 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
          >
            {hi ? 'रिपोर्ट शुरू करें' : 'Start a report'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold text-foreground">Samarthan</div>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                {hi ? 'AI साइबर अपराध ट्रायज। घबराहट से FIR तक।' : 'AI cybercrime triage. From panic to FIR.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                {hi ? 'लिंक' : 'Links'}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li><a href="#how-it-works" onClick={(e) => scrollTo('how-it-works', e)} className="hover:text-primary transition-colors">{hi ? 'यह कैसे काम करता है' : 'How it works'}</a></li>
                <li><a href="#comparison" onClick={(e) => scrollTo('comparison', e)} className="hover:text-primary transition-colors">{hi ? 'समर्थन क्यों?' : 'Why Samarthan'}</a></li>
                <li><a href="#file-report" onClick={(e) => scrollTo('file-report', e)} className="hover:text-primary transition-colors">{hi ? 'शुरू करें' : 'Get started'}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                {hi ? 'आपातकाल' : 'Emergency'}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li><a href="tel:1930" className="hover:text-primary transition-colors">{hi ? 'साइबर हेल्पलाइन: 1930' : 'Cyber Helpline: 1930'}</a></li>
                <li><a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">cybercrime.gov.in</a></li>
                <li><a href="tel:100" className="hover:text-primary transition-colors">{hi ? 'पुलिस: 100' : 'Police: 100'}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                {hi ? 'के बारे में' : 'About'}
              </h4>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li>{hi ? 'Build What Moves India हैकथॉन के लिए बनाया' : 'Built for Build What Moves India Hackathon'}</li>
                <li>{hi ? 'DigiLocker सत्यापित पहचान' : 'DigiLocker verified identity'}</li>
                <li>{hi ? 'GPT-4o द्वारा संचालित' : 'Powered by GPT-4o'}</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <p className="max-w-3xl leading-relaxed">
              🏆 <strong>Build What Moves India Hackathon Project</strong> • ⚠️ <em>{hi ? 'अस्वीकरण: यह वेबसाइट Build What Moves India हैकथॉन के लिए बनाया गया एक AI सिमुलेशन और प्रोटोटाइप है। यह कोई आधिकारिक सरकारी वेबसाइट नहीं है (आधिकारिक राष्ट्रीय साइबर अपराध पोर्टल cybercrime.gov.in है)।' : 'Disclaimer: This platform is an AI simulation & prototype developed for the Build What Moves India Hackathon. It is NOT an official government website (the official government portal is cybercrime.gov.in). For real emergency cybercrime assistance, immediately dial 1930.'}</em>
            </p>
            <p className="whitespace-nowrap font-medium text-zinc-400">
              Made with ❤️ for India
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
