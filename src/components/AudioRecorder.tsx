'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import clsx from 'clsx'

import { SupportedLanguage } from '@/lib/i18n/languages'
import { getTranslation } from '@/lib/i18n/translations'

interface AudioRecorderProps {
  language: SupportedLanguage
  onAudioReady: (blob: Blob) => void
  onLiveTranscript?: (text: string) => void
  theme?: 'light' | 'dark'
}

const MAX_SECONDS = 60
const BAR_COUNT = 28
const CHUNK_MS = 4000

export default function AudioRecorder({ language, onAudioReady, onLiveTranscript, theme = 'light' }: AudioRecorderProps) {
  const t = getTranslation(language)
  const isDark = theme === 'dark'
  const hi = language === 'hi'

  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0.08))
  const [liveText, setLiveText] = useState('')
  const [captionError, setCaptionError] = useState('')

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Rolling ~4s chunk recorder for live captions — separate from the main
  // MediaRecorder so the final audio blob sent to Whisper stays one clean
  // continuous file, while captions are a best-effort streaming preview.
  const chunkRecorderRef = useRef<MediaRecorder | null>(null)
  const finalTranscriptRef = useRef('')
  const captionSeqRef = useRef(0)
  const lastAppliedSeqRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      try { chunkRecorderRef.current?.stop() } catch { /* already stopped */ }
      audioCtxRef.current?.close?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobUrl])

  const runLevelLoop = () => {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteTimeDomainData(data)
      // RMS amplitude of the waveform, mapped into a handful of bars with
      // slight per-bar variance so it reads as a live waveform, not one blob.
      let sumSq = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sumSq += v * v
      }
      const rms = Math.sqrt(sumSq / data.length)
      const amplitude = Math.min(1, rms * 4)

      setLevels((prev) =>
        prev.map((_, i) => {
          const wobble = 0.6 + 0.4 * Math.sin(Date.now() / 120 + i)
          return Math.max(0.08, Math.min(1, amplitude * wobble))
        })
      )

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const uploadChunkForCaption = async (blob: Blob, seq: number) => {
    if (blob.size < 1000) return // too short to contain speech
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'chunk.webm')
      formData.append('language', language)
      const resp = await fetch('/api/transcribe-chunk', { method: 'POST', body: formData })
      if (!resp.ok) return
      const { text } = await resp.json()
      // Chunks resolve out of order if one Whisper call is slow — only apply
      // a response if it's not older than the last one we already applied.
      // (Every chunk WILL be "behind" the currently-recording chunk by the
      // time its request completes, since Whisper latency > the chunk
      // interval — that's expected, not staleness.)
      if (seq <= lastAppliedSeqRef.current) return
      lastAppliedSeqRef.current = seq
      if (text && text.trim()) {
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + text.trim()).trim()
        setLiveText(finalTranscriptRef.current)
        onLiveTranscript?.(finalTranscriptRef.current)
        setCaptionError('')
      }
    } catch {
      // Best-effort — the final Whisper pass on the full recording (in
      // /api/triage) is what actually matters. Only surface an error if we
      // haven't managed a single successful caption yet, so one dropped
      // chunk mid-stream doesn't overwrite text that's already showing.
      if (!finalTranscriptRef.current) {
        setCaptionError(language === 'en' ? 'Live captions unavailable right now' : `${t.intake.listening}`)
      }
    }
  }

  const startChunkCaptioning = (stream: MediaStream) => {
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm']
      .find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || ''

    const launchChunk = () => {
      if (!(mediaRef.current && mediaRef.current.state === 'recording')) return

      const seq = ++captionSeqRef.current
      const chunkChunks: Blob[] = []
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunkChunks.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunkChunks, { type: recorder.mimeType || 'audio/webm' })
        uploadChunkForCaption(blob, seq)
        if (mediaRef.current && mediaRef.current.state === 'recording') {
          launchChunk()
        }
      }

      chunkRecorderRef.current = recorder
      recorder.start()
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop()
      }, CHUNK_MS)
    }

    launchChunk()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

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
      setLiveText('')
      setCaptionError('')
      finalTranscriptRef.current = ''
      captionSeqRef.current = 0
      lastAppliedSeqRef.current = 0

      // Waveform visualizer, driven by the mic's actual amplitude.
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioCtx = new AudioCtx()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser
      runLevelLoop()

      startChunkCaptioning(stream)

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
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    audioCtxRef.current?.close?.()
    audioCtxRef.current = null
    analyserRef.current = null
    try { chunkRecorderRef.current?.stop() } catch { /* already stopped */ }
    chunkRecorderRef.current = null
    setLevels(Array(BAR_COUNT).fill(0.08))
    setRecording(false)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (permissionDenied) {
    return (
      <div className={clsx("rounded-lg p-4 text-sm border", isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700")}>
        {hi
          ? 'माइक्रोफोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग में माइक की अनुमति दें।'
          : 'Microphone permission denied. Please allow mic access in browser settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Record button + live waveform */}
      <div className="flex flex-col items-center gap-3 flex-1 justify-center">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={clsx(
            'relative w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-150 shadow-sm border',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            isDark ? 'focus:ring-offset-zinc-950 border-primary/50' : 'focus:ring-offset-white border-primary-active',
            recording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50 scale-105 border-red-600'
              : 'bg-primary hover:bg-primary-hover focus:ring-primary/40 text-white'
          )}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
        >
          {recording && (
            <span
              className="absolute inset-0 rounded-full bg-red-500/40"
              style={{ transform: `scale(${1 + levels[0] * 0.5})`, transition: 'transform 80ms linear' }}
            />
          )}
          {recording
            ? <Square className="w-6 h-6 text-white fill-white relative" />
            : <Mic className="w-6 h-6 relative text-white" />
          }
        </button>

        {/* Live waveform bars, height driven by mic amplitude */}
        <div className="flex items-end justify-center gap-[3px] h-10 w-full max-w-[220px]">
          {levels.map((lvl, i) => (
            <div
              key={i}
              className={clsx(
                'w-[3px] rounded-full',
                recording ? 'bg-primary' : (isDark ? 'bg-zinc-700' : 'bg-zinc-200')
              )}
              style={{
                height: `${Math.max(3, lvl * 40)}px`,
                transition: recording ? 'height 60ms linear' : 'height 200ms ease-out',
              }}
            />
          ))}
        </div>

        {recording && (
          <div className={clsx("flex items-center gap-2 font-mono text-xs font-bold", isDark ? "text-red-400" : "text-red-600")}>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
          </div>
        )}

        <p className={clsx("text-xs text-center", isDark ? "text-white/60" : "text-gray-500")}>
          {recording
            ? t.intake.stopRecording
            : t.intake.startRecording}
        </p>
      </div>

      {/* Live caption */}
      {recording && (
        <div className={clsx("rounded-md p-2.5 text-xs min-h-[2.5rem] max-h-24 overflow-y-auto", isDark ? "bg-white/5 text-white/80" : "bg-white text-zinc-600 border border-zinc-200")}>
          {liveText || (captionError
            ? <span className="text-amber-600">{captionError}</span>
            : <span className="opacity-50 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />{t.intake.listening}</span>
          )}
        </div>
      )}

      {/* Playback */}
      {blobUrl && !recording && (
        <div className={clsx("rounded-lg p-2.5 border", isDark ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200")}>
          <p className={clsx("text-[10px] font-semibold mb-1.5 uppercase tracking-wide", isDark ? "text-green-400" : "text-green-700")}>
            {language === 'en' ? 'Recording ready' : '✓ Audio Ready'}
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={blobUrl} className={clsx("w-full h-8", isDark ? "opacity-90 grayscale-[0.2]" : "")} />
        </div>
      )}
    </div>
  )
}
