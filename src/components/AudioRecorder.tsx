'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Upload, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface AudioRecorderProps {
  language: 'en' | 'hi'
  onAudioReady: (blob: Blob) => void
  theme?: 'light' | 'dark'
}

const MAX_SECONDS = 60

export default function AudioRecorder({ language, onAudioReady, theme = 'light' }: AudioRecorderProps) {
  const hi = language === 'hi'
  const isDark = theme === 'dark'
  
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg'
      ].find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || ''

      const recorder = mimeType 
        ? new MediaRecorder(stream, { mimeType }) 
        : new MediaRecorder(stream)

      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
        onAudioReady(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRef.current = recorder
      recorder.start(250)
      setRecording(true)
      setSeconds(0)

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording()
            return MAX_SECONDS
          }
          return s + 1
        })
      }, 1000)
    } catch {
      setPermissionDenied(true)
    }
  }

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (permissionDenied) {
    return (
      <div className={clsx("rounded-xl p-4 text-sm border", isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700")}>
        {hi
          ? 'माइक्रोफोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग में माइक की अनुमति दें।'
          : 'Microphone permission denied. Please allow mic access in browser settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Record button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={clsx(
            'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg',
            'focus:outline-none focus:ring-4 focus:ring-offset-2',
            isDark ? 'focus:ring-offset-black' : 'focus:ring-offset-white',
            recording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50 animate-pulse'
              : (isDark ? 'bg-white hover:bg-gray-200 focus:ring-white/50 text-gray-900' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 text-white')
          )}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
        >
          {recording
            ? <Square className="w-8 h-8 text-white fill-white" />
            : <Mic className={clsx("w-8 h-8", recording ? "text-white" : (isDark ? "text-gray-900" : "text-white"))} />
          }
        </button>

        {recording && (
          <div className={clsx("flex items-center gap-2 font-mono font-bold", isDark ? "text-red-400" : "text-red-600")}>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
          </div>
        )}

        <p className={clsx("text-sm text-center", isDark ? "text-white/60" : "text-gray-500")}>
          {recording
            ? (hi ? 'रिकॉर्ड हो रहा है… रोकने के लिए दबाएं' : 'Recording… tap to stop')
            : (hi ? 'माइक आइकन दबाकर बोलना शुरू करें' : 'Tap the mic to start speaking')}
        </p>
      </div>

      {/* Playback */}
      {blobUrl && !recording && (
        <div className={clsx("rounded-xl p-4 border", isDark ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200")}>
          <p className={clsx("text-xs font-semibold mb-2", isDark ? "text-green-400" : "text-green-700")}>
            {hi ? 'रिकॉर्डिंग तैयार है' : 'Recording ready'}
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={blobUrl} className={clsx("w-full", isDark ? "opacity-90 grayscale-[0.2]" : "")} />
        </div>
      )}
    </div>
  )
}
