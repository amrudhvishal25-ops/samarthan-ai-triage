'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  MessageCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

interface WhatsAppChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSimulator: () => void
  language?: 'en' | 'hi'
  prefilledText?: string
}

export default function WhatsAppChoiceModal({
  isOpen,
  onClose,
  onOpenSimulator,
  language = 'en',
  prefilledText,
}: WhatsAppChoiceModalProps) {
  const isHi = language === 'hi'
  const [botOnline, setBotOnline] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    fetch('/api/whatsapp/live')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setBotOnline(data.status === 'CONNECTED')
        }
      })
      .catch(() => {
        if (isMounted) setBotOnline(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const defaultText = isHi
    ? 'नमस्ते समर्थन, मुझे एक साइबर अपराध घटना की रिपोर्ट करनी है।'
    : 'Hi Samarthan, I want to report a cybercrime incident.'

  const textToForward = prefilledText?.trim() || defaultText
  const realWhatsAppUrl = `https://wa.me/916303807967?text=${encodeURIComponent(textToForward)}`

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#075E54] dark:bg-[#064e46] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {isHi ? 'व्हाट्सएप AI ट्रायज एजेंट' : 'Samarthan WhatsApp AI Triage'}
                </h3>
                <span className="bg-emerald-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  24x7 AI
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                {isHi
                  ? 'Build What Moves India हैकथॉन प्रोटोटाइप सिमुलेशन • कोई आधिकारिक सरकारी वेबसाइट नहीं'
                  : 'Build What Moves India Hackathon Prototype Simulation • Not an Official Government Website'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Option 1: In-App WhatsApp Web Simulator */}
          <div
            onClick={() => {
              onClose()
              onOpenSimulator()
            }}
            className="group relative p-4 sm:p-5 rounded-xl border-2 border-emerald-500/70 dark:border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {isHi ? 'ब्राउज़र में व्हाट्सएप सिम्युलेटर खोलें' : 'In-App WhatsApp Simulator'}
                    </span>
                    <span className="bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {isHi ? 'अनुशंसित' : 'Recommended'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {isHi
                      ? 'बिना फोन के सीधे इसी ऐप में पूरी तरह से कार्यात्मक व्हाट्सएप इंटरफेस। वॉइस नोट, टेक्स्ट और स्क्रीनशॉट सपोर्ट के साथ बिल्कुल असली बॉट की तरह।'
                      : 'Interactive WhatsApp mockup running inside this app. Zero phone needed — test voice notes, screenshot triage, and live complaint generation on the identical GPT-4o engine.'}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <span>{isHi ? 'सिम्युलेटर शुरू करें' : 'Launch In-App Simulator'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Real WhatsApp Bot */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      {isHi ? 'असली व्हाट्सएप ऐप में खोलें' : 'Open Real WhatsApp App'}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      +91 63038 07967
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {isHi
                      ? 'अपने फोन या व्हाट्सएप डेस्कटॉप ऐप पर सीधे हमारे बॉट से चैट करें।'
                      : 'Chat directly in your WhatsApp mobile or web app with our Baileys companion bridge.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Heads-up / Offline notice callout */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">
                  {isHi ? '💡 हैकाथॉन मूल्यांकनकर्ताओं के लिए सूचना:' : '💡 Hackathon Evaluator Heads-up:'}
                </span>
                <span>
                  {isHi
                    ? 'असली व्हाट्सएप बॉट हमारे होस्ट कंप्यूटर के डेमन ब्रिज पर निर्भर करता है। यदि कंप्यूटर स्टैंडबाय में है या नेटवर्क सिंक हो रहा है, तो तुरंत और गारंटीड अनुभव के लिए ऊपर दिए गए "व्हाट्सएप सिम्युलेटर" का उपयोग करें!'
                    : 'The real WhatsApp bot runs via our live host daemon bridge. If the host machine is closed or sleeping, the bot socket might pause. Use the In-App Simulator above for the 100% identical, guaranteed live experience!'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    botOnline === true
                      ? 'bg-emerald-500 animate-pulse'
                      : botOnline === false
                      ? 'bg-amber-500'
                      : 'bg-zinc-400'
                  }`}
                />
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  {botOnline === true
                    ? (isHi ? 'होस्ट बॉट: ऑनलाइन' : 'Host Bridge: Connected')
                    : botOnline === false
                    ? (isHi ? 'होस्ट बॉट: स्टैंडबाय' : 'Host Bridge: Standby / Sleep')
                    : (isHi ? 'स्थिति जांची जा रही है...' : 'Checking bridge...')}
                </span>
              </div>

              <a
                href={realWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>{isHi ? 'व्हाट्सएप खोलें' : 'Open WhatsApp'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-5 sm:px-6 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {isHi ? 'दोनों विकल्प एक ही AI इंजन से संचालित हैं' : 'Both options use the identical Samarthan AI Engine'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline font-medium cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
