'use client'

import { useTriage } from '@/context/TriageContext'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import TrustStrip from '@/components/landing/TrustStrip'
import HowItWorks from '@/components/landing/HowItWorks'
import ComparisonTable from '@/components/landing/ComparisonTable'
import FileReportSection from '@/components/landing/FileReportSection'
import FooterSection from '@/components/landing/FooterSection'

export default function Home() {
  const { language, setLanguage } = useTriage()

  return (
    <main className="min-h-screen bg-background font-sans">
      <Navbar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')} />

      <HeroSection language={language} />
      <TrustStrip language={language} />
      <HowItWorks language={language} />
      <ComparisonTable language={language} />
      <FileReportSection language={language} />
      <FooterSection language={language} />
    </main>
  )
}
