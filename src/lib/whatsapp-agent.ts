import OpenAI from 'openai'
import { generateId, TriageResult, FreezeStep, ApplicableLaw, IT_ACT_SECTIONS } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'

export type WhatsAppStage = 'SELECT_LANGUAGE' | 'AWAITING_INCIDENT' | 'FILED'

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

  const isResetCommand = /^(reset|\/reset|restart|\/restart|clear|new|start|\/start)$/i.test(trimmed)
  const isInitialGreeting = /^(hi|hello|hey|namaste|help|madad|pranam|hlo|hii|hi samarthan[a-z0-9\s,.]*)$/i.test(trimmed)
  const isWebsiteDefaultMsg = trimmed.toLowerCase().includes('i want to report a cybercrime incident')

  const sendGreeting = () => {
    session.stage = 'SELECT_LANGUAGE'
    session.history = []
    session.accumulatedText = ''
    session.incidentId = undefined
    session.extractedData = undefined

    const welcomeMsg = `👋 *Hi, I'm the Cyber Crime Helpline AI Assistant.*
Contact me 24x7 to report cyber fraud, online scams, or financial theft.

🌐 *Please select your language / कृपया भाषा चुनें:*
1️⃣ English
2️⃣ हिन्दी (Hindi)

👉 Reply *1* for English or *2* for Hindi.`

    session.history.push({ role: 'assistant', content: welcomeMsg, timestamp })
    return { reply: welcomeMsg }
  }

  // Handle explicit reset or greeting in any stage
  if (isResetCommand || isInitialGreeting || isWebsiteDefaultMsg) {
    return sendGreeting()
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

    // Check if user directly provided incident or sent a voice note without picking 1/2
    const ext = quickExtract(trimmed)
    const hasIncidentDetails = Boolean(voiceTranscript || ext.amount || ext.upi || ext.phone || trimmed.length > 40)

    if (!hasIncidentDetails) {
      // First time interaction or greeting
      return sendGreeting()
    }

    // Auto-detect language from their substantive text/voice note and proceed
    session.language = detectLanguage(voiceTranscript || trimmed) === 'hi' ? 'hi' : 'en'
    session.stage = 'AWAITING_INCIDENT'
  }

  // STAGE 3 (Post-Filed): If already filed and not a reset, record note
  if (session.stage === 'FILED') {
    const isHi = session.language === 'hi'
    const reply = isHi
      ? `✅ *अतिरिक्त जानकारी नोट कर ली गई।*
आपकी अतिरिक्त जानकारी घटना आईडी *${session.incidentId}* से जोड़ दी गई है।
📄 स्टेटस देखें: https://samarthan-ai-parichay-s-projects.vercel.app/dashboard?id=${session.incidentId}

(नई शिकायत शुरू करने के लिए *NEW* या *RESET* लिखें)`
      : `✅ *Additional Note Recorded.*
Your update has been appended to Incident ID *${session.incidentId}*.
📄 Track Status: https://samarthan-ai-parichay-s-projects.vercel.app/dashboard?id=${session.incidentId}

(To file a new report, reply *NEW* or *RESET*)`

    session.history.push({ role: 'assistant', content: reply, timestamp })
    return { reply }
  }

  // STAGE 2: AWAITING_INCIDENT -> Listen, extract, and draft complaint
  const isHi = session.language === 'hi'
  const textToAnalyze = voiceTranscript || userInput
  session.accumulatedText += (session.accumulatedText ? ' ' : '') + textToAnalyze
  const extracted = quickExtract(session.accumulatedText)

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
          { role: 'user', content: session.accumulatedText },
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
      triageResult = generateFallbackResult(session.accumulatedText, extracted)
    }
  } else {
    triageResult = generateFallbackResult(session.accumulatedText, extracted)
  }

  // Save to database if DATABASE_URL is configured
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
          'SUBMITTED', ${JSON.stringify([{ status: 'SUBMITTED', at: new Date().toISOString(), note: 'Filed automatically via WhatsApp Bot' }])},
          ${JSON.stringify(mediaUrl ? [mediaUrl] : [])}, ${JSON.stringify([])},
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
    ? `${voiceHeader}🚨 *शिकायत सफलतापूर्वक ड्राफ्ट की गई!*
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
${trackingLink}`
    : `${voiceHeader}🚨 *COMPLAINT DRAFTED SUCCESSFULLY!*
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
${trackingLink}`

  session.history.push({ role: 'assistant', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })

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
