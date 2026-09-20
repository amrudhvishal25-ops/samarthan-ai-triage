import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateSession, processWhatsAppTurn } from '@/lib/whatsapp-agent'
import { SupportedLanguage, LANGUAGE_MAP } from '@/lib/i18n/languages'
import OpenAI, { toFile } from 'openai'
import { NEUTRAL_WHISPER_PROMPT } from '@/lib/speech-normalizer'
import { checkDailyLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_SIMULATOR_REQUEST_BYTES = 4_000_000

// Reserved for a future, signed WhatsApp provider integration. The public
// browser demo does not expose session reset, bot controls, or webhook access.
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && verifyToken && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// The only supported public caller is the in-app simulator. Reports and chat
// context are held in the browser/current function session and are not saved.
export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') || '0')
  if (contentLength > MAX_SIMULATOR_REQUEST_BYTES) {
    return NextResponse.json({ error: 'This file is too large for the demo.' }, { status: 413 })
  }

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'JSON requests only.' }, { status: 415 })
  }

  try {
    const json = await req.json()
    if (json.isSimulator !== true) {
      return NextResponse.json({ error: 'This endpoint is only for the in-app demo.' }, { status: 403 })
    }

    const { allowed } = await checkDailyLimit(req, { scope: 'simulator', limit: 25 })
    if (!allowed) {
      return NextResponse.json({
        error: 'Demo limit reached. Please try again tomorrow or use the main report form.',
      }, { status: 429 })
    }

    const from = typeof json.phoneNumber === 'string' && json.phoneNumber.length <= 100
      ? json.phoneNumber
      : 'simulated-user'
    let body = typeof json.message === 'string' ? json.message.slice(0, 12_000) : ''
    let voiceTranscript = typeof json.voiceTranscript === 'string' ? json.voiceTranscript.slice(0, 12_000) : ''
    const mediaUrl = typeof json.mediaUrl === 'string' ? json.mediaUrl : undefined
    const imageBase64 = typeof json.imageBase64 === 'string' ? json.imageBase64 : undefined
    const activeIncidentId = typeof json.activeIncidentId === 'string' ? json.activeIncidentId : undefined
    const isExplicitReset = json.activeIncidentId === null || json.resetSession === true
    const forceNew = json.forceNew === true
    const isResetPing = json.resetSession === true || forceNew || json.activeIncidentId === null

    const session = getOrCreateSession(from)
    ;(session as any).isSimulator = true
    if (typeof json.language === 'string' && json.language in LANGUAGE_MAP) {
      session.language = json.language as SupportedLanguage
      if (session.stage === 'SELECT_LANGUAGE') session.stage = 'AWAITING_INCIDENT'
    }

    if (isExplicitReset) {
      session.incidentId = undefined
      session.stage = 'AWAITING_INCIDENT'
      session.history = []
      session.accumulatedText = ''
      session.extractedData = undefined
      session.pendingUpdateText = undefined
      session.pendingMediaUrl = undefined
      session.pendingVisionEvidence = undefined
      session.missingFields = []
      session.forceNewComplaint = true
    } else if (forceNew) {
      session.forceNewComplaint = true
      session.incidentId = undefined
      if (session.stage === 'FILED' || session.stage === 'SELECT_LANGUAGE') {
        session.stage = 'AWAITING_INCIDENT'
      }
      session.pendingUpdateText = undefined
      session.pendingVisionEvidence = undefined
    } else if (activeIncidentId) {
      // This only preserves the current simulator's flow; it is never used to
      // look up a report in shared storage.
      session.incidentId = activeIncidentId
      session.stage = 'FILED'
    }

    const audioMimeType = typeof json.audioMimeType === 'string' ? json.audioMimeType : 'audio/webm'
    if (!voiceTranscript && typeof json.audioBase64 === 'string') {
      const transcribed = await transcribeAudioBase64(json.audioBase64, audioMimeType)
      if (transcribed?.text) {
        voiceTranscript = transcribed.text
        body = body ? `${body} (Voice Note: "${transcribed.text}")` : transcribed.text
      } else if (!body) {
        body = 'Voice note complaint details'
      }
    }

    if (!body && !mediaUrl && !voiceTranscript && !imageBase64) {
      if (isResetPing) return NextResponse.json({ success: true, reply: '', reset: true })
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    const result = await processWhatsAppTurn(session, body, mediaUrl, voiceTranscript, imageBase64)
    return NextResponse.json({
      success: true,
      reply: result.reply,
      filedComplaint: result.filedComplaint,
      incidentId: result.incidentId,
      session: {
        stage: session.stage,
        history: session.history,
        language: session.language,
      },
    })
  } catch (error: unknown) {
    console.error('[WhatsApp simulator] Error:', error)
    return NextResponse.json({
      success: false,
      reply: 'I could not process that. Please try again, or call 1930 if this is urgent.',
    }, { status: 200 })
  }
}

async function transcribeAudioBase64(
  base64Data: string,
  mimeType = 'audio/webm',
): Promise<{ text: string; detectedLanguage: SupportedLanguage } | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'mock-key' || !apiKey.startsWith('sk-')) {
    return { text: 'I transferred 45000 rupees to a fraudster.', detectedLanguage: 'en' }
  }

  const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm'
  const ext = cleanMime.includes('mp4') || cleanMime.includes('m4a') || cleanMime.includes('aac')
    ? 'mp4'
    : cleanMime.includes('wav')
      ? 'wav'
      : cleanMime.includes('ogg')
        ? 'ogg'
        : 'webm'
  const file = await toFile(Buffer.from(base64Data, 'base64'), `voicenote.${ext}`, { type: cleanMime })

  try {
    const translation = await new OpenAI({ apiKey }).audio.translations.create({
      file,
      model: 'whisper-1',
      prompt: NEUTRAL_WHISPER_PROMPT,
    })
    const text = translation.text.trim()
    return text ? { text, detectedLanguage: 'en' } : null
  } catch (error: unknown) {
    console.warn('[WhatsApp simulator] Audio transcription failed:', error instanceof Error ? error.message : error)
    return null
  }
}
