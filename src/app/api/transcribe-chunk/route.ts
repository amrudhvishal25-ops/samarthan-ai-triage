import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Buffer } from 'node:buffer'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Transcribes a short (~3s) audio chunk for live captioning during recording.
// This is a best-effort preview — the final, accurate transcript for triage
// still comes from transcribing the full recording in /api/triage.
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ text: '' })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const language = (formData.get('language') as string | null) || 'en'

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ text: '' })
    }

    const openai = new OpenAI({ apiKey })
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const fileObj = new File([buffer], audioFile.name || 'chunk.webm', { type: audioFile.type || 'audio/webm' })

    const VALID_WHISPER_LANGS = ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'ml', 'pa']
    const whisperLang = VALID_WHISPER_LANGS.includes(language.toLowerCase()) ? language.toLowerCase() : undefined

    const transcription = await openai.audio.transcriptions.create({
      file: fileObj,
      model: 'whisper-1',
      ...(whisperLang ? { language: whisperLang } : {}),
    })

    const text = typeof transcription === 'string' ? transcription : (transcription as any).text || ''
    return NextResponse.json({ text: text.trim() })
  } catch (err: any) {
    console.warn('[transcribe-chunk] failed:', err?.message)
    return NextResponse.json({ text: '' })
  }
}
