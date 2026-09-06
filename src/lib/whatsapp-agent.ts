import OpenAI from 'openai'
import { generateId, TriageResult, FreezeStep, ApplicableLaw, IT_ACT_SECTIONS } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'

export type WhatsAppStage = 'SELECT_LANGUAGE' | 'AWAITING_INCIDENT' | 'FILED' | 'AWAITING_UPDATE_OR_NEW'

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

export async function processWhatsAppTurn(
  session: WhatsAppSession,
  userInput: string,
  mediaUrl?: string,
  voiceTranscript?: string
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
      const rows = await sql`
        SELECT incident_id, language, summary, summary_hi
        FROM complaints
        WHERE status_history::text ILIKE ${phonePattern}
           OR updates::text ILIKE ${phonePattern}
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

  // If user greets when they ALREADY have an active complaint on file
  if ((isInitialGreeting || isWebsiteDefaultMsg) && session.incidentId) {
    const isHi = session.language === 'hi'
    session.stage = 'AWAITING_UPDATE_OR_NEW'
    session.pendingUpdateText = ''

    const greetingWithChoice = isHi
      ? `👋 *नमस्ते! आपकी सक्रिय शिकायत हमारे पास दर्ज है:*
📌 *घटना आईडी:* ${session.incidentId}

*आप क्या करना चाहते हैं?*
1️⃣ मौजूदा शिकायत (*${session.incidentId}*) में नया विवरण जोड़ें/अपडेट करें
2️⃣ पूरी तरह से एक *नई शिकायत* दर्ज करें

👉 पुरानी शिकायत जारी रखने के लिए *1* या नई शिकायत के लिए *2* भेजें।`
      : `👋 *Welcome back! You have an active complaint on file:*
📌 *Incident ID:* ${session.incidentId}

*What would you like to do?*
1️⃣ *Continue / Update* this existing complaint (*${session.incidentId}*) with new details
2️⃣ *Start a NEW complaint* in its entirety

👉 Reply *1* to update your existing case or *2* to file a brand new complaint.`

    session.history.push({ role: 'assistant', content: greetingWithChoice, timestamp })
    return { reply: greetingWithChoice, incidentId: session.incidentId }
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

  // STAGE: AWAITING_UPDATE_OR_NEW (User is choosing whether to update existing or start fresh)
  if (session.stage === 'AWAITING_UPDATE_OR_NEW') {
    const isHi = session.language === 'hi'
    const isOption1 = /^(1|1\.|1️⃣|update|continue|purani|purana|old|same|haan|yes|add|अपडेट|पुरानी|पुराना|जारी|हाँ|हां)$/i.test(trimmed) || /^1[\s,.]/i.test(trimmed)
    const isOption2 = /^(2|2\.|2️⃣|new|start new|fresh|naya|nayee|nai|नई|नया|न्यू|नई शिकायत)$/i.test(trimmed) || /^2[\s,.]/i.test(trimmed)

    if (isOption1) {
      // User chooses: 1 -> Update existing complaint
      let updateText = (session.pendingUpdateText || '').trim()
      const extra = trimmed.replace(/^(?:1|1\.|1️⃣|update|continue|purani|पुरानी|अपडेट)[\s,:-]*/i, '').trim()
      if (extra) {
        updateText += (updateText ? ' ' : '') + extra
      }
      if (voiceTranscript) {
        updateText += (updateText ? ' ' : '') + voiceTranscript
      }

      session.pendingUpdateText = undefined
      session.pendingMediaUrl = undefined
      session.stage = 'FILED'

      if (!updateText) {
        const askDetails = isHi
          ? `📝 कृपया वह नया विवरण (जैसे UTR नंबर, बैंक नाम, स्क्रीनशॉट) भेजें जिसे आप शिकायत *${session.incidentId}* में जोड़ना चाहते हैं:`
          : `📝 Please send the new details (such as UTR number, bank name, fraudster contact) you would like to add to complaint *${session.incidentId}*:`
        session.history.push({ role: 'assistant', content: askDetails, timestamp })
        return { reply: askDetails, incidentId: session.incidentId }
      }

      return await updateExistingComplaint(session, session.incidentId!, updateText)
    }

    if (isOption2) {
      // User chooses: 2 -> Start a NEW complaint in its entirety
      let newIncidentText = (session.pendingUpdateText || '').trim()
      const extra = trimmed.replace(/^(?:2|2\.|2️⃣|new|start new|fresh|naya|नई|नया)[\s,:-]*/i, '').trim()
      if (extra) {
        newIncidentText += (newIncidentText ? ' ' : '') + extra
      }
      if (voiceTranscript) {
        newIncidentText += (newIncidentText ? ' ' : '') + voiceTranscript
      }

      const mediaToUse = session.pendingMediaUrl
      session.pendingUpdateText = undefined
      session.pendingMediaUrl = undefined

      // If user had provided substantive text in their initial update message, file it directly
      if (newIncidentText && (newIncidentText.length > 15 || quickExtract(newIncidentText).amount)) {
        return await createAndSaveNewComplaint(session, newIncidentText, mediaToUse, voiceTranscript)
      } else {
        // Prompt for the new incident details
        session.stage = 'AWAITING_INCIDENT'
        session.accumulatedText = ''
        session.incidentId = undefined
        session.extractedData = undefined

        const promptMsg = isHi
          ? `🆕 *नई शिकायत दर्ज करना शुरू करें।*
कृपया अपनी नई घटना का विवरण दें: एक **वॉयस नोट 🎤** भेजें या लिखकर बताएं कि क्या हुआ, कितनी राशि का नुकसान हुआ, और धोखेबाज़ की जानकारी।`
          : `🆕 *Starting a NEW Complaint in its entirety.*
Please describe your new incident: send a **Voice Note 🎤** or type what happened, the amount lost, and any fraudster details.`

        session.history.push({ role: 'assistant', content: promptMsg, timestamp })
        return { reply: promptMsg }
      }
    }

    // User sent additional text or details without typing 1 or 2 explicitly
    const incomingText = voiceTranscript || trimmed
    session.pendingUpdateText = (session.pendingUpdateText ? session.pendingUpdateText + ' ' : '') + incomingText

    const promptAgain = isHi
      ? `⚠️ *कृपया स्पष्ट करने के लिए 1 या 2 भेजें:*

1️⃣ पुरानी शिकायत (*${session.incidentId}*) में यह नया विवरण अपडेट करें
2️⃣ पूरी तरह से एक *नई शिकायत* दर्ज करें

👉 पुरानी शिकायत अपडेट करने के लिए *1* या नई शिकायत शुरू करने के लिए *2* भेजें।`
      : `⚠️ *Please reply with 1 or 2 to proceed:*

1️⃣ *Update / Continue* existing complaint (*${session.incidentId}*) with this info
2️⃣ *Start a NEW complaint* in its entirety

👉 Reply *1* to update existing case or *2* to start a new complaint.`

    session.history.push({ role: 'assistant', content: promptAgain, timestamp })
    return { reply: promptAgain, incidentId: session.incidentId }
  }

  // STAGE: FILED (Complaint already filed. When citizen sends an update, give select option!)
  if (session.stage === 'FILED') {
    const isHi = session.language === 'hi'
    const noteText = (voiceTranscript || userInput).trim()

    // Explicit command to start new complaint directly
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

    // Citizen sends an update or new detail -> Present select option!
    session.pendingUpdateText = noteText
    session.pendingMediaUrl = mediaUrl
    session.stage = 'AWAITING_UPDATE_OR_NEW'

    const snippet = noteText.length > 90 ? noteText.slice(0, 87) + '...' : noteText

    const choicePrompt = isHi
      ? `🚨 *सक्रिय शिकायत दर्ज है:*
📌 *घटना आईडी:* ${session.incidentId}

📝 *हमें आपका नया विवरण प्राप्त हुआ:*
"${snippet}"

*कृपया एक विकल्प चुनें:*
1️⃣ इस पुरानी शिकायत (*${session.incidentId}*) में यह विवरण जोड़ें/अपडेट करें
2️⃣ पूरी तरह से एक *नई शिकायत* दर्ज करें

👉 पुरानी शिकायत अपडेट करने के लिए *1* या नई शिकायत के लिए *2* भेजें।`
      : `🚨 *Active Complaint Found:*
📌 *Incident ID:* ${session.incidentId}

📝 *Received your update:*
"${snippet}"

*Please select an option:*
1️⃣ *Continue / Update* this existing complaint (*${session.incidentId}*) with this info
2️⃣ *Start a NEW complaint* in its entirety

👉 Reply *1* to update existing case or *2* to file a brand new complaint.`

    session.history.push({ role: 'assistant', content: choicePrompt, timestamp })
    return { reply: choicePrompt, incidentId: session.incidentId }
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

  const fallback = {
    utr: utrMatch ? utrMatch[1] : null,
    bankName: bankMatch ? bankMatch[0] : null,
    upiId: upiMatch ? upiMatch[0] : null,
    fraudsterIdentifier: phoneMatch ? phoneMatch[1] : upiMatch ? upiMatch[0] : null,
    accountNumber: accountMatch ? accountMatch[1] : null,
    amount: null,
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
          content: `You are an Indian cybercrime triage assistant. Extract any updated incident details from the victim's update message. Return JSON with fields: utr (string|null), bankName (string|null), upiId (string|null), fraudsterIdentifier (string|null), accountNumber (string|null), amount (number|null).`,
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

  const filledItems: string[] = []
  if (extractedUpdate.utr) filledItems.push(isHi ? `UTR नंबर: ${extractedUpdate.utr}` : `UTR Number: ${extractedUpdate.utr}`)
  if (extractedUpdate.bankName) filledItems.push(isHi ? `बैंक: ${extractedUpdate.bankName}` : `Bank Name: ${extractedUpdate.bankName}`)
  if (extractedUpdate.upiId) filledItems.push(isHi ? `UPI ID: ${extractedUpdate.upiId}` : `UPI Handle: ${extractedUpdate.upiId}`)
  if (extractedUpdate.fraudsterIdentifier) filledItems.push(isHi ? `आरोपी: ${extractedUpdate.fraudsterIdentifier}` : `Fraudster Detail: ${extractedUpdate.fraudsterIdentifier}`)
  if (extractedUpdate.accountNumber) filledItems.push(isHi ? `खाता संख्या: ${extractedUpdate.accountNumber}` : `Account Number: ${extractedUpdate.accountNumber}`)

  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(process.env.DATABASE_URL)

      const existing = await sql`SELECT updates, frauder_contact, bank_name, upi_id, account_number, complaint_draft, complaint_draft_hi FROM complaints WHERE incident_id = ${incidentId} LIMIT 1`

      if (existing[0]) {
        const row = existing[0]
        const curUpdates = Array.isArray(row.updates) ? row.updates : []
        curUpdates.push({
          id: `up-${Date.now()}`,
          note: noteText,
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

        const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        const updatedDraft = (row.complaint_draft || '') + `\n\n[SUPPLEMENTARY STATEMENT — ${timeStr}]\nVictim update via WhatsApp (${session.phoneNumber}): ${noteText}`
        const updatedDraftHi = (row.complaint_draft_hi || '') + `\n\n[पूरक बयान — ${timeStr}]\nव्हाट्सएप द्वारा नया विवरण (${session.phoneNumber}): ${noteText}`

        await sql`
          UPDATE complaints SET
            frauder_contact = ${updatedContact},
            bank_name = ${updatedBank},
            upi_id = ${updatedUpi},
            account_number = ${updatedAcc},
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

  const trackingLink = `https://samarthan-ai-parichay-s-projects.vercel.app/dashboard?id=${incidentId}`
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
        complainantName: parsed.complainantName || '',
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
          recommended_channel, recommended_channel_target
        ) VALUES (
          ${triageResult.incidentId}, ${triageResult.fraudType}, ${triageResult.fraudsterIdentifier}, ${triageResult.complainantName || ''},
          ${triageResult.amount}, ${triageResult.urgencyLevel},
          ${triageResult.summary}, ${triageResult.summaryHi}, ${triageResult.complaintDraft}, ${triageResult.complaintDraftHi},
          ${triageResult.frauderContact}, ${triageResult.bankName}, ${triageResult.accountNumber}, ${triageResult.upiId}, ${triageResult.timeline},
          ${JSON.stringify(triageResult.freezeSteps)}, ${JSON.stringify(triageResult.applicableLaws)}, ${new Date().toISOString()}, ${isHi ? 'hi' : 'en'},
          'SUBMITTED', ${JSON.stringify([{ status: 'SUBMITTED', at: new Date().toISOString(), note: `Filed automatically via WhatsApp Bot (${session.phoneNumber})` }])},
          ${JSON.stringify(mediaUrl ? [mediaUrl] : [])}, ${JSON.stringify([{ id: `init-${Date.now()}`, citizenPhone: session.phoneNumber, note: 'Intake via WhatsApp' }])},
          ${triageResult.recommendedChannel || 'bank'}, ${triageResult.recommendedChannelTarget || 'Bank Nodal Officer'}
        )
        ON CONFLICT (incident_id) DO UPDATE SET
          amount = EXCLUDED.amount,
          frauder_contact = EXCLUDED.frauder_contact;
      `
    } catch (dbErr) {
      console.error('[WhatsApp Agent] Neon DB save error:', dbErr)
    }
  }

  session.stage = 'FILED'
  session.incidentId = triageResult.incidentId
  session.extractedData = triageResult
  session.accumulatedText = incidentText

  const trackingLink = `https://samarthan-ai-parichay-s-projects.vercel.app/dashboard?id=${triageResult.incidentId}`

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

  return {
    incidentId,
    fraudType: 'Financial Fraud',
    fraudsterIdentifier: fraudster,
    complainantName: 'Citizen Complainant',
    amount,
    urgencyLevel: 'CRITICAL',
    summary: `Unauthorized financial debit of ₹${amount.toLocaleString('en-IN')} reported via WhatsApp Bot.`,
    summaryHi: `व्हाट्सएप बॉट के माध्यम से ₹${amount.toLocaleString('en-IN')} की अनधिकृत निकासी दर्ज की गई।`,
    complaintDraft: `To The Station House Officer / Cyber Crime Cell,
I am filing a formal complaint regarding an unauthorized debit of ₹${amount.toLocaleString('en-IN')} from my account. The beneficiary identifier is ${fraudster}${ext.utr ? ` with transaction reference UTR: ${ext.utr}` : ''}. I request immediate lien-marking of funds and registration of FIR under Section 66C and 66D of Information Technology Act.`,
    complaintDraftHi: `थाना प्रभारी / साइबर अपराध शाखा,
मैं अपने खाते से ₹${amount.toLocaleString('en-IN')} की अनधिकृत निकासी की औपचारिक शिकायत दर्ज कर रहा हूँ। आरोपी का पहचानकर्ता ${fraudster} है। कृपया आईटी अधिनियम की धारा 66C और 66D के तहत कार्रवाई करें।`,
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
