'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Send,
  Mic,
  Paperclip,
  CheckCheck,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTriage } from '@/context/TriageContext'
import { TriageResult } from '@/data/scenarios'

interface WhatsAppSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  language?: 'en' | 'hi'
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  filedData?: TriageResult
  incidentId?: string
}

const PRESETS = [
  {
    en: 'My father was scammed of ₹45,000 via a fake electricity bill APK call. Beneficiary UPI is electricitybill@ybl, UTR: 429104829102.',
    hi: 'मेरे पिता से फर्जी बिजली बिल ऐप के नाम पर 45,000 रुपये ठग लिए गए। UPI आईडी: electricitybill@ybl, UTR: 429104829102 है।',
  },
  {
    en: 'I joined a WhatsApp stock trading group by Vinod Agarwal. Deposited ₹1,20,000 in StockPro app and now they are refusing withdrawal.',
    hi: 'मैंने विनोद अग्रवाल के स्टॉक ट्रेडिंग व्हाट्सएप ग्रुप में 1,20,000 रुपये जमा किए थे, अब वे पैसे निकालने नहीं दे रहे हैं।',
  },
  {
    en: 'Received threat on Instagram from @cyber_hacker demanding ₹25,000 or they will leak my morphed photos.',
    hi: 'इंस्टाग्राम पर @cyber_hacker द्वारा मेरी मॉर्फ की गई तस्वीरें लीक करने की धमकी देकर 25,000 रुपये मांगे जा रहे हैं।',
  },
]

export default function WhatsAppSimulatorModal({
  isOpen,
  onClose,
  language = 'en',
}: WhatsAppSimulatorModalProps) {
  const router = useRouter()
  const { setTriageResult } = useTriage()
  const isHi = language === 'hi'

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: isHi
        ? '👋 नमस्ते! मैं समर्थन (Samarthan) AI साइबर अपराध ट्रायज बॉट हूँ।\n\nमैं 24x7 आपातकालीन साइबर धोखाधड़ी रिपोर्टिंग और 1930 गोल्डन ऑवर फंड फ्रीज में आपकी सहायता करूँगा।\n\n📋 अगले चरण के लिए आवश्यक बुनियादी जानकारी:\n• क्या हुआ (फर्जी कॉल, UPI फ्रॉड, निवेश स्कैम, ब्लैकमेल)\n• खोई हुई राशि (₹)\n• धोखेबाज़ की जानकारी (UPI ID, फोन नंबर, खाता)\n• 12-अंकों का UTR संदर्भ नंबर (यदि उपलब्ध हो)\n\n🎙️ आप वॉइस नोट 🎤, टेक्स्ट संदेश ✍️, या लेनदेन का स्क्रीनशॉट 📸 भेज सकते हैं। मैं तुरंत विश्लेषण कर आपकी FIR शिकायत तैयार करूँगा!'
        : '👋 Hi, I\'m the Samarthan AI Cybercrime Triage Bot.\n\nI provide 24x7 automated emergency cybercrime triage and golden-hour fund freeze assistance under the Indian IT Act 2000.\n\n📋 Basic information needed before the next stage:\n• What happened (fake bank call, UPI scam, loan app, or investment fraud)\n• Total amount lost in ₹\n• Fraudster details (UPI ID, phone, account, or scam link)\n• 12-digit UTR reference number (if money was debited)\n\n🎙️ Send a Voice Note 🎤, type your incident ✍️, or upload a Payment Screenshot 📸 to begin!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (!isOpen) return null

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || isTyping) return

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: userTimestamp,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: 'simulator-citizen',
          message: text,
        }),
      })

      const data = await res.json()
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      if (data.reply) {
        const botMsg: Message = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: botTimestamp,
          filedData: data.filedComplaint,
          incidentId: data.incidentId,
        }
        setMessages((prev) => [...prev, botMsg])

        if (data.filedComplaint) {
          setTriageResult(data.filedComplaint)
        }
      }
    } catch {
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: isHi
          ? 'नेटवर्क त्रुटि हुई। कृपया दोबारा प्रयास करें या सीधे 1930 पर कॉल करें।'
          : 'Network issue. Please try again or call National Helpline 1930 directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleReset = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: isHi
          ? '👋 नमस्ते! मैं समर्थन AI साइबर अपराध ट्रायज बॉट हूँ। कृपया अपनी घटना का विवरण दें।'
          : '👋 Hello! I am Samarthan AI Cybercrime Triage Bot. Please describe what happened to file your complaint.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl h-[92vh] sm:h-[85vh] max-h-[750px] bg-[#EFEAE2] dark:bg-[#0b141a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-300 dark:border-zinc-800"
      >
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] dark:bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white font-bold border border-emerald-400/50">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold tracking-tight">Samarthan 1930 AI Bot</h3>
                <span className="bg-emerald-500 text-white rounded-full px-1 text-[10px] font-bold">✓</span>
              </div>
              <p className="text-[11px] text-emerald-200 dark:text-emerald-300/80">
                {isTyping ? 'typing...' : 'National Cyber Crime Partner • Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              title="Reset conversation"
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/40 dark:hover:bg-zinc-700/50 rounded-full transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/40 dark:hover:bg-zinc-700/50 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Prompt Pills */}
        <div className="bg-[#F0F2F5] dark:bg-[#111b21] border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide text-xs flex-shrink-0">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap text-[11px]">
            {isHi ? 'त्वरित उदाहरण:' : 'Try prompt:'}
          </span>
          {PRESETS.map((p, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSend(isHi ? p.hi : p.en)}
              className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-[#202c33] hover:bg-zinc-100 dark:hover:bg-[#2a3942] text-zinc-700 dark:text-zinc-200 rounded-full border border-zinc-300 dark:border-zinc-700 text-[11px] shadow-2xs transition-colors cursor-pointer"
            >
              {idx === 0 ? '⚡ Electricity Scam' : idx === 1 ? '📈 Trading Fraud' : '🚨 Extortion'}
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2 text-sm shadow-xs ${
                    isUser
                      ? 'bg-[#D9FDD3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-tr-none'
                      : 'bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/60 dark:border-zinc-700/40'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[13.5px]">{m.content}</p>

                  {/* Embedded filing card if incident registered */}
                  {m.filedData && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-100 dark:border-emerald-800/40 space-y-2 bg-emerald-50/70 dark:bg-emerald-950/40 -mx-2 -mb-1 p-2.5 rounded-b-xl">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{isHi ? 'आधिकारिक पोर्टल पर दर्ज' : 'Filed on National Cybercrime Portal'}</span>
                      </div>
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 flex justify-between">
                        <span>Incident:</span>
                        <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">{m.incidentId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          router.push(`/dashboard?id=${m.incidentId}`)
                        }}
                        className="w-full mt-1.5 flex items-center justify-center gap-1.5 bg-[#075E54] dark:bg-emerald-700 hover:bg-[#064E46] dark:hover:bg-emerald-600 text-white py-1.5 px-3 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>{isHi ? 'लाइव समर्थन डैशबोर्ड खोलें' : 'Open in Live Dashboard'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-zinc-400 dark:text-zinc-400">
                    <span>{m.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </div>
            )
          })}

          {isTyping && (
            <div className="flex items-center gap-1 bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 w-16 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#F0F2F5] dark:bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-zinc-300 dark:border-zinc-700/60 flex-shrink-0">
          <button
            type="button"
            onClick={() =>
              handleSend(
                isHi
                  ? 'मेरे बैंक खाते से अनधिकृत 50,000 रुपये कट गए हैं।'
                  : 'Unauthorized 50,000 INR was deducted from my bank account via a suspicious APK.'
              )
            }
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full transition-colors cursor-pointer"
            title="Attach evidence"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={isHi ? 'संदेश लिखें...' : 'Type a message...'}
            className="flex-1 bg-white dark:bg-[#2a3942] border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-base sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#075E54] dark:focus:ring-emerald-500"
          />

          {input.trim() ? (
            <button
              type="button"
              onClick={() => handleSend()}
              className="p-2.5 bg-[#075E54] dark:bg-emerald-600 hover:bg-[#064E46] dark:hover:bg-emerald-500 text-white rounded-full transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                handleSend(isHi ? 'नमस्ते, मुझे सहायता चाहिए।' : 'Hi, I need emergency assistance.')
              }
              className="p-2.5 bg-[#075E54] dark:bg-emerald-600 hover:bg-[#064E46] dark:hover:bg-emerald-500 text-white rounded-full transition-colors shadow-xs cursor-pointer"
              title="Voice simulation"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
