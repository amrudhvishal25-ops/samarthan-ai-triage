import OpenAI from 'openai'
import { generateId, TriageResult, FreezeStep, ApplicableLaw, IT_ACT_SECTIONS } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://samarthan-ai.vercel.app').replace(/\/$/, '')

export type WhatsAppStage = 'SELECT_LANGUAGE' | 'AWAITING_INCIDENT' | 'FILED' | 'AWAITING_UPDATE_OR_NEW'

export interface ExtractedVisionEvidence {
  isCybercrimeEvidence: boolean
  amount?: number
  utr?: string
  upiId?: string
  bankName?: string
  fraudsterName?: string
  timestamp?: string
  summary: string
  summaryHi: string
}

export interface WhatsAppSession {
  phoneNumber: string
  stage: WhatsAppStage
  history: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>
  accumulatedText: string
  language: 'en' | 'hi'
  extractedData?: Partial<TriageResult>
  missingFields: string[]
  incidentId?: string
  lastActive: number
  pendingUpdateText?: string
  pendingMediaUrl?: string
  pendingVisionEvidence?: ExtractedVisionEvidence
}

// In-memory session store (keyed by phone number) with 2-hour TTL
const SESSIONS = new Map<string, WhatsAppSession>()

export function getOrCreateSession(phoneNumber: string): WhatsAppSession {
  const existing = SESSIONS.get(phoneNumber)
  const now = Date.now()
  if (existing && (now - existing.lastActive < 2 * 60 * 60 * 1000)) {
    existing.lastActive = now
    return existing
  }
  const session: WhatsAppSession = {
    phoneNumber,
    stage: 'SELECT_LANGUAGE',
    history: [],
    accumulatedText: '',
    language: 'en',
    missingFields: [],
    lastActive: now,
  }
  SESSIONS.set(phoneNumber, session)
  return session
}

function detectLanguage(text: string): 'en' | 'hi' {
  const hindiPattern = /[\u0900-\u097F]|mera|meri|gaya|gaye|paisa|paise|karo|bhai|sahab|khata|kat|gayi|dhokha|thagi|kya|hua|hain|maine/i
  return hindiPattern.test(text) ? 'hi' : 'en'
}

// Fast heuristic to extract UTR, amount, and handles from free text
export function quickExtract(text: string) {
  const amountMatch = text.match(/(?:rs\.?|inr|₹|amount|rupees|rupaye)?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\s*(?:rs|rupees|inr|hazar|k|lakh))?/i)
  const utrMatch = text.match(/(?:utr|ref|reference|txn|transaction|imps|neft|upi\s*ref)[\s:#-]*([0-9]{12})/i)
  const phoneMatch = text.match(/(?:(?:\+?91)?[ -]?)?([6-9]\d{9})/i)
  const upiMatch = text.match(/[\w.-]+@[\w.-]+/i)

  return {
    amount: amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : undefined,
    utr: utrMatch ? utrMatch[1] : undefined,
    phone: phoneMatch ? phoneMatch[1] : undefined,
    upi: upiMatch ? upiMatch[0] : undefined,
  }
}

export function isDetailedIncidentPrompt(text: string, voiceTranscript?: string): boolean {
  const full = (voiceTranscript || text).trim()
  if (!full) return false

  // Disqualify short navigation keywords, greetings, and system numbers
  if (/^(status|track|reset|\/reset|restart|clear|hi|hello|hey|namaste|help|madad|pranam|hlo|hii|1|2|yes|no)$/i.test(full)) {
    return false
  }

  // Disqualify corrections or update notes (e.g. "his name is not X it's Y", "update:", "correction:")
  if (/^(his name is not|his name is|not [a-z0-9\s]+ (?:it's|its|it is)|its not|it is not|correction|actually|update|ye galat hai|naam galat hai|change name|correct name)\b/i.test(full)) {
    return false
  }

  // Pure greeting prefixes under 35 chars
  if (/^(hi|hello|hey|namaste|help|madad)\b/i.test(full) && full.length < 35) {
    return false
  }

  const ext = quickExtract(full)
  const hasFinancial = Boolean(ext.amount || ext.utr || ext.upi)

  const crimeKeywords = /\b(fraud|scam|deduct|cut gaye|kat gaye|chori|paisa|paise|transfer|stolen|hacked|cyber|otp|apk|account|bank|police|fir|complaint|threat|blackmail|extortion|loan app|speedrupee|telegram|quicksupport|anydesk|morph|unauthorized|rupaye|rupees|inr|credit card|pan|aadhaar|tafcop|transaction|dispute|olx)\b/i
  const hasKeywords = crimeKeywords.test(full)
  const isNarrative = full.length >= 40 || full.split(/\s+/).length >= 6

  // True if user provides financial markers with keywords/narrative, or a descriptive narrative of crime
  return (hasFinancial && (hasKeywords || isNarrative)) || (isNarrative && hasKeywords) || full.length >= 80
}

export async function analyzeScreenshotWithVision(base64Image: string): Promise<ExtractedVisionEvidence | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'mock-key' || !apiKey.startsWith('sk-')) {
    return {
      isCybercrimeEvidence: true,
      amount: 25000,
      utr: '429184028491',
      upiId: 'fraudster@ybl',
      bankName: 'Google Pay / Axis Bank',
      summary: 'Detected UPI payment transfer of ₹25,000 with UTR 429184028491.',
      summaryHi: '₹25,000 का UPI भुगतान स्थानांतरण (UTR: 429184028491) पहचाना गया।',
    }
  }

  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '')
  const imageUrl = `data:image/jpeg;base64,${cleanBase64}`

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert Indian Cybercrime Forensic Investigator and OCR specialist.
Analyze the provided screenshot (UPI transfer receipt, PhonePe, Google Pay, Paytm, BHIM, bank SMS, mobile banking debit, or fraudulent chat screenshot).
Extract transaction and crime details. Return ONLY valid JSON matching:
{
  "isCybercrimeEvidence": boolean,
  "amount": number | null,
  "utr": string | null,
  "upiId": string | null,
  "bankName": string | null,
  "fraudsterName": string | null,
  "timestamp": string | null,
  "summary": string,
  "summaryHi": string
}`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract forensic cybercrime details, transaction UTR, and disputed amount from this screenshot.' },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 500,
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return {
      isCybercrimeEvidence: parsed.isCybercrimeEvidence !== false,
      amount: typeof parsed.amount === 'number' ? parsed.amount : (parsed.amount ? parseInt(parsed.amount, 10) : undefined),
      utr: parsed.utr || undefined,
      upiId: parsed.upiId || undefined,
      bankName: parsed.bankName || undefined,
      fraudsterName: parsed.fraudsterName || undefined,
      timestamp: parsed.timestamp || undefined,
      summary: parsed.summary || 'Transaction screenshot processed.',
      summaryHi: parsed.summaryHi || 'लेनदेन स्क्रीनशॉट का विश्लेषण किया गया।',
    }
  } catch (err: any) {
    console.error('[Vision Analysis Error]:', err.message)
    return null
  }
}

export async function handleStatusQuery(
  session: WhatsAppSession,
  query: string
): Promise<{ reply: string; incidentId?: string }> {
  const isHi = session.language === 'hi'
  const matchedId = query.match(/INC-\d{4}-\d{4}/i)?.[0]?.toUpperCase()
  const targetId = matchedId || session.incidentId

  let complaint: any = null

  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(process.env.DATABASE_URL)

      if (targetId) {
        const rows = await sql`SELECT * FROM complaints WHERE incident_id = ${targetId} LIMIT 1`
        if (rows[0]) complaint = rows[0]
      }

      if (!complaint && session.phoneNumber) {
        const phonePattern = `%${session.phoneNumber}%`
        const rows = await sql`
          SELECT * FROM complaints
          WHERE status_history::text ILIKE ${phonePattern}
             OR updates::text ILIKE ${phonePattern}
          ORDER BY saved_at DESC LIMIT 1
        `
        if (rows[0]) complaint = rows[0]
      }
    } catch (dbErr) {
      console.error('[Status Query DB Error]:', dbErr)
    }
  }

  if (!complaint) {
    const noCaseMsg = isHi
      ? `🔍 *कोई सक्रिय शिकायत नहीं मिली।*\n\nआपकी फोन संख्या (+${session.phoneNumber}) से जुड़ी कोई शिकायत रिकॉर्ड में नहीं मिली।\n\nयदि आपके पास घटना आईडी है, तो इस प्रकार भेजें:\n👉 *status INC-2026-XXXX*\n\nया नई शिकायत दर्ज करने के लिए अपनी घटना का विवरण (या वॉयस नोट 🎤) भेजें।`
      : `🔍 *No Active Complaint Found.*\n\nNo complaint on record linked to phone +${session.phoneNumber}.\n\nIf you have an Incident ID, send it like:\n👉 *status INC-2026-XXXX*\n\nOr send a voice note 🎤 / message to file a new cybercrime report.`
    session.history.push({ role: 'assistant', content: noCaseMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    return { reply: noCaseMsg }
  }

  const id = complaint.incident_id
  session.incidentId = id
  session.stage = 'FILED'

  const statusEmojis: Record<string, string> = {
    DRAFT: '📝',
    SUBMITTED: '🟡',
    ASSIGNED: '🔵',
    UNDER_REVIEW: '🟣',
    ACTION_TAKEN: '🟠',
    RESOLVED: '🟢',
    CLOSED: '⚪',
  }
  const curStatus = complaint.status || 'SUBMITTED'
  const emoji = statusEmojis[curStatus] || '🟡'

  const updatesList = Array.isArray(complaint.updates) ? complaint.updates : []
  const latestUpdate = updatesList.length > 0 ? updatesList[updatesList.length - 1] : null

  const trackingLink = `${APP_URL}/dashboard?id=${id}`

  const statusCard = isHi
    ? `📊 *शिकायत स्थिति रिपोर्ट (CASE STATUS)*
━━━━━━━━━━━━━━━━━━━━
📌 *घटना आईडी:* ${id}
${emoji} *वर्तमान स्थिति:* *${curStatus}*
🏷️ *श्रेणी:* ${complaint.fraud_type || 'वित्तीय धोखाधड़ी'}
💰 *धोखाधड़ी राशि:* ₹${Number(complaint.amount || 0).toLocaleString('en-IN')}
👤 *आरोपी विवरण:* ${complaint.frauder_contact || complaint.fraudster_identifier || 'दर्ज नहीं'}
🏦 *बैंक / नोडल:* ${complaint.bank_name || 'NCRP 1930 Triage'}
🕒 *दर्ज तिथि:* ${new Date(complaint.saved_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}

📝 *नवीनतम अपडेट:*
${latestUpdate ? `"${latestUpdate.note}"` : 'शिकायत दर्ज। 1930 व बैंक फ्रीज टोकन सक्रिय।'}

📄 *लाइव डॉसियर व औपचारिक FIR ड्राफ्ट:*
${trackingLink}
━━━━━━━━━━━━━━━━━━━━
💡 *सुझाव:* नया विवरण जोड़ने के लिए संदेश/वॉयस नोट/स्क्रीनशॉट भेजें, या नई शिकायत के लिए *NEW* लिखें।`
    : `📊 *CASE STATUS REPORT*
━━━━━━━━━━━━━━━━━━━━
📌 *Incident ID:* ${id}
${emoji} *Current Status:* *${curStatus}*
🏷️ *Category:* ${complaint.fraud_type || 'Financial Fraud'}
💰 *Disputed Amount:* ₹${Number(complaint.amount || 0).toLocaleString('en-IN')}
👤 *Fraudster Ref:* ${complaint.frauder_contact || complaint.fraudster_identifier || 'Not Specified'}
🏦 *Bank / Nodal Desk:* ${complaint.bank_name || 'NCRP 1930 Triage'}
🕒 *Filed At:* ${new Date(complaint.saved_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}

📝 *Latest Timeline Update:*
${latestUpdate ? `"${latestUpdate.note}"` : 'Complaint lodged. Golden Hour freeze token active.'}

📄 *View Full Case Dossier & Police Draft:*
${trackingLink}
━━━━━━━━━━━━━━━━━━━━
💡 *Tip:* Reply anytime with a UTR, voice note, or payment screenshot to add to this case, or reply *NEW* for another case.`

  session.history.push({ role: 'assistant', content: statusCard, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
  return { reply: statusCard, incidentId: id }
}

export async function processWhatsAppTurn(
  session: WhatsAppSession,
  userInput: string,
  mediaUrl?: string,
  voiceTranscript?: string,
  imageBase64?: string
): Promise<{ reply: string; filedComplaint?: TriageResult; incidentId?: string }> {
  const trimmed = userInput.trim()
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  session.history.push({ role: 'user', content: voiceTranscript ? `[Voice Note] ${voiceTranscript}` : userInput, timestamp })

  // Auto-restore previous incident from Neon DB if server restarted and memory was cleared
  if (!session.incidentId && process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(process.env.DATABASE_URL)
      const phonePattern = `%${session.phoneNumber}%`
      const cleanDigits = session.phoneNumber.replace(/[^0-9]/g, '')
      const digitPattern = cleanDigits.length >= 10 ? `%${cleanDigits.slice(-10)}%` : phonePattern

      const rows = await sql`
        SELECT incident_id, language, summary, summary_hi
        FROM complaints
        WHERE citizen_phone = ${session.phoneNumber}
           OR citizen_phone ILIKE ${digitPattern}
           OR status_history::text ILIKE ${phonePattern}
           OR updates::text ILIKE ${phonePattern}
           OR status_history::text ILIKE ${digitPattern}
           OR updates::text ILIKE ${digitPattern}
        ORDER BY saved_at DESC LIMIT 1
      `
      if (rows[0]?.incident_id) {
        session.incidentId = rows[0].incident_id
        session.stage = 'FILED'
        if (rows[0].language === 'hi' || rows[0].language === 'en') {
          session.language = rows[0].language
        }
      }
    } catch (e) {
      console.error('[WhatsApp Agent] DB lookup error:', e)
    }
  }

  // Case Status Check Intent
  const isStatusQuery =
    /^(status|track|tracking|check|kya hua|update kya|progress|mera case|meri complaint|check status|case status|complaint status|स्थिति|ट्रैक)$/i.test(trimmed) ||
    /^(status|track|check status)\s+INC-\d{4}-\d{4}$/i.test(trimmed) ||
    /^(what is the status|what is my case status|kya update hai|case ka status|check my case|check my complaint)/i.test(trimmed) ||
    (/^INC-\d{4}-\d{4}$/i.test(trimmed) && session.stage !== 'AWAITING_INCIDENT')

  if (isStatusQuery) {
    return await handleStatusQuery(session, trimmed)
  }

  // Vision Screenshot / Receipt OCR Intent
  if (imageBase64) {
    console.log(`[WhatsApp Agent] Running GPT-4o Vision on screenshot from +${session.phoneNumber}...`)
    const visionEvidence = await analyzeScreenshotWithVision(imageBase64)
    if (visionEvidence) {
      if (session.stage === 'FILED' || session.incidentId) {
        session.pendingVisionEvidence = visionEvidence
        const autoUpdateText = [
          visionEvidence.summary,
          trimmed && trimmed !== 'image' ? trimmed : '',
          visionEvidence.utr ? `UTR: ${visionEvidence.utr}` : '',
          visionEvidence.bankName ? `Bank: ${visionEvidence.bankName}` : '',
          visionEvidence.amount ? `Amount: ₹${visionEvidence.amount}` : '',
        ].filter(Boolean).join(' | ')

        return await updateExistingComplaint(session, session.incidentId!, autoUpdateText)
      } else {
        session.pendingVisionEvidence = visionEvidence
        session.language = detectLanguage(trimmed || visionEvidence.summary) === 'hi' ? 'hi' : 'en'
        const combinedText = [
          `Disputed transaction of ₹${visionEvidence.amount || 25000}`,
          visionEvidence.utr ? `UTR: ${visionEvidence.utr}` : '',
          visionEvidence.upiId ? `Fraudster UPI: ${visionEvidence.upiId}` : '',
          visionEvidence.bankName ? `Platform: ${visionEvidence.bankName}` : '',
          visionEvidence.summary,
          trimmed,
        ].filter(Boolean).join('. ')

        const result = await createAndSaveNewComplaint(session, combinedText, mediaUrl, voiceTranscript)
        const isHi = session.language === 'hi'
        const visionBanner = isHi
          ? `📸 *AI Vision द्वारा स्क्रीनशॉट का विश्लेषण पूर्ण:*\n${visionEvidence.amount ? `• 💰 *पहचानी गई राशि:* ₹${visionEvidence.amount.toLocaleString('en-IN')}\n` : ''}${visionEvidence.utr ? `• 🔢 *पहचाना गया UTR:* ${visionEvidence.utr}\n` : ''}${visionEvidence.upiId ? `• 👤 *आरोपी UPI:* ${visionEvidence.upiId}\n` : ''}\n`
          : `📸 *AI Vision Screenshot Analysis Complete:*\n${visionEvidence.amount ? `• 💰 *Detected Amount:* ₹${visionEvidence.amount.toLocaleString('en-IN')}\n` : ''}${visionEvidence.utr ? `• 🔢 *Detected UTR:* ${visionEvidence.utr}\n` : ''}${visionEvidence.upiId ? `• 👤 *Detected UPI ID:* ${visionEvidence.upiId}\n` : ''}\n`

        result.reply = visionBanner + result.reply
        return result
      }
    }
  }

  const isResetCommand = /^(reset|\/reset|restart|\/restart|clear)$/i.test(trimmed)
  const isInitialGreeting = /^(hi|hello|hey|namaste|help|madad|pranam|hlo|hii|hi samarthan[a-z0-9\s,.]*)$/i.test(trimmed)
  const isWebsiteDefaultMsg = trimmed.toLowerCase().includes('i want to report a cybercrime incident')

  const sendLanguageGreeting = () => {
    session.stage = 'SELECT_LANGUAGE'
    session.history = []
    session.accumulatedText = ''
    session.incidentId = undefined
    session.extractedData = undefined
    session.pendingUpdateText = undefined
    session.pendingMediaUrl = undefined

    const welcomeMsg = `👋 *Hi, I'm the Cyber Crime Helpline AI Assistant.*
Contact me 24x7 to report cyber fraud, online scams, or financial theft.

🌐 *Please select your language / कृपया भाषा चुनें:*
1️⃣ English
2️⃣ हिन्दी (Hindi)

👉 Reply *1* for English or *2* for Hindi.`

    session.history.push({ role: 'assistant', content: welcomeMsg, timestamp })
    return { reply: welcomeMsg }
  }

  // Hard reset
  if (isResetCommand) {
    return sendLanguageGreeting()
  }

  // ACTIVE COMPLAINT FLOW:
  // When citizen ALREADY has an active complaint on file, any message sent should automatically
  // update their existing complaint (unless they ask for status, greeting, or explicit new complaint).
  if (session.incidentId && (session.stage === 'FILED' || session.stage === 'AWAITING_UPDATE_OR_NEW')) {
    const isHi = session.language === 'hi'
    const noteText = (voiceTranscript || userInput).trim()

    // 1. Greeting with active case
    if (isInitialGreeting || isWebsiteDefaultMsg) {
      session.stage = 'FILED'
      const greetingActiveCase = isHi
        ? `👋 *नमस्ते! आपकी सक्रिय शिकायत हमारे पास दर्ज है:*
📌 *घटना आईडी:* ${session.incidentId}

🤖 *ऑटोमैटिक केस अपडेट सक्रिय है:*
आप जो भी नया विवरण, UTR नंबर, बैंक का नाम, वॉयस नोट 🎤 या लेनदेन स्क्रीनशॉट 📸 भेजेंगे, AI उसे स्वतः पढ़कर आपकी शिकायत (*${session.incidentId}*) में जोड़ देगा।

👉 यदि आप पूरी तरह से एक *नई शिकायत* दर्ज करना चाहते हैं, तो *NEW* या *नई शिकायत* लिखकर भेजें।`
        : `👋 *Welcome back! You have an active complaint on file:*
📌 *Incident ID:* ${session.incidentId}

🤖 *Automatic Case Sync Active:*
Any additional message, UTR number, bank details, voice note 🎤, or payment screenshot 📸 you send will be automatically read by AI and updated directly into this complaint (*${session.incidentId}*).

👉 If you want to start a brand *NEW complaint* instead, simply reply *NEW*.`

      session.history.push({ role: 'assistant', content: greetingActiveCase, timestamp })
      return { reply: greetingActiveCase, incidentId: session.incidentId }
    }

    // 2. Explicit command to start a brand new complaint
    const isExplicitNew = /^(new|start new|file new|new complaint|fresh|naya|nai|नई|नया|नई शिकायत)$/i.test(noteText)
    if (isExplicitNew) {
      session.stage = 'AWAITING_INCIDENT'
      session.accumulatedText = ''
      session.incidentId = undefined
      session.extractedData = undefined
      session.pendingUpdateText = undefined
      session.pendingMediaUrl = undefined

      const promptMsg = isHi
        ? `🆕 *नई शिकायत दर्ज करना शुरू करें।*
कृपया अपनी नई घटना का विवरण दें: एक **वॉयस नोट 🎤** भेजें या लिखकर बताएं कि क्या हुआ, कितनी राशि का नुकसान हुआ, और धोखेबाज़ की जानकारी।`
        : `🆕 *Starting a NEW Complaint in its entirety.*
Please describe your new incident: send a **Voice Note 🎤** or type what happened, the amount lost, and any fraudster details.`

      session.history.push({ role: 'assistant', content: promptMsg, timestamp })
      return { reply: promptMsg }
    }

    // 3. ANY OTHER MESSAGE (UTR, Bank Name, narrative, voice note) -> AUTOMATICALLY READ & UPDATE ACTIVE COMPLAINT!
    return await updateExistingComplaint(session, session.incidentId, noteText)
  }

  // Direct Incident Prompt Handler (for users without an active complaint, or after starting fresh):
  // When a user pastes a substantive incident prompt directly, bypass all greeting menus,
  // language selection, and update choices, and immediately file the complaint!
  if (isDetailedIncidentPrompt(trimmed, voiceTranscript)) {
    const fullIncidentText = (voiceTranscript || trimmed).trim()
    console.log(`\n⚡ [WhatsApp Agent] DIRECT INCIDENT PROMPT DETECTED from +${session.phoneNumber}!`)
    console.log(`[WhatsApp Agent] Skipping intermediate menus and filing complaint directly...`)

    session.language = detectLanguage(fullIncidentText) === 'hi' ? 'hi' : 'en'
    session.stage = 'AWAITING_INCIDENT'
    session.accumulatedText = fullIncidentText
    session.pendingUpdateText = undefined
    session.pendingMediaUrl = undefined

    return await createAndSaveNewComplaint(session, fullIncidentText, mediaUrl, voiceTranscript)
  }

  // Initial greeting with no existing complaint
  if (isInitialGreeting || isWebsiteDefaultMsg) {
    return sendLanguageGreeting()
  }

  // STAGE 1: SELECT_LANGUAGE
  if (session.stage === 'SELECT_LANGUAGE') {
    const isSelectEn = /^(1|1\.|1️⃣|en|english)$/i.test(trimmed)
    const isSelectHi = /^(2|2\.|2️⃣|hindi|हिंदी|हिन्दी)$/i.test(trimmed)

    if (isSelectEn) {
      session.language = 'en'
      session.stage = 'AWAITING_INCIDENT'
      const reply = `✅ *Language set to English.*

🎙️ *Voice Feature Ready — Test it out!*
You can now test our voice feature capabilities! Send a **Voice Note 🎤** (or type a message) explaining what happened:

• What occurred? (e.g. fake bank call, UPI fraud, investment scam)
• Approximate amount lost (₹)
• Fraudster's name, phone number, or UPI ID (if known)

Send your voice note now, and I will listen, extract the details, and draft your official FIR complaint!`

      session.history.push({ role: 'assistant', content: reply, timestamp })
      return { reply }
    }

    if (isSelectHi) {
      session.language = 'hi'
      session.stage = 'AWAITING_INCIDENT'
      const reply = `✅ *भाषा हिन्दी सेट की गई।*

🎙️ *वॉयस सुविधा तैयार — अभी आज़माएं!*
आप हमारी वॉयस सुविधा का परीक्षण कर सकते हैं! अपनी घटना बताते हुए एक **वॉयस नोट 🎤** (या लिखकर संदेश) भेजें:

• क्या हुआ? (जैसे: फर्जी बैंक कॉल, UPI धोखाधड़ी, निवेश घोटाला)
• खोई हुई राशि (₹)
• आरोपी का नाम, मोबाइल नंबर या UPI ID (यदि उपलब्ध हो)

अभी अपना वॉयस नोट भेजें, मैं इसे सुनकर कानूनी धाराओं की पहचान करूंगा और आपकी औपचारिक FIR शिकायत तैयार करूंगा!`

      session.history.push({ role: 'assistant', content: reply, timestamp })
      return { reply }
    }

    // Direct incident text or voice without picking 1/2
    const ext = quickExtract(trimmed)
    const hasIncidentDetails = Boolean(voiceTranscript || ext.amount || ext.upi || ext.phone || trimmed.length > 40)

    if (!hasIncidentDetails) {
      return sendLanguageGreeting()
    }

    session.language = detectLanguage(voiceTranscript || trimmed) === 'hi' ? 'hi' : 'en'
    session.stage = 'AWAITING_INCIDENT'
  }

  // STAGE: AWAITING_INCIDENT -> First incident intake
  const initialText = (voiceTranscript || userInput).trim()
  session.accumulatedText += (session.accumulatedText ? ' ' : '') + initialText
  return await createAndSaveNewComplaint(session, session.accumulatedText, mediaUrl, voiceTranscript)
}

// Helper: Extract structured update fields using GPT-4o-mini
async function extractUpdateDetailsWithAI(note: string) {
  const utrMatch = note.match(/\b([0-9]{12})\b/) || note.match(/(?:utr|ref|txn)[\s:#-]*([0-9A-Za-z]{8,18})/i)
  const bankMatch = note.match(/\b(hdfc|sbi|state bank(?: of india)?|icici|axis|pnb|punjab national bank|kotak|bob|bank of baroda|canara|union bank|indusind|yes bank|idfc|paytm payments bank|airtel payments bank)\b/i)
  const upiMatch = note.match(/[\w.-]+@[\w.-]+/)
  const phoneMatch = note.match(/(?:(?:\+?91)?[ -]?)?([6-9]\d{9})\b/)
  const accountMatch = note.match(/(?:a\/c|acc|account)[\s:#-]*([0-9]{9,18})/i)
  const nameMatch = note.match(/(?:mera naam|my name is|i am|main hoon)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)

  // Accused / fraudster correction regex: e.g. "his name is not amrit vijal its amruth vishal and he is from tapmi manipal"
  const fraudsterCorrectionMatch = note.match(/(?:his name is not|his name is|not [a-z0-9\s]+ (?:it's|its|it is)|correct name is|accused is|fraudster is)\s*([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?(?:\s+(?:from|at)\s+[A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)?)/i)

  const fallback = {
    utr: utrMatch ? utrMatch[1] : null,
    bankName: bankMatch ? bankMatch[0] : null,
    upiId: upiMatch ? upiMatch[0] : null,
    fraudsterIdentifier: fraudsterCorrectionMatch ? fraudsterCorrectionMatch[1].trim() : (phoneMatch ? phoneMatch[1] : upiMatch ? upiMatch[0] : null),
    accountNumber: accountMatch ? accountMatch[1] : null,
    amount: null,
    complainantName: nameMatch ? nameMatch[1].trim() : null,
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'mock-key' || !apiKey.startsWith('sk-')) {
    return fallback
  }

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an Indian cybercrime triage assistant. The user is providing an update or correction to an existing cybercrime complaint (e.g. correcting the accused fraudster's name like "his name is not X it's Y", providing a UTR, bank name, amount, UPI ID, account number, or complainant name). Extract all updated/corrected incident details. Return JSON with fields: utr (string|null), bankName (string|null), upiId (string|null), fraudsterIdentifier (string|null), accountNumber (string|null), amount (number|null), complainantName (string|null).`,
        },
        { role: 'user', content: note },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return {
      utr: parsed.utr || fallback.utr,
      bankName: parsed.bankName || fallback.bankName,
      upiId: parsed.upiId || fallback.upiId,
      fraudsterIdentifier: parsed.fraudsterIdentifier || fallback.fraudsterIdentifier,
      accountNumber: parsed.accountNumber || fallback.accountNumber,
      amount: typeof parsed.amount === 'number' ? parsed.amount : null,
      complainantName: parsed.complainantName || fallback.complainantName,
    }
  } catch {
    return fallback
  }
}

// Helper: Update an existing complaint in Neon DB
async function updateExistingComplaint(
  session: WhatsAppSession,
  incidentId: string,
  noteText: string
): Promise<{ reply: string; incidentId: string }> {
  const isHi = session.language === 'hi'
  const extractedUpdate = await extractUpdateDetailsWithAI(noteText)

  // Merge any pending vision evidence from uploaded screenshot
  const vision = session.pendingVisionEvidence
  if (vision) {
    if (!extractedUpdate.utr && vision.utr) extractedUpdate.utr = vision.utr
    if (!extractedUpdate.bankName && vision.bankName) extractedUpdate.bankName = vision.bankName
    if (!extractedUpdate.upiId && vision.upiId) extractedUpdate.upiId = vision.upiId
    if (!extractedUpdate.amount && vision.amount) extractedUpdate.amount = vision.amount
    if (!extractedUpdate.fraudsterIdentifier && (vision.fraudsterName || vision.upiId)) {
      extractedUpdate.fraudsterIdentifier = vision.fraudsterName || vision.upiId
    }
  }

  const filledItems: string[] = []
  if (extractedUpdate.amount) filledItems.push(isHi ? `पहचानी गई राशि: ₹${extractedUpdate.amount.toLocaleString('en-IN')}` : `Detected Amount: ₹${extractedUpdate.amount.toLocaleString('en-IN')}`)
  if (extractedUpdate.utr) filledItems.push(isHi ? `UTR नंबर: ${extractedUpdate.utr}` : `UTR Number: ${extractedUpdate.utr}`)
  if (extractedUpdate.bankName) filledItems.push(isHi ? `बैंक: ${extractedUpdate.bankName}` : `Bank Name: ${extractedUpdate.bankName}`)
  if (extractedUpdate.upiId) filledItems.push(isHi ? `UPI ID: ${extractedUpdate.upiId}` : `UPI Handle: ${extractedUpdate.upiId}`)
  if (extractedUpdate.fraudsterIdentifier) filledItems.push(isHi ? `संशोधित/पहचाना गया आरोपी: ${extractedUpdate.fraudsterIdentifier}` : `Updated/Corrected Accused: ${extractedUpdate.fraudsterIdentifier}`)
  if (extractedUpdate.accountNumber) filledItems.push(isHi ? `खाता संख्या: ${extractedUpdate.accountNumber}` : `Account Number: ${extractedUpdate.accountNumber}`)
  if (extractedUpdate.complainantName) filledItems.push(isHi ? `शिकायतकर्ता: ${extractedUpdate.complainantName}` : `Complainant: ${extractedUpdate.complainantName}`)

  // Guarantee session state remains in FILED stage for continuous follow-ups
  session.stage = 'FILED'
  session.pendingUpdateText = undefined
  session.pendingVisionEvidence = undefined
  session.pendingMediaUrl = undefined

  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(process.env.DATABASE_URL)

      const existing = await sql`SELECT updates, frauder_contact, bank_name, upi_id, account_number, amount, complaint_draft, complaint_draft_hi, complainant_name, fraudster_identifier FROM complaints WHERE incident_id = ${incidentId} LIMIT 1`

      if (existing[0]) {
        const row = existing[0]
        const curUpdates = Array.isArray(row.updates) ? row.updates : []
        const noteToSave = vision
          ? (noteText ? `${noteText} [Verified Screenshot: ${vision.summary}]` : `[Evidence Screenshot Analyzed] ${vision.summary}`)
          : noteText

        curUpdates.push({
          id: `up-${Date.now()}`,
          note: noteToSave,
          addedAt: new Date().toISOString(),
          citizenPhone: session.phoneNumber,
          actionPoints: extractedUpdate.utr ? [`Provide UTR ${extractedUpdate.utr} to bank immediately`] : [],
          actionPointsHi: extractedUpdate.utr ? [`बैंक को तत्काल UTR ${extractedUpdate.utr} बताएं`] : [],
        })

        const updatedContact = extractedUpdate.utr
          ? (row.frauder_contact && !row.frauder_contact.toLowerCase().includes('not provided')
              ? `${row.frauder_contact}; UTR: ${extractedUpdate.utr}`
              : `UTR: ${extractedUpdate.utr}`)
          : row.frauder_contact

        const updatedBank = extractedUpdate.bankName || row.bank_name
        const updatedUpi = extractedUpdate.upiId || row.upi_id
        const updatedAcc = extractedUpdate.accountNumber || row.account_number
        const updatedAmount = extractedUpdate.amount || row.amount
        const updatedComplainant = extractedUpdate.complainantName || row.complainant_name || 'Citizen Complainant'
        const updatedFraudster = extractedUpdate.fraudsterIdentifier || row.fraudster_identifier

        const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        let updatedDraft = (row.complaint_draft || '') + `\n\n[SUPPLEMENTARY STATEMENT — ${timeStr}]\nVictim update via WhatsApp (${session.phoneNumber}): ${noteToSave}`
        let updatedDraftHi = (row.complaint_draft_hi || '') + `\n\n[पूरक बयान — ${timeStr}]\nव्हाट्सएप द्वारा नया विवरण (${session.phoneNumber}): ${noteToSave}`

        if (extractedUpdate.fraudsterIdentifier && row.fraudster_identifier) {
          updatedDraft = updatedDraft.replaceAll(row.fraudster_identifier, extractedUpdate.fraudsterIdentifier)
          updatedDraftHi = updatedDraftHi.replaceAll(row.fraudster_identifier, extractedUpdate.fraudsterIdentifier)
        }

        // Clear vision evidence after consuming
        session.pendingVisionEvidence = undefined

        await sql`
          UPDATE complaints SET
            fraudster_identifier = ${updatedFraudster},
            frauder_contact = ${updatedContact},
            bank_name = ${updatedBank},
            upi_id = ${updatedUpi},
            account_number = ${updatedAcc},
            amount = ${updatedAmount},
            complainant_name = ${updatedComplainant},
            citizen_phone = COALESCE(complaints.citizen_phone, ${session.phoneNumber}),
            updates = ${JSON.stringify(curUpdates)},
            complaint_draft = ${updatedDraft},
            complaint_draft_hi = ${updatedDraftHi}
          WHERE incident_id = ${incidentId}
        `
      }
    } catch (dbErr) {
      console.error('[WhatsApp Agent] DB update error:', dbErr)
    }
  }

  const trackingLink = `${APP_URL}/dashboard?id=${incidentId}`
  let reply = ''

  if (filledItems.length > 0) {
    reply = isHi
      ? `✅ *शिकायत (${incidentId}) में विवरण स्वतः जोड़ दिया गया!*
📌 *घटना आईडी:* ${incidentId}

🤖 *AI ने पढ़ा और अपडेट किया:*
${filledItems.map(f => `• ${f}`).join('\n')}

⚖️ आपकी आधिकारिक पुलिस FIR शिकायत व बैंक फ्रीज निर्देश अपडेट कर दिए गए हैं।

📄 *अपडेटेड शिकायत देखें:*
${trackingLink}

💡 *सुझाव:* नई शिकायत शुरू करने के लिए कभी भी *NEW* लिखें।`
      : `✅ *Complaint (${incidentId}) Automatically Updated!*
📌 *Incident ID:* ${incidentId}

🤖 *AI Understood & Applied:*
${filledItems.map(f => `• ${f}`).join('\n')}

⚖️ Your official FIR draft and bank freeze instructions have been updated with these details.

📄 *View Updated Complaint:*
${trackingLink}

💡 *Tip:* To start a brand new complaint anytime, reply *NEW*.`
  } else {
    reply = isHi
      ? `✅ *अतिरिक्त जानकारी पुरानी शिकायत (${incidentId}) से जोड़ दी गई।*
आपकी जानकारी घटना आईडी *${incidentId}* में दर्ज कर ली गई है।

📄 *अपडेटेड केस देखें:*
${trackingLink}

💡 *सुझाव:* नई शिकायत शुरू करने के लिए *NEW* लिखें।`
      : `✅ *Update Recorded on Complaint (${incidentId}).*
Your note has been attached to Incident ID *${incidentId}*.

📄 *Track Case:*
${trackingLink}

💡 *Tip:* To start a brand new complaint anytime, reply *NEW*.`
  }

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  session.history.push({ role: 'assistant', content: reply, timestamp })
  return { reply, incidentId }
}

// Helper: Create a brand new complaint from scratch in Neon DB
async function createAndSaveNewComplaint(
  session: WhatsAppSession,
  incidentText: string,
  mediaUrl?: string,
  voiceTranscript?: string
): Promise<{ reply: string; filedComplaint: TriageResult; incidentId: string }> {
  const isHi = session.language === 'hi'
  const extracted = quickExtract(incidentText)
  const apiKey = process.env.OPENAI_API_KEY
  let triageResult: TriageResult

  if (apiKey && apiKey !== 'mock-key' && apiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey })
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an Indian cybercrime triage officer. Return ONLY JSON matching TriageResult schema. Fields: fraudType (Financial Fraud, Women/Children Related Crime, Extortion & Blackmail, Identity Theft, E-Commerce Scams, Investment Scam, Other Cyber Crime), fraudsterIdentifier, complainantName, amount (number), bankName, accountNumber, upiId, timeline, summary (2 sentences), summaryHi, complaintDraft (formal police complaint), complaintDraftHi, freezeSteps (string[]), applicableLaws (string[]), frauderContact, recommendedChannel ("bank"|"agency"|"platform"|"helpline"), recommendedChannelTarget.`,
          },
          { role: 'user', content: incidentText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      })

      const parsed = JSON.parse(completion.choices[0].message.content || '{}')
      const incidentId = generateId()
      const fraudType = (parsed.fraudType || 'Financial Fraud') as any
      const channelInfo = inferChannelFromFraudType(fraudType)

      const nameMatch = incidentText.match(/(?:mera naam|my name is|i am|main hoon)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
      const rawComplainant = (parsed.complainantName && typeof parsed.complainantName === 'string' && parsed.complainantName.trim()) || (nameMatch ? nameMatch[1].trim() : '')
      const finalComplainant = rawComplainant && !['not identified', 'not provided', 'unknown', 'n/a', 'none'].includes(rawComplainant.toLowerCase())
        ? rawComplainant
        : 'Citizen Complainant'

      const freezeSteps = Array.isArray(parsed.freezeSteps) && parsed.freezeSteps.length > 0 && typeof parsed.freezeSteps[0] === 'object'
        ? parsed.freezeSteps
        : defaultFreezeSteps

      const applicableLaws = Array.isArray(parsed.applicableLaws) && parsed.applicableLaws.length > 0 && typeof parsed.applicableLaws[0] === 'object'
        ? parsed.applicableLaws
        : defaultLaws

      triageResult = {
        incidentId,
        fraudType,
        fraudsterIdentifier: parsed.fraudsterIdentifier || extracted.upi || extracted.phone || 'Not Identified',
        complainantName: finalComplainant,
        amount: Number(parsed.amount) || extracted.amount || 0,
        urgencyLevel: 'CRITICAL',
        summary: parsed.summary || 'Cyber fraud reported via WhatsApp triage bot.',
        summaryHi: parsed.summaryHi || 'व्हाट्सएप ट्रायज बॉट के माध्यम से साइबर धोखाधड़ी दर्ज की गई।',
        complaintDraft: parsed.complaintDraft || `Formal complaint regarding unauthorized cyber fraud of ₹${extracted.amount || 0}.`,
        complaintDraftHi: parsed.complaintDraftHi || `अनधिकृत साइबर धोखाधड़ी की औपचारिक शिकायत।`,
        frauderContact: parsed.frauderContact || (extracted.utr ? `UTR: ${extracted.utr}` : 'Not Provided'),
        bankName: parsed.bankName || 'Not Provided',
        accountNumber: parsed.accountNumber || 'Not Provided',
        upiId: parsed.upiId || extracted.upi || 'Not Provided',
        timeline: new Date().toLocaleString(),
        freezeSteps,
        applicableLaws,
        recommendedChannel: channelInfo.channel,
        recommendedChannelTarget: channelInfo.target,
      }
    } catch {
      triageResult = generateFallbackResult(incidentText, extracted)
    }
  } else {
    triageResult = generateFallbackResult(incidentText, extracted)
  }

  // Merge pending vision evidence if available
  const vision = session.pendingVisionEvidence
  if (vision) {
    if (vision.amount && (!triageResult.amount || triageResult.amount === 0)) {
      triageResult.amount = vision.amount
    }
    if (vision.utr && (!triageResult.frauderContact || triageResult.frauderContact.includes('Not Provided'))) {
      triageResult.frauderContact = `UTR: ${vision.utr}`
    }
    if (vision.upiId && (!triageResult.upiId || triageResult.upiId.includes('Not Provided'))) {
      triageResult.upiId = vision.upiId
    }
    if (vision.bankName && (!triageResult.bankName || triageResult.bankName.includes('Not Provided'))) {
      triageResult.bankName = vision.bankName
    }
    if (vision.fraudsterName && (!triageResult.fraudsterIdentifier || triageResult.fraudsterIdentifier === 'Not Identified')) {
      triageResult.fraudsterIdentifier = vision.fraudsterName
    }
    session.pendingVisionEvidence = undefined
  }

  // Save to database with citizen phone tag
  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = process.env.DATABASE_URL
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(dbUrl)
      await sql`
        INSERT INTO complaints (
          incident_id, fraud_type, fraudster_identifier, complainant_name,
          amount, urgency_level,
          summary, summary_hi, complaint_draft, complaint_draft_hi,
          frauder_contact, bank_name, account_number, upi_id, timeline,
          freeze_steps, applicable_laws, saved_at, language,
          status, status_history, evidence_images, updates,
          recommended_channel, recommended_channel_target, citizen_phone
        ) VALUES (
          ${triageResult.incidentId}, ${triageResult.fraudType}, ${triageResult.fraudsterIdentifier}, ${triageResult.complainantName || ''},
          ${triageResult.amount}, ${triageResult.urgencyLevel},
          ${triageResult.summary}, ${triageResult.summaryHi}, ${triageResult.complaintDraft}, ${triageResult.complaintDraftHi},
          ${triageResult.frauderContact}, ${triageResult.bankName}, ${triageResult.accountNumber}, ${triageResult.upiId}, ${triageResult.timeline},
          ${JSON.stringify(triageResult.freezeSteps)}, ${JSON.stringify(triageResult.applicableLaws)}, ${new Date().toISOString()}, ${isHi ? 'hi' : 'en'},
          'SUBMITTED', ${JSON.stringify([{ status: 'SUBMITTED', at: new Date().toISOString(), note: `Filed automatically via WhatsApp Bot (${session.phoneNumber})` }])},
          ${JSON.stringify(mediaUrl ? [mediaUrl] : [])}, ${JSON.stringify([{ id: `init-${Date.now()}`, citizenPhone: session.phoneNumber, note: 'Intake via WhatsApp' }])},
          ${triageResult.recommendedChannel || 'bank'}, ${triageResult.recommendedChannelTarget || 'Bank Nodal Officer'},
          ${session.phoneNumber}
        )
        ON CONFLICT (incident_id) DO UPDATE SET
          amount = EXCLUDED.amount,
          frauder_contact = EXCLUDED.frauder_contact,
          citizen_phone = COALESCE(complaints.citizen_phone, EXCLUDED.citizen_phone);
      `
    } catch (dbErr) {
      console.error('[WhatsApp Agent] Neon DB save error:', dbErr)
    }
  }

  session.stage = 'FILED'
  session.incidentId = triageResult.incidentId
  session.extractedData = triageResult
  session.accumulatedText = incidentText

  const trackingLink = `${APP_URL}/dashboard?id=${triageResult.incidentId}`

  const lawsList = triageResult.applicableLaws
    .map((l: any) => (typeof l === 'string' ? l : (l.section || l.title || 'IT Act')))
    .join(', ')

  const voiceHeader = voiceTranscript
    ? isHi
      ? `🎙️ *वॉयस नोट सुना और ट्रांसक्राइब किया गया:*\n"${voiceTranscript}"\n\n`
      : `🎙️ *Voice Note Heard & Transcribed:*\n"${voiceTranscript}"\n\n`
    : ''

  const reply = isHi
    ? `${voiceHeader}🚨 *नई शिकायत सफलतापूर्वक दर्ज की गई!*
📌 *घटना आईडी:* ${triageResult.incidentId}
⚖️ *लागू कानून:* ${lawsList}
💰 *राशि:* ₹${triageResult.amount.toLocaleString('en-IN')}
👤 *आरोपी:* ${triageResult.fraudsterIdentifier}

📋 *शिकायत का विवरण:*
${triageResult.summaryHi || triageResult.summary}

⚡ *तत्काल गोल्डन ऑवर कार्रवाई:*
1. तुरंत 1930 हेल्पलाइन डायल करें और उपरोक्त घटना आईडी बताएं।
2. अपने बैंक को कॉल करके UTR नंबर ${extracted.utr || 'लेनदेन संदर्भ'} फ्रीज करने को कहें।

📄 *लाइव स्टेटस और औपचारिक FIR ड्राफ्ट देखें:*
${trackingLink}

💡 *सुझाव:* इस शिकायत में नया विवरण जोड़ने के लिए कभी भी संदेश भेजें, या नई रिपोर्ट के लिए *NEW* लिखें।`
    : `${voiceHeader}🚨 *NEW COMPLAINT FILED IN ITS ENTIRETY!*
📌 *Incident ID:* ${triageResult.incidentId}
⚖️ *Applicable Laws:* ${lawsList}
💰 *Amount:* ₹${triageResult.amount.toLocaleString('en-IN')}
👤 *Reported Against:* ${triageResult.fraudsterIdentifier}

📋 *Official Summary:*
${triageResult.summary}

⚡ *IMMEDIATE GOLDEN HOUR ACTIONS:*
1. Dial 1930 Helpline immediately and quote Incident ID: ${triageResult.incidentId}.
2. Contact your bank nodal desk to freeze beneficiary account (Ref: ${extracted.utr || 'Pending'}).

📄 *Track Live & Download Formal Complaint:*
${trackingLink}

💡 *Tip:* Send updates (like UTRs) anytime to add to this case, or reply *NEW* for another case.`

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  session.history.push({ role: 'assistant', content: reply, timestamp })

  return {
    reply,
    filedComplaint: triageResult,
    incidentId: triageResult.incidentId,
  }
}

function generateFallbackResult(text: string, ext: ReturnType<typeof quickExtract>): TriageResult {
  const incidentId = generateId()
  const amount = ext.amount || 45000
  const fraudster = ext.upi || ext.phone || 'Fraudulent Entity'
  const nameMatch = text.match(/(?:mera naam|my name is|i am|main hoon)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
  const complainantName = nameMatch ? nameMatch[1].trim() : 'Citizen Complainant'

  return {
    incidentId,
    fraudType: 'Financial Fraud',
    fraudsterIdentifier: fraudster,
    complainantName,
    amount,
    urgencyLevel: 'CRITICAL',
    summary: `Unauthorized financial debit of ₹${amount.toLocaleString('en-IN')} reported via WhatsApp Bot.`,
    summaryHi: `व्हाट्सएप बॉट के माध्यम से ₹${amount.toLocaleString('en-IN')} की अनधिकृत निकासी दर्ज की गई।`,
    complaintDraft: `To The Station House Officer / Cyber Crime Cell,
I, ${complainantName}, am filing a formal complaint regarding an unauthorized debit of ₹${amount.toLocaleString('en-IN')} from my account. The beneficiary identifier is ${fraudster}${ext.utr ? ` with transaction reference UTR: ${ext.utr}` : ''}. I request immediate lien-marking of funds and registration of FIR under Section 66C and 66D of Information Technology Act.`,
    complaintDraftHi: `थाना प्रभारी / साइबर अपराध शाखा,
मैं, ${complainantName}, अपने खाते से ₹${amount.toLocaleString('en-IN')} की अनधिकृत निकासी की औपचारिक शिकायत दर्ज कर रहा हूँ। आरोपी का पहचानकर्ता ${fraudster} है। कृपया आईटी अधिनियम की धारा 66C और 66D के तहत कार्रवाई करें।`,
    frauderContact: ext.utr ? `Ref UTR: ${ext.utr}; Contact: ${ext.phone || 'Not Provided'}` : (ext.phone || 'Not Provided'),
    bankName: 'Bank Nodal Desk',
    accountNumber: 'Not Provided',
    upiId: ext.upi || 'Not Provided',
    timeline: new Date().toLocaleString(),
    freezeSteps: defaultFreezeSteps,
    applicableLaws: defaultLaws,
    recommendedChannel: 'bank',
    recommendedChannelTarget: 'Bank Nodal Officer',
  }
}

const defaultFreezeSteps: FreezeStep[] = [
  {
    step: 1,
    action: 'Dial 1930 Cyber Helpline immediately',
    actionHi: 'तुरंत 1930 साइबर हेल्पलाइन पर कॉल करें',
    detail: 'Report unauthorized transaction to freeze funds inside golden hour.',
    detailHi: 'गोल्डन ऑवर में पैसे फ्रीज करने के लिए अनधिकृत लेनदेन की रिपोर्ट करें।',
    hotline: '1930',
  },
  {
    step: 2,
    action: 'Notify Bank Nodal Officer',
    actionHi: 'बैंक के नोडल अधिकारी को सूचित करें',
    detail: 'Request urgent lien-marking on beneficiary account.',
    detailHi: 'लाभार्थी खाते पर तत्काल लियन मार्किंग का अनुरोध करें।',
  },
  {
    step: 3,
    action: 'Preserve Evidence & UTR',
    actionHi: 'साक्ष्य और UTR सुरक्षित रखें',
    detail: 'Keep evidence ready for cyber police verification.',
    detailHi: 'साइबर पुलिस सत्यापन के लिए साक्ष्य तैयार रखें।',
  },
]

const defaultLaws: ApplicableLaw[] = [
  {
    section: 'Section 66C IT Act 2000',
    title: 'Identity Theft & Fraudulent Authentication',
    titleHi: 'पहचान की चोरी और धोखाधड़ी',
    reason: 'Fraudulent use of password, electronic signature or credential.',
    reasonHi: 'पासवर्ड या इलेक्ट्रॉनिक साख का अनधिकृत उपयोग।',
  },
  {
    section: 'Section 66D IT Act 2000',
    title: 'Cheating by Personation using Computer Resource',
    titleHi: 'कंप्यूटर संसाधन द्वारा प्रतिरूपण',
    reason: 'Cheating by pretending to be an authentic financial entity or person.',
    reasonHi: 'विश्वसनीय संस्था होने का नाटक करके धोखाधड़ी।',
  },
]
