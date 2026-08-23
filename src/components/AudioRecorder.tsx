'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Upload, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface AudioRecorderProps {
  language: 'en' | 'hi'
  onAudioReady: (blob: Blob) => void
}

const MAX_SECONDS = 60

export default function AudioRecorder({ language, onAudioReady }: AudioRecorderProps) {
  const hi = language === 'hi'
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
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
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
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
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
            'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200',
            'focus:outline-none focus:ring-4 focus:ring-offset-2',
            recording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse'
              : 'bg-civic-blue hover:bg-civic-blueMid focus:ring-blue-300'
          )}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
        >
          {recording
            ? <Square className="w-8 h-8 text-white fill-white" />
            : <Mic className="w-8 h-8 text-white" />
          }
        </button>

        {recording && (
          <div className="flex items-center gap-2 text-red-600 font-mono font-bold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
          </div>
        )}

        <p className="text-sm text-gray-500 text-center">
          {recording
            ? (hi ? 'रिकॉर्ड हो रहा है… रोकने के लिए दबाएं' : 'Recording… tap to stop')
            : (hi ? 'माइक आइकन दबाकर बोलना शुरू करें' : 'Tap the mic to start speaking')}
        </p>
      </div>

      {/* Playback */}
      {blobUrl && !recording && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-xs font-semibold text-green-700 mb-2">
            {hi ? 'रिकॉर्डिंग तैयार है' : 'Recording ready'}
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={blobUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}
