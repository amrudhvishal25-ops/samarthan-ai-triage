'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Fingerprint, Scale, Building2, ExternalLink, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { animate, stagger } from 'animejs'

interface TrustStripProps {
  language: 'en' | 'hi'
}

export default function TrustStrip({ language }: TrustStripProps) {
  const isHi = language === 'hi'
  const sectionRef = useRef<HTMLElement | null>(null)
  const hasAnimatedRef = useRef(false)

  // Counter targets matching exact HTML element types
  const counter60Ref = useRef<HTMLHeadingElement | null>(null)
  const counterFraudsRef = useRef<HTMLParagraphElement | null>(null)
  const counterLossRef = useRef<HTMLParagraphElement | null>(null)
  const counterGoldenRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true

          // 1. Primary 60s counter animation
          if (counter60Ref.current) {
            const countObj = { val: 0 }
            animate(countObj, {
              val: 60,
              round: 1,
              ease: 'outExpo',
              duration: 1800,
              onUpdate: () => {
                if (counter60Ref.current) {
                  counter60Ref.current.innerText = `${Math.round(countObj.val)}s`
                }
              },
            })
          }

          // 2. 11.3 Lakh+ Complaints counter
          if (counterFraudsRef.current) {
            const countObj = { val: 0 }
            animate(countObj, {
              val: 11.3,
              ease: 'outExpo',
              duration: 2000,
              onUpdate: () => {
                if (counterFraudsRef.current) {
                  counterFraudsRef.current.innerText = `${countObj.val.toFixed(1)} ${isHi ? 'लाख+' : 'Lakh+'}`
                }
              },
            })
          }

          // 3. ₹66,000 Cr counter
          if (counterLossRef.current) {
            const countObj = { val: 0 }
            animate(countObj, {
              val: 66000,
              round: 1,
              ease: 'outExpo',
              duration: 2200,
              onUpdate: () => {
                if (counterLossRef.current) {
                  counterLossRef.current.innerText = `₹${Math.round(countObj.val).toLocaleString('en-IN')} ${isHi ? 'करोड़' : 'Cr'}`
                }
              },
            })
          }

          // 4. < 3% Golden Hour response counter
          if (counterGoldenRef.current) {
            const countObj = { val: 0 }
            animate(countObj, {
              val: 3,
              round: 1,
              ease: 'outExpo',
              duration: 1600,
              onUpdate: () => {
                if (counterGoldenRef.current) {
                  counterGoldenRef.current.innerText = `< ${Math.round(countObj.val)}%`
                }
              },
            })
          }

          // 5. DigiLocker Telemetry wave equalizer animation
          animate('.telemetry-bar', {
            scaleY: [0.25, 1],
            delay: stagger(65, { from: 'center' }),
            direction: 'alternate',
            loop: true,
            ease: 'inOutQuad',
            duration: 600,
          })
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isHi])

  return (
    <section ref={sectionRef} className="w-full bg-surface border-y border-zinc-200/80 py-16">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* National Stats Ticker Header with Anime.js Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-mono uppercase tracking-wider">
                {isHi ? 'वार्षिक साइबर मामले' : 'Annual Cyber Frauds'}
              </span>
            </div>
            <p ref={counterFraudsRef} className="text-2xl font-extrabold text-zinc-900 tracking-tight font-mono">
              0.0 {isHi ? 'लाख+' : 'Lakh+'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isHi ? '2024 NCRP भारत रिपोर्ट' : 'Reported on 1930 in 2024'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-mono uppercase tracking-wider">
                {isHi ? 'डिजिटल नुकसान' : 'Digital Losses'}
              </span>
            </div>
            <p ref={counterLossRef} className="text-2xl font-extrabold text-zinc-900 tracking-tight font-mono">
              ₹0 {isHi ? 'करोड़' : 'Cr'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isHi ? 'वार्षिक राष्ट्रीय वित्तीय हानि' : 'Lost to digital financial fraud'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[11px] font-mono uppercase tracking-wider">
                {isHi ? 'गोल्डन ऑवर रिपोर्टिंग' : 'Golden Hour Act'}
              </span>
            </div>
            <p ref={counterGoldenRef} className="text-2xl font-extrabold text-red-600 tracking-tight font-mono">
              &lt; 0%
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isHi ? 'पारंपरिक पोर्टल पर देरी' : 'Victims report in time to freeze'}
            </p>
          </div>

          <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-700 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                {isHi ? 'समर्थन ट्रायज गति' : 'Samarthan AI Triage'}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-primary tracking-tight font-mono">
              60s
            </p>
            <p className="text-[11px] text-blue-600/80 mt-0.5">
              {isHi ? 'घबराहट से FIR व बैंक फ्रीज' : 'Immediate freeze dossier generated'}
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4">
          {/* Primary Stat (Span 3 cols, 2 rows) - primary blue */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="md:col-span-3 md:row-span-2 bg-primary rounded-lg p-8 md:p-10 flex flex-col justify-between overflow-hidden relative shadow-sm text-white"
          >
            {/* Subtle repeating hatched grid overlay */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ffffff_0px_1px,transparent_1px_12px)] opacity-10 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md text-[10px] font-mono font-semibold text-blue-100 uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  {isHi ? "NCRP 1930 ढांचा" : "1930 NCRP Framework"}
                </span>
              </div>
              <h3 ref={counter60Ref} className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white font-mono">
                0s
              </h3>
              <p className="text-xs font-mono uppercase tracking-wider text-blue-200/90 mt-2">
                {isHi ? "घबराहट से FIR तक का समय" : "Panic to FIR Triage Time"}
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/15">
              <p className="text-blue-100/90 text-sm leading-relaxed max-w-sm">
                {isHi
                  ? "राष्ट्रीय साइबर हेल्पलाइन 1930 के गोल्डन ऑवर रिस्पॉन्स प्रोटोकॉल के साथ पूरी तरह से एकीकृत और संरेखित।"
                  : "Built directly on the National Cyber Crime Reporting Portal (NCRP 1930) Golden Hour containment architecture."}
              </p>
            </div>
          </motion.div>

          {/* Secondary Stat A (Span 3 cols) - DigiLocker Verification with Live Telemetry wave */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-3 bg-white rounded-lg p-7 md:p-8 border border-zinc-200 flex items-center justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Fingerprint className="w-4 h-4 text-blue-600" />
                <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                  {isHi ? "पहचान सत्यापन" : "Identity Verification"}
                </p>
              </div>
              <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">DigiLocker</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                {isHi
                  ? "1-क्लिक आधार और पैन सत्यापित कानूनी शिकायतें"
                  : "1-click tamper-evident Aadhaar & PAN official verification"}
              </p>
            </div>

            {/* Anime.js live telemetry activity bars */}
            <div className="flex gap-1.5 items-end h-10 shrink-0 origin-bottom">
              {[25, 45, 60, 50, 85, 75, 95, 80, 100, 105, 115].map((h, i) => (
                <div
                  key={i}
                  className="telemetry-bar w-1.5 bg-primary rounded-sm origin-bottom"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* Tertiary Stat B (Span 1 col) - Legal sections */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="md:col-span-1 bg-white rounded-lg p-6 border border-zinc-200 flex flex-col justify-center text-center shadow-xs"
          >
            <div className="flex justify-center mb-1">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-zinc-950 tracking-tight">66C / 66D</p>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 mt-1">
              IT Act & BNS
            </p>
          </motion.div>

          {/* Tertiary Stat C (Span 2 cols) - Aligned with Cybercrime.gov.in */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="md:col-span-2 bg-zinc-50/80 rounded-lg p-6 border border-zinc-200 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-950 leading-tight">
                  cybercrime.gov.in
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {isHi ? "FIR-तैयार संरचित कानूनी दस्तावेज़" : "FIR-ready formal dossier"}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
