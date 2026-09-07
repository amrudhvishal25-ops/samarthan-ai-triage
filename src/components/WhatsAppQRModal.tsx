'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  QrCode,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Play,
  LogOut,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'

interface WhatsAppQRModalProps {
  isOpen: boolean
  onClose: () => void
  language?: 'en' | 'hi'
}

interface LiveState {
  isRunning: boolean
  status: 'DISCONNECTED' | 'INITIALIZING' | 'SCAN_QR' | 'CONNECTED' | 'ERROR'
  qrDataUrl: string | null
  userPhone: string | null
  startedAt?: number
  error?: string
}

export default function WhatsAppQRModal({
  isOpen,
  onClose,
  language = 'en',
}: WhatsAppQRModalProps) {
  const hi = language === 'hi'
  const [state, setState] = useState<LiveState>({
    isRunning: false,
    status: 'DISCONNECTED',
    qrDataUrl: null,
    userPhone: null,
  })
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [copiedCmd, setCopiedCmd] = useState(false)

  // Poll status when modal is open
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/whatsapp/live')
        if (res.ok && isMounted) {
          const data: LiveState = await res.json()
          setState(data)
        }
      } catch (e) {
        console.error('Failed to poll WhatsApp bot status:', e)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 2000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setIsActionLoading(true)
    try {
      await fetch('/api/whatsapp/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      // Immediate re-fetch
      const res = await fetch('/api/whatsapp/live')
      if (res.ok) {
        const data = await res.json()
        setState(data)
      }
    } catch (e) {
      console.error(`Action ${action} failed:`, e)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm run whatsapp-bot')
    setCopiedCmd(true)
    setTimeout(() => setCopiedCmd(false), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white rounded-lg border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-surface">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 leading-tight">
                  {hi ? 'व्हाट्सएप बॉट लिंक करें' : 'Link WhatsApp Cybercrime Bot'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {hi ? '100% फ्री - बिना किसी सशुल्क सेवा के' : '100% Free - Direct WhatsApp Multi-Device'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Status 1: Bot service not running / Disconnected */}
            {!state.isRunning && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-900">
                    {hi ? 'बॉट सर्विस शुरू करें' : 'Start the WhatsApp Service'}
                  </h4>
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    {hi
                      ? 'अपने व्हाट्सएप को लिंक करने और सीधे चैट से शिकायतें दर्ज करने के लिए नीचे दिए बटन से बॉट शुरू करें।'
                      : 'Launch the companion service to stream a live QR code and triage complaints directly from your WhatsApp.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction('start')}
                    disabled={isActionLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-md px-6 py-3 text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {isActionLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-white" />
                    )}
                    <span>{hi ? 'बॉट शुरू करें (Start Bot)' : 'Start WhatsApp Bot'}</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 text-left">
                  <p className="text-xs text-zinc-500 font-medium mb-1.5">
                    {hi ? 'वैकल्पिक: टर्मिनल से चलाएं' : 'Or run via terminal:'}
                  </p>
                  <div
                    onClick={handleCopyCommand}
                    className="cursor-pointer group flex items-center justify-between bg-zinc-900 text-zinc-200 text-xs font-mono px-3.5 py-2.5 rounded-md border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <span>npm run whatsapp-bot</span>
                    <span className="text-[11px] text-zinc-400 group-hover:text-white">
                      {copiedCmd ? 'Copied!' : 'Copy'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status 2: Initializing */}
            {state.isRunning && state.status === 'INITIALIZING' && (
              <div className="text-center py-10 space-y-4">
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-zinc-900">
                    {hi ? 'व्हाट्सएप ब्रिज से जुड़ रहे हैं...' : 'Initializing WhatsApp Bridge...'}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {hi ? 'QR कोड जनरेट हो रहा है, कृपया प्रतीक्षा करें' : 'Establishing secure connection and generating QR code...'}
                  </p>
                </div>
              </div>
            )}

            {/* Status 3: Live QR Code to scan */}
            {state.isRunning && state.status === 'SCAN_QR' && state.qrDataUrl && (
              <div className="space-y-5">
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {hi ? 'लाइव QR कोड तैयार है' : 'Live QR Ready to Scan'}
                  </span>
                </div>

                {/* QR Display Card */}
                <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div className="p-2 bg-white rounded-md border border-zinc-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={state.qrDataUrl}
                      alt="Scan WhatsApp QR"
                      className="w-56 h-56 md:w-64 md:h-64 object-contain rounded-md"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2.5">
                    {hi ? 'सुरक्षा: QR कोड हर 40 सेकंड में स्वतः रिफ्रेश होता है' : 'Auto-refreshes periodically. Encrypted end-to-end.'}
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-2.5 bg-blue-50/60 p-4 rounded-lg border border-blue-100 text-xs text-zinc-700">
                  <p className="font-semibold text-primary">
                    {hi ? 'अपने फ़ोन से स्कैन कैसे करें:' : 'How to scan from your phone:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-600">
                    <li>{hi ? 'अपने फ़ोन में WhatsApp खोलें' : 'Open WhatsApp on your phone'}</li>
                    <li>
                      {hi
                        ? 'सेटिंग्स (Settings) या ऊपर दायें तीन डॉट्स (⋮) पर टैप करें'
                        : 'Tap Settings (iOS) or Menu ⋮ (Android)'}
                    </li>
                    <li>
                      {hi
                        ? 'लिंक किए गए डिवाइस (Linked Devices) चुनें'
                        : 'Select Linked Devices'}
                    </li>
                    <li>
                      {hi
                        ? 'डिवाइस लिंक करें (Link a Device) दबाकर इस QR कोड को स्कैन करें'
                        : 'Tap "Link a Device" and scan this QR code'}
                    </li>
                  </ol>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleAction('restart')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium py-1 px-2.5 rounded-md border border-zinc-200 hover:bg-zinc-100 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isActionLoading ? 'animate-spin' : ''}`} />
                    <span>{hi ? 'नया QR कोड जनरेट करें' : 'Regenerate QR'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction('stop')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium py-1 px-2.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{hi ? 'सर्विस रोकें' : 'Stop Service'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Status 4: Connected! */}
            {state.isRunning && state.status === 'CONNECTED' && (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 mx-auto rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-zinc-900">
                    {hi ? 'व्हाट्सएप सफलतापूर्वक कनेक्ट हो गया!' : 'WhatsApp Connected Successfully!'}
                  </h4>
                  <p className="text-sm font-semibold text-emerald-700 mt-1">
                    {state.userPhone ? `Linked: ${state.userPhone}` : 'Bot Active'}
                  </p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
                    {hi
                      ? 'समर्थन AI ट्रायज बॉट अब सक्रिय है। आप इस नंबर पर किसी भी भाषा में साइबर धोखाधड़ी का संदेश या वॉयस नोट भेजकर परीक्षण कर सकते हैं।'
                      : 'Samarthan AI is actively listening. Send any complaint (UPI fraud, extortion, phishing) to this WhatsApp account for instant triage and portal filing.'}
                  </p>
                </div>

                {/* Capabilities Banner */}
                <div className="bg-surface border border-zinc-200 rounded-lg p-4 text-left text-xs space-y-2">
                  <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{hi ? 'सक्रिय AI सुविधाएं:' : 'Active AI Capabilities:'}</span>
                  </p>
                  <ul className="space-y-1 text-zinc-600 list-disc list-inside">
                    <li>{hi ? 'वॉइस नोट और टेक्स्ट ऑटो-ट्रांसक्रिप्शन' : 'Voice note and text multi-turn triage'}</li>
                    <li>{hi ? 'BNS और IT Act धाराओं का स्वतः निर्धारण' : 'Automatic BNS & IT Act legal citation'}</li>
                    <li>{hi ? 'सीधे समर्थन पोर्टल डेटाबेस में FIR दर्ज' : 'Direct complaint persistence in Neon DB'}</li>
                    <li>{hi ? 'गोल्डन ऑवर बैंक खाता फ्रीज निर्देश' : 'Instant 1930 & Golden Hour freeze guidance'}</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={
                      state.userPhone
                        ? `https://wa.me/${state.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            hi
                              ? 'नमस्ते समर्थन, मुझे एक साइबर धोखाधड़ी की रिपोर्ट करनी है।'
                              : 'Hi Samarthan, I want to report a cybercrime incident.'
                          )}`
                        : 'https://web.whatsapp.com'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white rounded-md px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{hi ? 'एजेंट को व्हाट्सएप पर मैसेज करें' : 'Message Agent on WhatsApp'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleAction('restart')}
                    disabled={isActionLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-zinc-500" />
                    <span>{hi ? 'खाता बदलें / अनलिंक' : 'Unlink Account'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error state */}
            {state.status === 'ERROR' && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{hi ? 'कनेक्शन त्रुटि' : 'Bridge Error'}</p>
                  <p className="mt-0.5">{state.error || 'Failed to start WhatsApp bridge.'}</p>
                  <button
                    type="button"
                    onClick={() => handleAction('restart')}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline"
                  >
                    {hi ? 'पुनः प्रयास करें' : 'Try Again'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-surface border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  state.status === 'CONNECTED'
                    ? 'bg-emerald-500'
                    : state.isRunning
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-zinc-400'
                }`}
              />
              <span>
                {state.status === 'CONNECTED'
                  ? hi
                    ? 'कनेक्टेड'
                    : 'Live & Connected'
                  : state.isRunning
                  ? hi
                    ? 'QR स्कैन की प्रतीक्षा...'
                    : 'Awaiting QR scan...'
                  : hi
                    ? 'ऑफ़लाइन'
                    : 'Offline'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-600 hover:text-zinc-900 font-medium"
            >
              {hi ? 'बंद करें' : 'Done'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
