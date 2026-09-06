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

const AUTH_DIR = path.resolve(process.cwd(), '.whatsapp_auth')
const STATE_FILE = path.resolve(process.cwd(), '.whatsapp_live_state.json')
const PID_FILE = path.resolve(process.cwd(), '.whatsapp_bot.pid')
const NEXT_API_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp`
  : 'http://localhost:3000/api/whatsapp'

const startTime = Date.now()

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
  updateState({ status: 'DISCONNECTED', qrDataUrl: null })
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE)
  } catch {}
  process.exit(0)
}

process.on('SIGINT', cleanupAndExit)
process.on('SIGTERM', cleanupAndExit)

async function startWhatsAppBot() {
  console.log('\n======================================================')
  console.log('🤖 Samarthan Cybercrime AI - WhatsApp Live Companion')
  console.log('======================================================\n')
  console.log(`[Init] Using auth directory: ${AUTH_DIR}`)
  console.log(`[Init] Forwarding triage calls to: ${NEXT_API_URL}`)

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
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
  })

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
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      console.log(`\n[Connection Closed] Reason code: ${statusCode}. Reconnecting: ${shouldReconnect}`)

      if (shouldReconnect) {
        updateState({ status: 'INITIALIZING' })
        setTimeout(() => startWhatsAppBot(), 3000)
      } else {
        console.log('[Logged Out] Clear auth cache to link a new WhatsApp account.')
        updateState({ status: 'DISCONNECTED', userPhone: null, qrDataUrl: null })
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true })
        } catch {}
      }
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

      // Extract text content
      let text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        ''

      let audioBase64 = undefined

      // Voice note / audio message handling
      if (msg.message.audioMessage) {
        try {
          console.log(`[Audio Message] Received voice note from +${senderPhone}, downloading...`)
          const buffer = await downloadMediaMessage(msg, 'buffer', {})
          if (buffer) {
            audioBase64 = buffer.toString('base64')
          }
        } catch (e) {
          console.error('[Audio Download Error]:', e.message)
        }
      }

      if (!text.trim() && !audioBase64) continue

      console.log(`\n[📩 Inbound WhatsApp] From: +${senderPhone} | Text: "${text || '(Voice Note)'}"`)

      // Indicate typing status in WhatsApp
      try {
        await sock.sendPresenceUpdate('composing', remoteJid)
      } catch {}

      try {
        const res = await fetch(NEXT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: senderPhone,
            message: text,
            audioBase64,
          }),
        })

        if (!res.ok) {
          throw new Error(`Next.js API returned HTTP ${res.status}`)
        }

        const data = await res.json()
        const replyText = data.reply || 'Your report was received. Our team is processing.'

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
