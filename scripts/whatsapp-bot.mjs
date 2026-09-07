import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  downloadMediaMessage,
} from '@whiskeysockets/baileys'
import pino from 'pino'
import QRCode from 'qrcode'
import fs from 'node:fs'
import path from 'node:path'
import OpenAI, { toFile } from 'openai'

// Load .env.local if not already in environment
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
      }
    }
  }
} catch {}

const AUTH_DIR = path.resolve(process.cwd(), '.whatsapp_auth')
const STATE_FILE = path.resolve(process.cwd(), '.whatsapp_live_state.json')
const PID_FILE = path.resolve(process.cwd(), '.whatsapp_bot.pid')
const SESSIONS_FILE = path.resolve(process.cwd(), '.whatsapp_sessions.json')
const NEXT_API_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp`
  : 'https://samarthan-ai-parichay-s-projects.vercel.app/api/whatsapp'

function getActiveIncident(phone) {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
      return data[phone] || null
    }
  } catch {}
  return null
}

function setActiveIncident(phone, incidentId) {
  try {
    let data = {}
    if (fs.existsSync(SESSIONS_FILE)) {
      try { data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8')) } catch {}
    }
    if (incidentId) {
      data[phone] = incidentId
    } else {
      delete data[phone]
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('[Session Save Error]:', e.message)
  }
}

const startTime = Date.now()
let currentSocket = null
let reconnectTimer = null
let isStarting = false
let reconnectAttempts = 0

// Write PID
fs.writeFileSync(PID_FILE, process.pid.toString(), 'utf-8')

function updateState(partial) {
  try {
    let current = {}
    if (fs.existsSync(STATE_FILE)) {
      try {
        current = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
      } catch {
        current = {}
      }
    }
    const merged = {
      ...current,
      ...partial,
      lastPing: Date.now(),
      pid: process.pid,
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(merged, null, 2), 'utf-8')
  } catch (err) {
    console.error('[State Write Error]:', err.message)
  }
}

// Initial state
updateState({
  status: 'INITIALIZING',
  startedAt: startTime,
  userPhone: null,
  qrDataUrl: null,
})

// Keep alive heart-beat
const pingInterval = setInterval(() => {
  updateState({})
}, 4000)

function cleanupAndExit() {
  clearInterval(pingInterval)
  if (reconnectTimer) clearTimeout(reconnectTimer)
  if (currentSocket) {
    try { currentSocket.end(undefined) } catch {}
  }
  updateState({ status: 'DISCONNECTED', qrDataUrl: null })
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE)
  } catch {}
  process.exit(0)
}

process.on('SIGINT', cleanupAndExit)
process.on('SIGTERM', cleanupAndExit)

async function startWhatsAppBot() {
  if (isStarting) return
  isStarting = true

  // Safely close existing socket before starting a new one
  if (currentSocket) {
    try {
      currentSocket.ev.removeAllListeners('connection.update')
      currentSocket.ev.removeAllListeners('creds.update')
      currentSocket.ev.removeAllListeners('messages.upsert')
      currentSocket.end(undefined)
    } catch {}
    currentSocket = null
  }

  console.log('\n======================================================')
  console.log('🤖 Samarthan Cybercrime AI - WhatsApp Live Companion')
  console.log('======================================================\n')
  console.log(`[Init] Using auth directory: ${AUTH_DIR}`)
  console.log(`[Init] Forwarding triage calls to: ${NEXT_API_URL}`)

  // Auto-unpack session bundle if running in a fresh cloud container (e.g. Railway/Render)
  if (process.env.WHATSAPP_SESSION_BUNDLE_BASE64) {
    const credsFile = path.join(AUTH_DIR, 'creds.json')
    if (!fs.existsSync(credsFile)) {
      try {
        console.log('[Init] Restoring WhatsApp session from WHATSAPP_SESSION_BUNDLE_BASE64...')
        const buf = Buffer.from(process.env.WHATSAPP_SESSION_BUNDLE_BASE64.trim(), 'base64')
        const tmpTar = path.resolve(process.cwd(), '.whatsapp_auth_bundle.tar.gz')
        fs.writeFileSync(tmpTar, buf)
        const { execSync } = await import('node:child_process')
        execSync(`tar -xzf "${tmpTar}" -C "${process.cwd()}"`)
        try { fs.unlinkSync(tmpTar) } catch {}
        console.log('[Init] ✅ Successfully restored authenticated WhatsApp session from environment!')
      } catch (unpackErr) {
        console.error('[Init] Error unpacking WHATSAPP_SESSION_BUNDLE_BASE64:', unpackErr.message)
      }
    }
  }

  let state, saveCreds
  try {
    const auth = await useMultiFileAuthState(AUTH_DIR)
    state = auth.state
    saveCreds = auth.saveCreds
  } catch (e) {
    console.error('[Auth Load Error]:', e.message)
    isStarting = false
    return
  }

  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`[Init] Using WA version v${version.join('.')}, isLatest: ${isLatest}`)

  const logger = pino({ level: 'silent' })

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: true,
    browser: ['Samarthan Cyber Triage', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
    keepAliveIntervalMs: 25000,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
  })

  currentSocket = sock
  isStarting = false

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n[QR Code Received] Generating live QR for web scan & terminal...\n')
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, {
          width: 340,
          margin: 2,
          color: {
            dark: '#1A3A6B',
            light: '#FFFFFF',
          },
        })

        updateState({
          status: 'SCAN_QR',
          qr,
          qrDataUrl,
          userPhone: null,
        })
      } catch (e) {
        console.error('[QR Gen Error]:', e)
      }
    }

    if (connection === 'open') {
      reconnectAttempts = 0
      const rawUser = sock.user?.id || ''
      const cleanPhone = rawUser.split(':')[0].replace(/[^0-9]/g, '')
      const formattedPhone = cleanPhone ? `+${cleanPhone}` : 'Unknown'

      console.log('\n======================================================')
      console.log(`✅ CONNECTED SUCCESSFULLY TO WHATSAPP!`)
      console.log(`📱 Linked Account: ${formattedPhone}`)
      console.log(`🛡️  Samarthan 24x7 Cybercrime AI Triage Bot is now active`)
      console.log('======================================================\n')

      updateState({
        status: 'CONNECTED',
        qr: null,
        qrDataUrl: null,
        userPhone: formattedPhone,
        rawJid: sock.user?.id,
      })
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      console.log(`\n[Connection Closed] Reason code: ${statusCode}`)

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('[Logged Out] Clear auth cache to link a new WhatsApp account.')
        updateState({ status: 'DISCONNECTED', userPhone: null, qrDataUrl: null })
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true })
        } catch {}
        return
      }

      if (statusCode === DisconnectReason.connectionReplaced) {
        console.log('[Connection Replaced] Another session opened or conflict detected. Backing off 10s...')
        updateState({ status: 'INITIALIZING' })
        if (reconnectTimer) clearTimeout(reconnectTimer)
        reconnectTimer = setTimeout(() => {
          startWhatsAppBot().catch(console.error)
        }, 10000)
        return
      }

      // Standard reconnect with progressive backoff to prevent fast retry loops
      reconnectAttempts++
      const delayMs = Math.min(3000 * Math.pow(1.3, reconnectAttempts - 1), 20000)
      console.log(`[Reconnecting] Attempt ${reconnectAttempts} in ${Math.round(delayMs / 1000)}s...`)
      updateState({ status: 'INITIALIZING' })
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => {
        startWhatsAppBot().catch(console.error)
      }, delayMs)
    }
  })

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue
      const remoteJid = msg.key.remoteJid
      if (!remoteJid || remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') continue

      const senderPhone = remoteJid.replace('@s.whatsapp.net', '')

      const messageContent =
        msg.message.ephemeralMessage?.message ||
        msg.message.viewOnceMessage?.message ||
        msg.message.viewOnceMessageV2?.message ||
        msg.message

      // Extract text content
      let text =
        messageContent.conversation ||
        messageContent.extendedTextMessage?.text ||
        messageContent.imageMessage?.caption ||
        messageContent.videoMessage?.caption ||
        ''

      let audioBase64 = undefined
      let voiceTranscript = undefined

      // Voice note / audio message handling (PTT or standard audio)
      const isAudio = Boolean(
        messageContent.audioMessage ||
        (messageContent.documentMessage?.mimetype && messageContent.documentMessage.mimetype.startsWith('audio/'))
      )

      if (isAudio) {
        try {
          console.log(`[Audio Message] Received voice note from +${senderPhone}, downloading...`)
          const buffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            { logger, reuploadRequest: sock.updateMediaMessage }
          )
          if (buffer) {
            audioBase64 = buffer.toString('base64')
            console.log(`[Audio Message] Successfully extracted audio (${buffer.length} bytes)`)

            // Try Whisper transcription locally using OPENAI_API_KEY
            if (process.env.OPENAI_API_KEY) {
              try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
                const file = await toFile(buffer, 'audio.ogg', { type: 'audio/ogg' })
                const transcription = await openai.audio.transcriptions.create({
                  file,
                  model: 'whisper-1',
                })
                if (transcription?.text) {
                  voiceTranscript = transcription.text.trim()
                  console.log(`[Audio Message] Transcribed locally: "${voiceTranscript}"`)
                }
              } catch (whisperErr) {
                console.warn('[Local Whisper Warning]:', whisperErr.message)
              }
            }
          }
        } catch (e) {
          console.error('[Audio Download Error]:', e.message)
        }
      }

      // Image / screenshot / receipt handling
      let imageBase64 = undefined
      const isImage = Boolean(
        messageContent.imageMessage ||
        (messageContent.documentMessage?.mimetype && messageContent.documentMessage.mimetype.startsWith('image/'))
      )

      if (isImage) {
        try {
          console.log(`[Image Message] Received screenshot/receipt from +${senderPhone}, downloading...`)
          const buffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            { logger, reuploadRequest: sock.updateMediaMessage }
          )
          if (buffer) {
            imageBase64 = buffer.toString('base64')
            console.log(`[Image Message] Successfully extracted image (${buffer.length} bytes)`)
          }
        } catch (e) {
          console.error('[Image Download Error]:', e.message)
        }
      }

      if (!text.trim() && !audioBase64 && !voiceTranscript && !imageBase64) continue

      console.log(`\n[📩 Inbound WhatsApp] From: +${senderPhone} | Text: "${text || (voiceTranscript ? `[Voice: ${voiceTranscript}]` : (imageBase64 ? '[Screenshot / Receipt Image]' : '(Empty)'))}"`)

      // Indicate typing status in WhatsApp
      try {
        await sock.sendPresenceUpdate('composing', remoteJid)
      } catch {}

      try {
        const isExplicitNew = /^(new|start new|file new|new complaint|fresh|naya|nai|नई|नया|नई शिकायत)$/i.test((text || '').trim())
        if (isExplicitNew) {
          setActiveIncident(senderPhone, null)
        }

        const activeIncidentId = getActiveIncident(senderPhone)

        const res = await fetch(NEXT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: senderPhone,
            activeIncidentId,
            message: text,
            audioBase64,
            voiceTranscript,
            imageBase64,
          }),
        })

        if (!res.ok) {
          throw new Error(`Next.js API returned HTTP ${res.status}`)
        }

        const data = await res.json()
        const replyText = data.reply || 'Your report was received. Our team is processing.'

        if (data.incidentId) {
          setActiveIncident(senderPhone, data.incidentId)
        }

        await sock.sendMessage(remoteJid, { text: replyText })
        console.log(`[📤 Outbound Reply] To: +${senderPhone} | Sent ${replyText.length} chars`)

        if (data.filedComplaint) {
          console.log(`[🎯 COMPLAINT FILED] Incident ID: ${data.incidentId || data.filedComplaint.id}`)
        }
      } catch (err) {
        console.error(`[Processing Error for +${senderPhone}]:`, err.message)
        await sock.sendMessage(remoteJid, {
          text: '⚠️ Samarthan AI Assistant: Your message was received. Our triage engine is briefly syncing with the portal. If this is an emergency, please call 1930 immediately.',
        })
      } finally {
        try {
          await sock.sendPresenceUpdate('paused', remoteJid)
        } catch {}
      }
    }
  })
}

startWhatsAppBot().catch((err) => {
  console.error('[Fatal Bot Startup Error]:', err)
  updateState({ status: 'ERROR', error: err.message })
})
