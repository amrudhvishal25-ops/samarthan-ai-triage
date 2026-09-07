'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Mic,
  Paperclip,
  CheckCheck,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Square,
  Play,
  Pause,
  Image as ImageIcon,
  Loader2,
  Phone,
  Video,
  MoreVertical,
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
  audioUrl?: string
  imageUrl?: string
  voiceTranscript?: string
  filedData?: TriageResult
  incidentId?: string
}

const PRESETS = [
  {
    label: '⚡ Electricity Scam',
    en: 'My father was scammed of ₹45,000 via a fake electricity bill APK call. Beneficiary UPI is electricitybill@ybl, UTR: 429104829102.',
    hi: 'मेरे पिता से फर्जी बिजली बिल ऐप के नाम पर 45,000 रुपये ठग लिए गए। UPI आईडी: electricitybill@ybl, UTR: 429104829102 है।',
  },
  {
    label: '📈 Trading Fraud',
    en: 'I joined a WhatsApp stock trading group by Vinod Agarwal. Deposited ₹1,20,000 in StockPro app and now they are refusing withdrawal.',
    hi: 'मैंने विनोद अग्रवाल के स्टॉक ट्रेडिंग व्हाट्सएप ग्रुप में 1,20,000 रुपये जमा किए थे, अब वे पैसे निकालने नहीं दे रहे हैं।',
  },
  {
    label: '🚨 Extortion Call',
    en: 'Received threat on Instagram from @cyber_hacker demanding ₹25,000 or they will leak my morphed photos.',
    hi: 'इंस्टाग्राम पर @cyber_hacker द्वारा मेरी तस्वीरें लीक करने की धमकी देकर 25,000 रुपये मांगे जा रहे हैं।',
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
        ? '👋 *नमस्ते! मैं समर्थन (Samarthan) AI साइबर अपराध ट्रायज बॉट हूँ।*\n\nमैं 24x7 आपातकालीन साइबर धोखाधड़ी रिपोर्टिंग और 1930 गोल्डन ऑवर फंड फ्रीज में आपकी सहायता करूँगा।\n\n📋 *अगले चरण के लिए आवश्यक बुनियादी जानकारी:*\n• क्या हुआ (फर्जी कॉल, UPI फ्रॉड, निवेश स्कैम, ब्लैकमेल)\n• खोई हुई राशि (₹)\n• धोखेबाज़ की जानकारी (UPI ID, फोन नंबर, खाता)\n• 12-अंकों का UTR संदर्भ नंबर (यदि पैसे कटे हों)\n\n🎙️ आप **वॉइस नोट 🎤**, टेक्स्ट संदेश ✍️, या लेनदेन का **स्क्रीनशॉट 📸** भेज सकते हैं। मैं तुरंत विश्लेषण कर आपकी FIR शिकायत तैयार करूँगा!'
        : '👋 *Hi, I\'m the Samarthan AI Cybercrime Triage Bot.*\n\nI provide 24x7 automated emergency cybercrime triage and golden-hour fund freeze assistance under the Indian IT Act 2000.\n\n📋 *Basic information needed before the next stage:*\n• What happened (fake bank call, UPI scam, loan app, or investment fraud)\n• Total amount lost in ₹\n• Fraudster details (UPI ID, phone, account, or scam link)\n• 12-digit UTR reference number (if money was debited)\n\n🎙️ Send a **Voice Note 🎤**, type your incident ✍️, or upload a **Payment Screenshot 📸** to begin!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // File input ref for images
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  if (!isOpen) return null

  // Process a text message
  const handleSendText = async (textToSend?: string) => {
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
          incidentId: data.incidentId || data.filedComplaint?.incidentId,
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

  // Real Audio Voice Note Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (audioBlob.size > 500) {
          await handleSendAudio(audioBlob)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Microphone access denied:', err)
      alert(
        isHi
          ? 'माइक्रोफ़ोन की अनुमति उपलब्ध नहीं है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
          : 'Microphone permission was denied. Please allow microphone access in your browser.'
      )
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    audioChunksRef.current = []
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
  }

  const handleSendAudio = async (blob: Blob) => {
    const audioUrl = URL.createObjectURL(blob)
    setIsTyping(true)

    // Convert blob to base64
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1]

      // Transcribe via Whisper chunk API for transcription text
      let transcriptText = ''
      try {
        const fd = new FormData()
        fd.append('audio', blob, 'voicenote.webm')
        fd.append('language', language)
        const trRes = await fetch('/api/transcribe-chunk', { method: 'POST', body: fd })
        if (trRes.ok) {
          const trData = await trRes.json()
          transcriptText = trData.text || ''
        }
      } catch (e) {
        console.warn('Audio transcription preview error:', e)
      }

      const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: transcriptText ? `🎤 "${transcriptText}"` : '🎤 Voice Note',
        audioUrl,
        voiceTranscript: transcriptText,
        timestamp: userTimestamp,
      }

      setMessages((prev) => [...prev, userMsg])

      try {
        const res = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: 'simulator-citizen',
            message: transcriptText,
            audioBase64: base64Data,
            voiceTranscript: transcriptText,
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
            incidentId: data.incidentId || data.filedComplaint?.incidentId,
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
            ? 'वॉयस नोट प्रोसेस करने में समस्या हुई। कृपया दोबारा प्रयास करें।'
            : 'Error processing voice note. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, botMsg])
      } finally {
        setIsTyping(false)
      }
    }
  }

  // Image Upload Handler (Screenshots / UPI Receipts)
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = async () => {
      const dataUrl = reader.result as string
      const cleanBase64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '')

      const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: isHi ? '📸 [लेनदेन का स्क्रीनशॉट/रसीद भेजा]' : '📸 [Screenshot / Payment Receipt]',
        imageUrl: dataUrl,
        timestamp: userTimestamp,
      }

      setMessages((prev) => [...prev, userMsg])
      setIsTyping(true)

      try {
        const res = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: 'simulator-citizen',
            message: 'Screenshot evidence',
            imageBase64: cleanBase64,
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
            incidentId: data.incidentId || data.filedComplaint?.incidentId,
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
            ? 'स्क्रीनशॉट पढ़ने में त्रुटि हुई। कृपया स्पष्ट रसीद दोबारा भेजें।'
            : 'Error reading screenshot. Please upload a clear transaction receipt.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, botMsg])
      } finally {
        setIsTyping(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  const handleReset = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: isHi
          ? '👋 *नमस्ते! मैं समर्थन AI साइबर अपराध ट्रायज बॉट हूँ।*\n\nकृपया अपनी घटना का विवरण लिखकर बताएं, वॉयस नोट 🎤 भेजें, या लेनदेन का स्क्रीनशॉट 📸 साझा करें।'
          : '👋 *Hello! I am Samarthan AI Cybercrime Triage Bot.*\n\nPlease describe what happened: send a Voice Note 🎤, type a message ✍️, or share a Payment Screenshot 📸.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Helper to render text with clickable URLs
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        const isDashboardLink = part.includes('/dashboard?id=')
        let incidentId = ''
        if (isDashboardLink) {
          const match = part.match(/[?&]id=([a-zA-Z0-9_-]+)/)
          if (match) incidentId = match[1]
        }

        return (
          <span key={i}>
            <a
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (isDashboardLink && incidentId) {
                  e.preventDefault()
                  onClose()
                  router.push(`/dashboard?id=${incidentId}`)
                }
              }}
              className="text-blue-600 dark:text-blue-400 underline font-medium break-all hover:text-blue-800 dark:hover:text-blue-300"
            >
              {part}
            </a>
          </span>
        )
      }

      // Convert bold markdown (*text*)
      const boldParts = part.split(/(\*[^*]+\*)/g)
      return (
        <span key={i}>
          {boldParts.map((bp, j) => {
            if (bp.startsWith('*') && bp.endsWith('*')) {
              return <strong key={j}>{bp.slice(1, -1)}</strong>
            }
            return bp
          })}
        </span>
      )
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl h-[94vh] sm:h-[88vh] max-h-[780px] bg-[#EFEAE2] dark:bg-[#0b141a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-300 dark:border-zinc-800"
      >
        {/* Hidden File Input for Image Uploads */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />

        {/* WhatsApp Header */}
        <div className="bg-[#075E54] dark:bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white font-bold border border-emerald-400/50">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] dark:border-[#1f2c34] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold tracking-tight">Samarthan 1930 AI Bot</h3>
                <span className="bg-emerald-500 text-white rounded-full px-1 text-[9px] font-bold">✓</span>
              </div>
              <p className="text-[11px] text-emerald-200 dark:text-emerald-300/80">
                {isTyping ? 'typing...' : 'National Cybercrime Portal Partner • 24x7 Live'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
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
              aria-label="Close"
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
              onClick={() => handleSendText(isHi ? p.hi : p.en)}
              className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-[#202c33] hover:bg-zinc-100 dark:hover:bg-[#2a3942] text-zinc-700 dark:text-zinc-200 rounded-full border border-zinc-300 dark:border-zinc-700 text-[11px] shadow-2xs transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                    isUser
                      ? 'bg-[#D9FDD3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-tr-none'
                      : 'bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/60 dark:border-zinc-700/40'
                  }`}
                >
                  {/* Image Attachment Preview if present */}
                  {m.imageUrl && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 max-w-xs">
                      <img
                        src={m.imageUrl}
                        alt="Evidence Screenshot"
                        className="w-full max-h-60 object-contain bg-black/5"
                      />
                    </div>
                  )}

                  {/* Audio Player if Voice Note */}
                  {m.audioUrl && (
                    <div className="mb-2 p-2 rounded-xl bg-black/5 dark:bg-white/10 flex flex-col gap-1">
                      <audio src={m.audioUrl} controls className="w-full h-8" />
                      {m.voiceTranscript && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 italic px-1">
                          {m.voiceTranscript}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed text-[13.5px]">
                    {renderFormattedText(m.content)}
                  </p>

                  {/* Embedded interactive report button if incident generated */}
                  {(m.incidentId || m.filedData) && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 space-y-2 bg-emerald-50/80 dark:bg-emerald-950/40 -mx-3 -mb-1.5 p-3 rounded-b-2xl">
                      <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{isHi ? 'आधिकारिक NCRP पोर्टल पर दर्ज' : 'Filed on NCRP Legal Portal'}</span>
                        </span>
                        <span className="font-mono text-[11px] bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-md">
                          INC-{m.incidentId || m.filedData?.incidentId}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          router.push(`/dashboard?id=${m.incidentId || m.filedData?.incidentId}`)
                        }}
                        className="w-full mt-1.5 flex items-center justify-center gap-2 bg-[#075E54] hover:bg-[#064E46] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>{isHi ? 'लाइव शिकायत रिपोर्ट व कानूनी ड्राफ्ट खोलें' : 'Open Live Complaint Report & Legal Draft'}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-90" />
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
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#202c33] border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 w-20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Recording Overlay in Input Bar */}
        {isRecording ? (
          <div className="bg-[#F0F2F5] dark:bg-[#202c33] px-4 py-3 flex items-center justify-between border-t border-zinc-300 dark:border-zinc-700/60 flex-shrink-0 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-600 dark:text-red-400 font-mono font-bold text-sm">
                🔴 {formatSeconds(recordingSeconds)}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                {isHi ? 'बोलिए... आपकी आवाज़ रिकॉर्ड हो रही है' : 'Listening... Speak your complaint'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-red-600 font-semibold cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1.5 bg-[#075E54] dark:bg-emerald-600 hover:bg-[#064E46] text-white px-4 py-2 rounded-full text-xs font-bold shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isHi ? 'भेजें' : 'Send'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Input Bar */
          <div className="bg-[#F0F2F5] dark:bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-zinc-300 dark:border-zinc-700/60 flex-shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full transition-colors cursor-pointer"
              title={isHi ? 'स्क्रीनशॉट या रसीद अपलोड करें' : 'Attach screenshot or receipt'}
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
                  handleSendText()
                }
              }}
              placeholder={isHi ? 'संदेश लिखें या माइक दबाकर बोलें...' : 'Type a message or tap mic to speak...'}
              className="flex-1 bg-white dark:bg-[#2a3942] border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-base sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#075E54] dark:focus:ring-emerald-500"
            />

            {input.trim() ? (
              <button
                type="button"
                onClick={() => handleSendText()}
                className="p-2.5 bg-[#075E54] dark:bg-emerald-600 hover:bg-[#064E46] dark:hover:bg-emerald-500 text-white rounded-full transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="p-2.5 bg-[#075E54] dark:bg-emerald-600 hover:bg-[#064E46] dark:hover:bg-emerald-500 text-white rounded-full transition-colors shadow-xs cursor-pointer active:scale-95"
                title={isHi ? 'बोलने के लिए माइक दबाएं' : 'Click to record voice note'}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
