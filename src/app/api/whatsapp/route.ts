import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateSession, processWhatsAppTurn } from '@/lib/whatsapp-agent'
import OpenAI, { toFile } from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET /api/whatsapp -> Meta Cloud API Webhook verification
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'samarthan_token_2026'

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ status: 'active', service: 'Samarthan WhatsApp Cybercrime Bot' })
}

// POST /api/whatsapp -> Inbound message handler
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let from = 'anonymous-citizen'
    let body = ''
    let mediaUrl: string | undefined
    let isTwilio = false
    let voiceTranscript = ''

    let imageBase64: string | undefined = undefined

    if (contentType.includes('application/x-www-form-urlencoded')) {
      isTwilio = true
      const formData = await req.formData()
      from = (formData.get('From') as string) || 'whatsapp:+919876543210'
      body = (formData.get('Body') as string) || ''
      const numMedia = parseInt((formData.get('NumMedia') as string) || '0', 10)

      if (numMedia > 0) {
        mediaUrl = (formData.get('MediaUrl0') as string) || undefined
        const mediaType = (formData.get('MediaContentType0') as string) || ''

        // If it's a voice note, transcribe using Whisper
        if (mediaType.includes('audio') && mediaUrl) {
          try {
            const transcribed = await transcribeAudioUrl(mediaUrl)
            if (transcribed) {
              voiceTranscript = transcribed
              body = body ? `${body} (Voice note: "${transcribed}")` : transcribed
            }
          } catch (e) {
            console.error('[WhatsApp Webhook] Audio transcription error:', e)
          }
        }
      }
    } else {
      const json = await req.json()
      from = json.phoneNumber || json.From || 'simulated-user'
      body = json.message || json.Body || ''
      mediaUrl = json.mediaUrl
      voiceTranscript = json.voiceTranscript || ''
      imageBase64 = json.imageBase64
      const activeIncidentId = json.activeIncidentId || undefined
      const isExplicitReset = json.activeIncidentId === null
      // Sticky signal from the bot: user is in "NEW complaint" mode and stays there
      // (across every follow-up message) until a fresh complaint is actually filed.
      const forceNew = json.forceNew === true

      const session = getOrCreateSession(from)
      if (forceNew) {
        // Do NOT clear an in-progress force-new session's accumulated narrative here —
        // only (re)assert the sticky flag and make sure no stale incident is attached.
        session.forceNewComplaint = true
        session.incidentId = undefined
        if (session.stage === 'FILED' || session.stage === 'SELECT_LANGUAGE') {
          session.stage = 'AWAITING_INCIDENT'
        }
        session.pendingUpdateText = undefined
        session.pendingVisionEvidence = undefined
        ;(session as any)._skipDbRestore = true
      } else if (activeIncidentId) {
        session.incidentId = activeIncidentId
        session.stage = 'FILED'
      } else if (isExplicitReset) {
        // Bot explicitly cleared the incident (user said NEW) — reset the server session
        session.incidentId = undefined
        session.stage = 'AWAITING_INCIDENT'
        session.accumulatedText = ''
        session.extractedData = undefined
        session.pendingUpdateText = undefined
        session.pendingMediaUrl = undefined
        session.pendingVisionEvidence = undefined
        session.missingFields = []
        session.forceNewComplaint = true
        // Mark session so auto-restore from DB is skipped for this turn
        ;(session as any)._skipDbRestore = true
      }

      if (!voiceTranscript && json.audioBase64) {
        try {
          const transcribed = await transcribeAudioBase64(json.audioBase64, session.language)
          if (transcribed) {
            voiceTranscript = transcribed
            body = body ? `${body} (Voice Note: "${transcribed}")` : transcribed
          }
        } catch (e) {
          console.error('[WhatsApp Webhook] Audio base64 transcription error:', e)
        }
      }
    }

    if (!body && !mediaUrl && !voiceTranscript && !imageBase64) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    const session = getOrCreateSession(from)
    const result = await processWhatsAppTurn(session, body, mediaUrl, voiceTranscript, imageBase64)

    if (isTwilio) {
      // Return TwiML XML response for Twilio WhatsApp
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(result.reply)}</Message>
</Response>`
      return new Response(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    return NextResponse.json({
      success: true,
      reply: result.reply,
      filedComplaint: result.filedComplaint,
      incidentId: result.incidentId,
      session: {
        stage: session.stage,
        history: session.history,
      },
    })
  } catch (error: unknown) {
    console.error('[WhatsApp Webhook] Error:', error)
    // Never dead-end a WhatsApp user. Return HTTP 200 with a helpful reply so
    // the bot relays something actionable instead of a vague sync message.
    const friendly =
      '⚠️ I could not fully process that just now. Please re-send your message, ' +
      'or if this is urgent, call the 1930 cybercrime helpline immediately and ' +
      'file at cybercrime.gov.in.'
    return NextResponse.json({ success: false, reply: friendly }, { status: 200 })
  }
}

async function transcribeAudioUrl(audioUrl: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'mock-key' || !apiKey.startsWith('sk-')) {
    return 'Maine 45000 rupaye transfer kiye the ek fraudster ko.'
  }

  const res = await fetch(audioUrl)
  if (!res.ok) return null

  const blob = await res.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())
  const file = await toFile(buffer, 'audio.ogg', { type: 'audio/ogg' })

  const openai = new OpenAI({ apiKey })
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  })

  return transcription.text
}

async function transcribeAudioBase64(base64Data: string, language?: 'en' | 'hi'): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'mock-key' || !apiKey.startsWith('sk-')) {
    return 'Maine 45000 rupaye transfer kiye the ek fraudster ko.'
  }

  const buffer = Buffer.from(base64Data, 'base64')
  const file = await toFile(buffer, 'audio.ogg', { type: 'audio/ogg' })

  const openai = new OpenAI({ apiKey })
  try {
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: language === 'hi' ? 'hi' : undefined,
    })
    return transcription.text
  } catch (err: any) {
    console.warn('[transcribeAudioBase64] Attempting without language constraint:', err?.message)
    try {
      const fileRetry = await toFile(buffer, 'audio.ogg', { type: 'audio/ogg' })
      const transcription = await openai.audio.transcriptions.create({
        file: fileRetry,
        model: 'whisper-1',
      })
      return transcription.text
    } catch {
      return null
    }
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}
