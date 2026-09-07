'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Sparkles,
  FileCheck,
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

// Canvas helper to compress & resize images under 200KB to stay well under Vercel payload limit
async function compressAndResizeImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Generates an authentic simulated UPI fraud receipt on an HTML5 canvas for instant 1-click testing
function generateSampleReceiptCanvas(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 760
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Background
  ctx.fillStyle = '#f1f5f9'
  ctx.fillRect(0, 0, 600, 760)

  // Top Header Card (Green UPI Theme)
  ctx.fillStyle = '#047857'
  ctx.fillRect(0, 0, 600, 180)

  // Checkmark circle
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(300, 65, 34, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#047857'
  ctx.font = 'bold 34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('✓', 300, 77)

  // Amount text
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px sans-serif'
  ctx.fillText('Paid ₹45,000', 300, 135)
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#a7f3d0'
  ctx.fillText('UPI Transaction Successful', 300, 160)

  // Details Container Card
  ctx.fillStyle = '#ffffff'
  if (ctx.roundRect) {
    ctx.roundRect(35, 200, 530, 480, 16)
  } else {
    ctx.fillRect(35, 200, 530, 480)
  }
  ctx.fill()
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = '#64748b'
  ctx.font = '13px sans-serif'
  ctx.fillText('To (Beneficiary UPI ID)', 65, 240)
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 17px monospace'
  ctx.fillText('electricitybill@ybl', 65, 266)

  ctx.fillStyle = '#64748b'
  ctx.font = '13px sans-serif'
  ctx.fillText('Beneficiary Name', 65, 305)
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 17px sans-serif'
  ctx.fillText('State Electricity Power Services Ltd', 65, 330)

  ctx.fillStyle = '#64748b'
  ctx.font = '13px sans-serif'
  ctx.fillText('UPI Ref / UTR Number', 65, 370)
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 19px monospace'
  ctx.fillText('429104829102', 65, 396)

  ctx.fillStyle = '#64748b'
  ctx.font = '13px sans-serif'
  ctx.fillText('Transaction Date & Time', 65, 436)
  ctx.fillStyle = '#0f172a'
  ctx.font = '15px sans-serif'
  ctx.fillText('07 Sep 2026, 14:32:10 IST', 65, 460)

  ctx.fillStyle = '#64748b'
  ctx.font = '13px sans-serif'
  ctx.fillText('Debited From Account', 65, 500)
  ctx.fillStyle = '#0f172a'
  ctx.font = '15px sans-serif'
  ctx.fillText('State Bank of India (A/C **5402)', 65, 524)

  // Suspicious notice banner
  ctx.fillStyle = '#fef2f2'
  if (ctx.roundRect) {
    ctx.roundRect(65, 560, 470, 85, 10)
  } else {
    ctx.fillRect(65, 560, 470, 85)
  }
  ctx.fill()
  ctx.strokeStyle = '#fecaca'
  ctx.stroke()

  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('⚠️ SUSPECTED FRAUDULENT DEBIT REPORT', 85, 592)
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#7f1d1d'
  ctx.fillText('Disputed under Cybercrime Golden Hour (Helpline 1930 / Samarthan)', 85, 616)

  return canvas.toDataURL('image/jpeg', 0.85)
}

export default function WhatsAppSimulatorModal({
  isOpen,
  onClose,
  language = 'en',
}: WhatsAppSimulatorModalProps) {
  const router = useRouter()
  const { setTriageResult } = useTriage()
  const isHi = language === 'hi'

  // Hydration safety for createPortal
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamic Simulator Session ID - clean isolated state for every simulation run
  const [simSessionId, setSimSessionId] = useState<string>(
    () => `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  )
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null)

  const initialGreeting = isHi
    ? '👋 *नमस्ते! मैं समर्थन (Samarthan) AI साइबर अपराध ट्रायज बॉट हूँ।*\n\nमैं 24x7 आपातकालीन साइबर धोखाधड़ी रिपोर्टिंग और 1930 गोल्डन ऑवर फंड फ्रीज में आपकी सहायता करूँगा।\n\n📋 *अगले चरण के लिए आवश्यक बुनियादी जानकारी:*\n• क्या हुआ (फर्जी कॉल, UPI फ्रॉड, निवेश स्कैम, ब्लैकमेल)\n• खोई हुई राशि (₹)\n• धोखेबाज़ की जानकारी (UPI ID, फोन नंबर, खाता)\n• 12-अंकों का UTR संदर्भ नंबर (यदि पैसे कटे हों)\n\n🎙️ आप **वॉइस नोट 🎤**, टेक्स्ट संदेश ✍️, या लेनदेन का **स्क्रीनशॉट 📸** भेज सकते हैं। मैं तुरंत विश्लेषण कर आपकी FIR शिकायत तैयार करूँगा!'
    : '👋 *Hi, I\'m the Samarthan AI Cybercrime Triage Bot.*\n\nI provide 24x7 automated emergency cybercrime triage and golden-hour fund freeze assistance under the Indian IT Act 2000.\n\n📋 *Basic information needed before the next stage:*\n• What happened (fake bank call, UPI scam, loan app, or investment fraud)\n• Total amount lost in ₹\n• Fraudster details (UPI ID, phone, account, or scam link)\n• 12-digit UTR reference number (if money was debited)\n\n🎙️ Send a **Voice Note 🎤**, type your incident ✍️, or upload a **Payment Screenshot 📸** to begin!'

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatFeedRef = useRef<HTMLDivElement>(null)

  // Audio Recording & Web Speech Recognition states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [liveSpeechText, setLiveSpeechText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speechRecognitionRef = useRef<any>(null)
  const liveTranscriptRef = useRef<string>('')
  const recordedMimeTypeRef = useRef<string>('audio/webm')

  // Text-To-Speech (Speaker) state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)

  // Attachment dropdown state & file input
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset session when modal opens fresh so no old test data lingers
  useEffect(() => {
    if (isOpen) {
      const freshSimId = `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      setSimSessionId(freshSimId)
      setActiveIncidentId(null)
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: 'assistant',
          content: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setInput('')
      setLiveSpeechText('')
      setShowAttachMenu(false)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isOpen])

  // Efficient direct scroll — triggered ONLY when message count changes or typing starts (NO LAG)
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight
    }
  }, [messages.length, isTyping])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      try {
        speechRecognitionRef.current?.stop?.()
      } catch {}
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!isOpen || !mounted) return null

  // Reset entire simulator conversation to start brand new
  const handleReset = async () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    const freshSimId = `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    setSimSessionId(freshSimId)
    setActiveIncidentId(null)
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: isHi
          ? '👋 *नई सिम्युलेशन शुरू हुई।*\n\nअपनी घटना का विवरण बोलकर बताएं 🎤, संदेश लिखें ✍️, या भुगतान स्क्रीनशॉट 📸 साझा करें।'
          : '👋 *Simulation reset. Ready for a new complaint.*\n\nDescribe what happened: record a voice note 🎤, type your incident ✍️, or upload a payment screenshot 📸.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
    setLiveSpeechText('')
    setShowAttachMenu(false)

    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: freshSimId,
          resetSession: true,
          isSimulator: true,
        }),
      })
    } catch {}
  }

  // Text-To-Speech (Speaker) Reader
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel()
      setSpeakingMsgId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text
      .replace(/https?:\/\/[^\s]+/g, 'link to complaint report')
      .replace(/[*_#`~]/g, '')
      .replace(/[•👉📌🤖💰🔢👤]/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = isHi ? 'hi-IN' : 'en-IN'
    utterance.rate = 1.05

    utterance.onend = () => setSpeakingMsgId(null)
    utterance.onerror = () => setSpeakingMsgId(null)

    setSpeakingMsgId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  // Send a Text Message (or follow-up update in the same window)
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
          phoneNumber: simSessionId,
          message: text,
          activeIncidentId: activeIncidentId || undefined,
          isSimulator: true,
        }),
      })

      const data = await res.json()
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      if (data.reply) {
        const returnedIncidentId = data.incidentId || data.filedComplaint?.incidentId || activeIncidentId
        if (returnedIncidentId && !activeIncidentId) {
          setActiveIncidentId(returnedIncidentId)
        }

        const botMsg: Message = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: botTimestamp,
          filedData: data.filedComplaint,
          incidentId: returnedIncidentId || undefined,
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

  // Real Audio Voice Recording with Live Speech Recognition (Microphone / Speaker)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const supportedMime = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav',
      ].find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || ''

      recordedMimeTypeRef.current = supportedMime || 'audio/webm'

      const mediaRecorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      liveTranscriptRef.current = ''
      setLiveSpeechText('')

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const finalBlob = new Blob(audioChunksRef.current, {
          type: recordedMimeTypeRef.current || 'audio/webm',
        })
        const capturedSpeech = liveTranscriptRef.current || liveSpeechText
        await handleSendAudio(finalBlob, capturedSpeech)
      }

      if (typeof window !== 'undefined') {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRec) {
          try {
            const recognition = new SpeechRec()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = isHi ? 'hi-IN' : 'en-IN'

            recognition.onresult = (event: any) => {
              let text = ''
              for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript
              }
              if (text.trim()) {
                setLiveSpeechText(text.trim())
                liveTranscriptRef.current = text.trim()
              }
            }

            recognition.start()
            speechRecognitionRef.current = recognition
          } catch (srErr) {
            console.warn('SpeechRecognition init error:', srErr)
          }
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
          ? 'माइक्रोफ़ोन की अनुमति उपलब्ध नहीं है। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।'
          : 'Microphone permission was not granted. Please allow microphone access in your browser settings.'
      )
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)

    try {
      speechRecognitionRef.current?.stop?.()
    } catch {}

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setLiveSpeechText('')
    liveTranscriptRef.current = ''
    audioChunksRef.current = []

    try {
      speechRecognitionRef.current?.stop?.()
    } catch {}

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
  }

  const handleSendAudio = async (blob: Blob, immediateSpeechTranscript?: string) => {
    const audioUrl = URL.createObjectURL(blob)
    setIsTyping(true)

    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1]

      let transcriptText = (immediateSpeechTranscript || '').trim()

      if (!transcriptText && blob.size > 800) {
        try {
          const fd = new FormData()
          const ext = recordedMimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'
          fd.append('audio', blob, `voicenote.${ext}`)
          fd.append('language', language)
          const trRes = await fetch('/api/transcribe-chunk', { method: 'POST', body: fd })
          if (trRes.ok) {
            const trData = await trRes.json()
            if (trData.text) transcriptText = trData.text.trim()
          }
        } catch (e) {
          console.warn('Audio transcription preview error:', e)
        }
      }

      const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: transcriptText ? `🎤 "${transcriptText}"` : (isHi ? '🎤 वॉयस नोट रिकॉर्डिंग' : '🎤 Voice Note Recording'),
        audioUrl,
        voiceTranscript: transcriptText || undefined,
        timestamp: userTimestamp,
      }

      setMessages((prev) => [...prev, userMsg])
      setLiveSpeechText('')
      liveTranscriptRef.current = ''

      try {
        const res = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: simSessionId,
            message: transcriptText || (isHi ? 'वॉयस नोट शिकायत विवरण' : 'Voice note complaint details'),
            voiceTranscript: transcriptText || undefined,
            audioBase64: base64Data,
            audioMimeType: recordedMimeTypeRef.current || 'audio/webm',
            activeIncidentId: activeIncidentId || undefined,
            isSimulator: true,
          }),
        })

        const data = await res.json()
        const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        if (data.reply) {
          const returnedIncidentId = data.incidentId || data.filedComplaint?.incidentId || activeIncidentId
          if (returnedIncidentId && !activeIncidentId) {
            setActiveIncidentId(returnedIncidentId)
          }

          const botMsg: Message = {
            id: `b-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: botTimestamp,
            filedData: data.filedComplaint,
            incidentId: returnedIncidentId || undefined,
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
            : 'Error processing voice note. Please try again or type your complaint.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, botMsg])
      } finally {
        setIsTyping(false)
      }
    }
  }

  // Image Upload Handler (Real file or Sample Canvas Receipt)
  const processImageBase64 = async (dataUrl: string, captionText?: string) => {
    setShowAttachMenu(false)
    const cleanBase64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: captionText || (isHi ? '📸 [लेनदेन का स्क्रीनशॉट/रसीद भेजा]' : '📸 [Payment Receipt / Fraud Screenshot]'),
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
          phoneNumber: simSessionId,
          message: captionText || 'Payment screenshot evidence',
          imageBase64: cleanBase64,
          activeIncidentId: activeIncidentId || undefined,
          isSimulator: true,
        }),
      })

      const data = await res.json()
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      if (data.reply) {
        const returnedIncidentId = data.incidentId || data.filedComplaint?.incidentId || activeIncidentId
        if (returnedIncidentId && !activeIncidentId) {
          setActiveIncidentId(returnedIncidentId)
        }

        const botMsg: Message = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: botTimestamp,
          filedData: data.filedComplaint,
          incidentId: returnedIncidentId || undefined,
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

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const compressedDataUrl = await compressAndResizeImage(file, 1200, 1200, 0.82)
      await processImageBase64(
        compressedDataUrl,
        isHi ? `📸 [अपलोड किया: ${file.name}]` : `📸 [Uploaded: ${file.name}]`
      )
    } catch (err) {
      console.error('Image compression error:', err)
      alert(isHi ? 'चित्र लोड करने में असमर्थ' : 'Could not process the selected image')
    }
  }

  // 1-Click Sample UPI Receipt Generator
  const handleSampleReceiptClick = async () => {
    const sampleDataUrl = generateSampleReceiptCanvas()
    if (sampleDataUrl) {
      await processImageBase64(
        sampleDataUrl,
        isHi
          ? '📸 [नमूना UPI धोखाधड़ी रसीद: ₹45,000 (electricitybill@ybl)]'
          : '📸 [Sample UPI Fraud Receipt: ₹45,000 to electricitybill@ybl]'
      )
    }
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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl h-[88vh] max-h-[740px] bg-[#EFEAE2] dark:bg-[#0b141a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-300 dark:border-zinc-800 my-auto"
      >
        {/* Hidden File Input for Image Uploads */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />

        {/* WhatsApp Header - Always 100% visible & comfortable */}
        <div className="bg-[#075E54] dark:bg-[#1f2c34] text-white px-4 py-3.5 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white font-bold border border-emerald-400/50 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] dark:border-[#1f2c34] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-semibold tracking-tight">Samarthan 1930 AI Bot</h3>
                <span className="bg-emerald-500 text-white rounded-full px-1 text-[9px] font-bold">✓</span>
                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                  GPT-4o API
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 dark:text-emerald-300/80">
                {isTyping
                  ? '⚡ GPT-4o is triaging & drafting legal sections...'
                  : activeIncidentId
                  ? `Active Case: ${activeIncidentId} • Auto-Sync Active`
                  : 'Live 24x7 Cybercrime AI Triage • National Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              title={isHi ? 'नई सिम्युलेशन शुरू करें (डेटा साफ करें)' : 'Start Fresh Simulation (Clear data)'}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-200 hover:text-white bg-emerald-800/40 hover:bg-emerald-800/80 rounded-lg transition-colors cursor-pointer border border-emerald-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">{isHi ? 'नया केस' : 'Start Fresh'}</span>
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

        {/* Live Active Case Ribbon if complaint filed */}
        {activeIncidentId && (
          <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs flex items-center justify-between flex-shrink-0 shadow-inner">
            <span className="flex items-center gap-1.5 font-medium">
              <FileCheck className="w-3.5 h-3.5" />
              <span>
                {isHi ? 'सक्रिय केस दर्ज: ' : 'Active Case Filed: '}
                <strong>{activeIncidentId}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                onClose()
                router.push(`/dashboard?id=${activeIncidentId}`)
              }}
              className="flex items-center gap-1 bg-white text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] hover:bg-emerald-50 cursor-pointer shadow-xs"
            >
              <span>{isHi ? 'वेबसाइट पर देखें →' : 'View on Website →'}</span>
            </button>
          </div>
        )}

        {/* Preset Prompt & Quick Actions Bar */}
        <div className="bg-[#F0F2F5] dark:bg-[#111b21] border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide text-xs flex-shrink-0">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap text-[11px]">
            {isHi ? 'त्वरित कार्रवाई:' : 'Quick actions:'}
          </span>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`whitespace-nowrap flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
              isRecording
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>{isRecording ? (isHi ? 'रिकॉर्डिंग रोकें' : 'Stop Speaking') : (isHi ? 'बोलकर बताएं' : 'Speak Complaint')}</span>
          </button>

          <button
            type="button"
            onClick={handleSampleReceiptClick}
            className="whitespace-nowrap flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-full text-[11px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>{isHi ? '₹45K रसीद जोड़ें' : 'Attach ₹45K Receipt'}</span>
          </button>

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

        {/* Message Feed - Hardware Accelerated Smooth Scroll without CPU thrash */}
        <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                    isUser
                      ? 'bg-[#D9FDD3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-tr-none'
                      : 'bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/60 dark:border-zinc-700/40'
                  }`}
                >
                  {/* Image Attachment Preview */}
                  {m.imageUrl && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 max-w-xs shadow-xs">
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
                          "{m.voiceTranscript}"
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

                  <div className="flex items-center justify-between gap-2 mt-1 text-[10px] text-zinc-400 dark:text-zinc-400">
                    {/* TTS Speaker icon on bot responses */}
                    {!isUser ? (
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(m.id, m.content)}
                        title={
                          speakingMsgId === m.id
                            ? (isHi ? 'स्पीकर बंद करें' : 'Stop speaking')
                            : (isHi ? 'स्पीकर पर सुनें' : 'Listen with speaker')
                        }
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                          speakingMsgId === m.id ? 'text-emerald-600 dark:text-emerald-400 font-bold animate-pulse' : ''
                        }`}
                      >
                        {speakingMsgId === m.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>{isHi ? 'रोकें' : 'Stop'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isHi ? 'सुनें' : 'Listen'}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-1">
                      <span>{m.timestamp}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
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
        </div>

        {/* Recording Overlay in Input Bar */}
        {isRecording ? (
          <div className="bg-[#F0F2F5] dark:bg-[#202c33] px-4 py-3 flex flex-col gap-2 border-t border-zinc-300 dark:border-zinc-700/60 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-600 dark:text-red-400 font-mono font-bold text-sm">
                  🔴 {formatSeconds(recordingSeconds)}
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                  {isHi ? 'अपनी शिकायत बोलिए...' : 'Listening... Speak your complaint'}
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
                  className="flex items-center gap-1.5 bg-[#075E54] dark:bg-emerald-600 hover:bg-[#064E46] text-white px-4 py-2 rounded-full text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isHi ? 'भेजें' : 'Send'}</span>
                </button>
              </div>
            </div>

            {liveSpeechText && (
              <div className="text-xs text-zinc-700 dark:text-zinc-200 bg-white/90 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 italic truncate">
                "{liveSpeechText}"
              </div>
            )}
          </div>
        ) : (
          /* Normal Input Bar */
          <div className="relative bg-[#F0F2F5] dark:bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-zinc-300 dark:border-zinc-700/60 flex-shrink-0">
            {/* Attachment Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu((prev) => !prev)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  showAttachMenu
                    ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
                title={isHi ? 'फ़ाइल या स्क्रीनशॉट जोड़ें' : 'Attach screenshot or evidence'}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {showAttachMenu && (
                <div className="absolute bottom-12 left-0 w-60 bg-white dark:bg-[#202c33] rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-1.5 z-50 flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false)
                      fileInputRef.current?.click()
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#2a3942] rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="font-semibold">{isHi ? 'फ़ोटो या स्क्रीनशॉट चुनें' : 'Upload Screenshot / Photo'}</div>
                      <div className="text-[10px] text-zinc-400">{isHi ? 'डिवाइस से फ़ाइल अपलोड करें' : 'From phone or computer'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleSampleReceiptClick}
                    className="flex items-center gap-2.5 px-3 py-2 text-zinc-800 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg text-left transition-colors cursor-pointer border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {isHi ? '⚡ नमूना UPI रसीद (₹45,000)' : '⚡ Sample UPI Fraud Receipt'}
                      </div>
                      <div className="text-[10px] text-zinc-400">{isHi ? 'एक-क्लिक में रसीद ट्रायज करें' : 'Instant 1-click test receipt'}</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

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
              placeholder={isHi ? 'संदेश लिखें या माइक दबाकर बोलें...' : 'Type a message or click mic to speak...'}
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
                title={isHi ? 'बोलने के लिए माइक दबाएं' : 'Click to speak complaint (Voice / Microphone)'}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
