'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Mic, Paperclip, CheckCheck, ShieldCheck, PhoneCall, ExternalLink, RotateCcw, AlertTriangle } from 'lucide-react'
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

export default function WhatsAppSimulatorModal({ isOpen, onClose, language = 'en' }: WhatsAppSimulatorModalProps) {
  const router = useRouter()
  const { setTriageResult } = useTriage()
  const isHi = language === 'hi'

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: isHi
        ? 'नमस्ते! मैं समर्थन राष्ट्रीय साइबर अपराध AI सहायक हूँ।\n\nकृपया अपनी समस्या बताएं (जैसे: अनधिकृत पैसे कटना, ऑनलाइन ब्लैकमेल, या फर्जी निवेश)। आप वॉइस नोट, टेक्स्ट, या स्क्रीनशॉट भेज सकते हैं। 60 सेकंड में आपकी शिकायत दर्ज होगी।'
        : 'Hello! I am Samarthan AI Cybercrime Triage Assistant.\n\nPlease describe what happened (e.g. money debited, online blackmail, or fake investment). I will extract details, assess urgency, and file your formal complaint in 60 seconds.',
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
          ? 'नमस्ते! मैं समर्थन राष्ट्रीय साइबर अपराध AI सहायक हूँ। बताएं आपके साथ क्या हुआ?'
          : 'Hello! I am Samarthan AI Cybercrime Assistant. Describe your issue to file your complaint.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl h-[92vh] sm:h-[85vh] max-h-[750px] bg-[#EFEAE2] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-zinc-300"
      >
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold border border-emerald-400">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold tracking-tight">Samarthan 1930 AI Bot</h3>
                <span className="bg-emerald-500 text-white rounded-full p-0.5 text-[10px]">✓</span>
              </div>
              <p className="text-[11px] text-emerald-200">
                {isTyping ? 'typing...' : 'National Cyber Crime Portal Partner • Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/40 rounded-full transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/40 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Prompt Pills */}
        <div className="bg-[#F0F2F5] border-b border-zinc-200 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide text-xs">
          <span className="text-zinc-500 font-medium whitespace-nowrap text-[11px]">
            {isHi ? 'त्वरित उदाहरण:' : 'Try prompt:'}
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(isHi ? p.hi : p.en)}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-700 rounded-full border border-zinc-300 text-[11px] shadow-2xs transition-colors"
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
                  className={`max-w-[85%] rounded-lg px-3.5 py-2 text-sm shadow-xs ${
                    isUser
                      ? 'bg-[#D9FDD3] text-zinc-900 rounded-tr-none'
                      : 'bg-white text-zinc-900 rounded-tl-none border border-zinc-200/60'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[13.5px]">{m.content}</p>
                  
                  {/* Embedded filing card if incident registered */}
                  {m.filedData && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-100 space-y-2 bg-emerald-50/70 -mx-2 -mb-1 p-2.5 rounded-b-md">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{isHi ? 'आधिकारिक पोर्टल पर दर्ज' : 'Filed on National Cybercrime Portal'}</span>
                      </div>
                      <div className="text-xs text-zinc-700 flex justify-between">
                        <span>Incident:</span>
                        <span className="font-mono font-bold text-emerald-900">{m.incidentId}</span>
                      </div>
                      <button
                        onClick={() => {
                          onClose()
                          router.push(`/dashboard?id=${m.incidentId}`)
                        }}
                        className="w-full mt-1.5 flex items-center justify-center gap-1.5 bg-[#075E54] hover:bg-[#064E46] text-white py-1.5 px-3 rounded-md text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>{isHi ? 'लाइव समर्थन डैशबोर्ड खोलें' : 'Open in Live Dashboard'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-zinc-400">
                    <span>{m.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </div>
            )
          })}

          {isTyping && (
            <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 w-16 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#F0F2F5] px-3 py-2.5 flex items-center gap-2 border-t border-zinc-300">
          <button
            type="button"
            onClick={() => handleSend(isHi ? 'मेरे बैंक खाते से अनधिकृत 50,000 रुपये कट गए हैं।' : 'Unauthorized 50,000 INR was deducted from my bank account via a suspicious APK.')}
            className="p-2 text-zinc-500 hover:text-zinc-700 rounded-full transition-colors"
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
            className="flex-1 bg-white border border-zinc-200 rounded-lg px-4 py-2 text-base sm:text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#075E54]"
          />

          {input.trim() ? (
            <button
              type="button"
              onClick={() => handleSend()}
              className="p-2.5 bg-[#075E54] hover:bg-[#064E46] text-white rounded-full transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSend(isHi ? 'नमस्ते, मुझे सहायता चाहिए।' : 'Hi, I need emergency assistance.')}
              className="p-2.5 bg-[#075E54] hover:bg-[#064E46] text-white rounded-full transition-colors shadow-xs"
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
