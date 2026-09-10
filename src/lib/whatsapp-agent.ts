import OpenAI from 'openai'
import { generateId, TriageResult, FreezeStep, ApplicableLaw, IT_ACT_SECTIONS } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'
import { SupportedLanguage, LANGUAGE_MAP, SUPPORTED_LANGUAGES } from '@/lib/i18n/languages'
import {
  getWelcomeMessage,
  getLanguageSwitchedMessage,
  getStartNewComplaintPrompt,
  getActiveComplaintGreeting,
  getNoActiveComplaintFoundMsg,
  formatStatusReport,
  formatComplaintFiledReply,
  formatUpdateConfirmation,
} from '@/lib/whatsapp-templates'
import {
  normalizeIndicNumerals,
  extractMultilingualAmount,
  extractMultilingualComplainant,
  extractMultilingualOnBehalfOf,
  extractMultilingualFraudster,
  inferCategoryFromMultilingualText,
  getRegionalComplaintDraft,
  MULTILINGUAL_GREETINGS_OR_NAV_REGEX
} from '@/lib/i18n/multilingualRegex'

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://samarthan-ai-parichay-s-projects.vercel.app')
const APP_URL = (rawAppUrl.includes('samarthan-ai.vercel.app') ? 'https://samarthan-ai-parichay-s-projects.vercel.app' : rawAppUrl).replace(/\/$/, '')

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
  language: SupportedLanguage
  extractedData?: Partial<TriageResult>
  missingFields: string[]
  incidentId?: string
  lastActive: number
  pendingUpdateText?: string
  pendingMediaUrl?: string
  pendingVisionEvidence?: ExtractedVisionEvidence
  // Sticky flag: user asked for a brand-new complaint. Stays true across turns
  // (unlike the per-turn _skipDbRestore) until a new complaint is actually filed.
  // While true: skip DB auto-restore, skip the active-complaint update path,
  // and route every message to createAndSaveNewComplaint.
  forceNewComplaint?: boolean
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

export function detectLanguage(text: string): SupportedLanguage {
  const trimmed = text.trim()
  if (!trimmed) return 'en'

  // Script frequency counting for maximum robustness against stray numerals/characters
  const counts: Partial<Record<SupportedLanguage, number>> = {}
  const addCount = (lang: SupportedLanguage, n: number) => {
    counts[lang] = (counts[lang] || 0) + n
  }

  const bnMatches = trimmed.match(/[\u0980-\u09FF]/g)
  if (bnMatches) addCount('bn', bnMatches.length)

  const teMatches = trimmed.match(/[\u0C00-\u0C7F]/g)
  if (teMatches) addCount('te', teMatches.length)

  const taMatches = trimmed.match(/[\u0B80-\u0BFF]/g)
  if (taMatches) addCount('ta', taMatches.length)

  const guMatches = trimmed.match(/[\u0A80-\u0AFF]/g)
  if (guMatches) addCount('gu', guMatches.length)

  const urMatches = trimmed.match(/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/g)
  if (urMatches) addCount('ur', urMatches.length)

  const knMatches = trimmed.match(/[\u0C80-\u0CFF]/g)
  if (knMatches) addCount('kn', knMatches.length)

  const orMatches = trimmed.match(/[\u0B00-\u0B7F]/g)
  if (orMatches) addCount('or', orMatches.length)

  const mlMatches = trimmed.match(/[\u0D00-\u0D7F]/g)
  if (mlMatches) addCount('ml', mlMatches.length)

  const paMatches = trimmed.match(/[\u0A00-\u0A7F]/g)
  if (paMatches) addCount('pa', paMatches.length)

  const devMatches = trimmed.match(/[\u0900-\u097F]/g)
  if (devMatches) {
    const marathiMarkers = /(?:माझे|माझा|माझी|माझ्या|झाले|झाला|झाली|गेले|गेला|पैसे|तक्रार|खाते|खात्यातून|घोटाळा|पोलीस|आहे|नाही|नाहीत|केले|केला|होते|होता|फसवणूक|रुपये|रुपयांची|बँक|नोंदवा|करण्यात|खंडणी|मागणी|दिसत)/
    if (marathiMarkers.test(trimmed)) {
      addCount('mr', devMatches.length)
    } else {
      addCount('hi', devMatches.length)
    }
  }

  let topLang: SupportedLanguage | null = null
  let maxCount = 0
  for (const [l, count] of Object.entries(counts)) {
    if (count && count > maxCount) {
      maxCount = count
      topLang = l as SupportedLanguage
    }
  }

  if (topLang) return topLang

  // Romanized transliteration heuristics
  if (/\b(?:amar|amader|taka|hoyche|hoyechhe|geche|katlo|katse|thokano|bengali|bangla)\b/i.test(trimmed)) return 'bn'
  if (/\b(?:majhe|mazhe|pese|paise|jhale|gela|gele|fusavli|takraar|marathi)\b/i.test(trimmed)) return 'mr'
  if (/\b(?:naa|naku|dabbulu|poyayi|jarigindi|mosam|chudandi|telugu)\b/i.test(trimmed)) return 'te'
  if (/\b(?:ennoda|panam|pochu|yematram|kaasu|tamil)\b/i.test(trimmed)) return 'ta'
  if (/\b(?:maru|mara|paisa|thaya|chhe|khata|thagi|gujarati)\b/i.test(trimmed)) return 'gu'
  if (/\b(?:urdu)\b/i.test(trimmed)) return 'ur'
  if (/\b(?:nanna|hana|kaledu|hoyithu|mosam|kannada)\b/i.test(trimmed)) return 'kn'
  if (/\b(?:mora|tanka|katigala|odia|oriya)\b/i.test(trimmed)) return 'or'
  if (/\b(?:ente|panam|poyi|thattippu|malayalam)\b/i.test(trimmed)) return 'ml'
  if (/\b(?:mera|mere|paise|katte|kaddhe|punjabi)\b/i.test(trimmed) && /\b(?:punjabi|pind|gall)\b/i.test(trimmed)) return 'pa'
  if (/\b(?:mera|meri|gaya|gaye|paisa|paise|karo|bhai|sahab|khata|kat|gayi|dhokha|thagi|kya|hua|hain|maine|apne)\b/i.test(trimmed)) return 'hi'

  return 'en'
}

export function matchLanguageSwitch(trimmed: string): SupportedLanguage | null {
  const t = trimmed.trim().toLowerCase()

  // 1. Exact numeric picks (1 to 12)
  if (/^(?:1|1\.|1️⃣)$/.test(t)) return 'en'
  if (/^(?:2|2\.|2️⃣)$/.test(t)) return 'hi'
  if (/^(?:3|3\.|3️⃣)$/.test(t)) return 'bn'
  if (/^(?:4|4\.|4️⃣)$/.test(t)) return 'mr'
  if (/^(?:5|5\.|5️⃣)$/.test(t)) return 'te'
  if (/^(?:6|6\.|6️⃣)$/.test(t)) return 'ta'
  if (/^(?:7|7\.|7️⃣)$/.test(t)) return 'gu'
  if (/^(?:8|8\.|8️⃣)$/.test(t)) return 'ur'
  if (/^(?:9|9\.|9️⃣)$/.test(t)) return 'kn'
  if (/^(?:10|10\.|🔟|1️⃣0️⃣)$/.test(t)) return 'or'
  if (/^(?:11|11\.|1️⃣1️⃣)$/.test(t)) return 'ml'
  if (/^(?:12|12\.|1️⃣2️⃣)$/.test(t)) return 'pa'

  // 2. Language name keywords / scripts
  if (/^(?:en|english|angrezi|angreji)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:talk|speak|converse|reply|chat)\s*(?:in\s+)?(?:english|angrezi)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?english/i.test(t)) {
    return 'en'
  }

  if (/^(?:hi|hindi|हिंदी|हिन्दी)(?:\s+(?:please|plz|bhasha|language))?$/i.test(t) ||
      /(?:hindi|हिन्दी|हिंदी)\s*(?:mai|me|mein|pe)?\s*(?:baat|bat|bolo|bol|batao|karo|kijiye|help|support|me)/i.test(t) ||
      /(?:talk|speak|converse|reply|chat)\s*(?:in\s+)?(?:hindi|हिन्दी|हिंदी)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:hindi|हिंदी|हिन्दी)/i.test(t)) {
    return 'hi'
  }

  if (/^(?:bn|bengali|bangla|বাংলা)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:bangla|bengali|বাংলা)\s*(?:te|e)?\s*(?:kotha|bolo|bolun|bat|baat|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:bangla|bengali|বাংলা)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:bangla|bengali|বাংলা)/i.test(t)) {
    return 'bn'
  }

  if (/^(?:mr|marathi|मराठी)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:marathi|मराठी)\s*(?:madhe|mdhe)?\s*(?:bola|baat|bol|bolave|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:marathi|मराठी)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:marathi|मराठी)/i.test(t)) {
    return 'mr'
  }

  if (/^(?:te|telugu|తెలుగు)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:telugu|తెలుగు)\s*(?:lo)?\s*(?:matladu|matladandi|cheppandi|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:telugu|తెలుగు)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:telugu|తెలుగు)/i.test(t)) {
    return 'te'
  }

  if (/^(?:ta|tamil|தமிழ்)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:tamil|தமிழ்)\s*(?:il|la)?\s*(?:pesu|pesunga|sollunga|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:tamil|தமிழ்)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:tamil|தமிழ்)/i.test(t)) {
    return 'ta'
  }

  if (/^(?:gu|gujarati|ગુજરાતી)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:gujarati|ગુજરાતી)\s*(?:ma)?\s*(?:vaat|bolo|karo|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:gujarati|ગુજરાતી)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:gujarati|ગુજરાતી)/i.test(t)) {
    return 'gu'
  }

  if (/^(?:ur|urdu|اردو)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:urdu|اردو)\s*(?:mein|me)?\s*(?:baat|karo|bataiye|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:urdu|اردو)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:urdu|اردو)/i.test(t)) {
    return 'ur'
  }

  if (/^(?:kn|kannada|ಕನ್ನಡ)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:kannada|ಕನ್ನಡ)\s*(?:alli)?\s*(?:mathadi|heli|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:kannada|ಕನ್ನಡ)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:kannada|ಕನ್ನಡ)/i.test(t)) {
    return 'kn'
  }

  if (/^(?:or|odia|oriya|ଓଡ଼ିଆ)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:odia|oriya|ଓଡ଼ିଆ)\s*(?:re)?\s*(?:katha|kuha|barta|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:odia|oriya|ଓଡ଼ିଆ)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:odia|ଓଡ଼ିଆ)/i.test(t)) {
    return 'or'
  }

  if (/^(?:ml|malayalam|മലയാളം)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:malayalam|മലയാളം)\s*(?:il)?\s*(?:samsarikkuka|parayoo|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:malayalam|മലയാളം)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:malayalam|മലയാളം)/i.test(t)) {
    return 'ml'
  }

  if (/^(?:pa|punjabi|ਪੰਜਾਬੀ)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:punjabi|ਪੰਜਾਬੀ)\s*(?:ch|vich)?\s*(?:gall|karo|help)/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:punjabi|ਪੰਜਾਬੀ)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:punjabi|ਪੰਜਾਬੀ)/i.test(t)) {
    return 'pa'
  }

  return null
}

// Fast heuristic to extract UTR, amount, and handles from free text
export function quickExtract(text: string) {
  const normText = normalizeIndicNumerals(text)
  const multilingualAmount = extractMultilingualAmount(normText)
  const amountMatch = normText.match(/(?:rs\.?|inr|₹|amount|rupees|rupaye)?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\s*(?:rs|rupees|inr|hazar|k|lakh))?/i)
  const utrMatch = normText.match(/(?:utr|ref|reference|txn|transaction|imps|neft|upi\s*ref)[\s:#-]*([0-9]{12})/i)
  const phoneMatch = normText.match(/(?:(?:\+?91)?[ -]?)?([6-9]\d{9})/i)
  const upiMatch = normText.match(/[\w.-]+@[\w.-]+/i)
  const detectedFraudster = extractMultilingualFraudster(text)

  return {
    amount: multilingualAmount ?? (amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : undefined),
    utr: utrMatch ? utrMatch[1] : undefined,
    phone: phoneMatch ? phoneMatch[1] : undefined,
    upi: upiMatch ? upiMatch[0] : undefined,
    fraudster: detectedFraudster !== 'Not Identified' ? detectedFraudster : undefined,
  }
}

export function isDetailedIncidentPrompt(text: string, voiceTranscript?: string): boolean {
  const full = (voiceTranscript || text).trim()
  if (!full) return false

  // Disqualify short navigation keywords, greetings, and system numbers across all 12 languages
  if (MULTILINGUAL_GREETINGS_OR_NAV_REGEX.test(full) || /^(status|track|reset|\/reset|restart|clear|hi|hello|hey|namaste|help|madad|pranam|hlo|hii|yes|no|[1-9]|1[0-2]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣)$/i.test(full)) {
    return false
  }

  // Disqualify language switch requests unless accompanied by financial crime details
  if (matchLanguageSwitch(full)) {
    const ext = quickExtract(full)
    if (!ext.amount && !ext.utr && !ext.upi && full.length < 70) {
      return false
    }
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

      if (!complaint && session.phoneNumber && !session.phoneNumber.startsWith('sim')) {
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
    const noCaseMsg = getNoActiveComplaintFoundMsg(session.language, session.phoneNumber)
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
  const statusCard = formatStatusReport(session.language, complaint, curStatus, emoji, latestUpdate, trackingLink)

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
  // SKIP this if the session was explicitly reset (user said NEW) — the _skipDbRestore flag is set by the API route
  // ALSO skip while the sticky forceNewComplaint flag is set — otherwise the very next
  // message after "NEW" would resurrect the old incident from the DB and update it.
  // ALSO skip for simulator sessions (sim-*) so simulations do NOT dredge up historical test cases.
  const isSimSession = session.phoneNumber.startsWith('sim') || (session as any).isSimulator
  if (!session.incidentId && !session.forceNewComplaint && !isSimSession && process.env.DATABASE_URL && !(session as any)._skipDbRestore) {
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
  // Clear the skip flag after this turn so future turns can auto-restore if needed
  delete (session as any)._skipDbRestore

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
      if (!session.forceNewComplaint && (session.stage === 'FILED' || session.incidentId)) {
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
  const isWebsiteDefaultMsg =
    trimmed.toLowerCase().includes('i want to report a cybercrime incident') ||
    trimmed.toLowerCase().includes('i want to report a cyber incident') ||
    trimmed.includes('साइबर अपराध घटना की रिपोर्ट') ||
    trimmed.includes('साइबर धोखाधड़ी की रिपोर्ट') ||
    /^(hi samarthan|hello samarthan|namaste samarthan)/i.test(trimmed)

  const sendLanguageGreeting = () => {
    session.stage = 'SELECT_LANGUAGE'
    session.history = []
    session.accumulatedText = ''
    session.incidentId = undefined
    session.extractedData = undefined
    session.pendingUpdateText = undefined
    session.pendingMediaUrl = undefined
    session.forceNewComplaint = false

    const welcomeMsg = getWelcomeMessage()
    session.history.push({ role: 'assistant', content: welcomeMsg, timestamp })
    return { reply: welcomeMsg }
  }

  // Hard reset or fresh website link click -> Always reset to brand new greeting
  if (isResetCommand || isWebsiteDefaultMsg) {
    return sendLanguageGreeting()
  }

  // 12-Language Switch Intent (covers numbers 1-12 and all native scripts/names)
  const switchedLang = matchLanguageSwitch(trimmed)
  if (switchedLang) {
    session.language = switchedLang
    if (session.stage === 'SELECT_LANGUAGE') {
      session.stage = 'AWAITING_INCIDENT'
    }

    const ext = quickExtract(trimmed)
    const isBareLangPick = /^(?:[1-9]|1[0-2]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣|en|english|angrezi|angreji|hi|hindi|हिंदी|हिन्दी|bn|bengali|bangla|বাংলা|mr|marathi|मराठी|te|telugu|తెలుగు|ta|tamil|தமிழ்|gu|gujarati|ગુજરાતી|ur|urdu|اردو|kn|kannada|ಕನ್ನಡ|or|odia|oriya|ଓଡ଼ିଆ|ml|malayalam|മലയാളം|pa|punjabi|ਪੰਜਾਬੀ|hinglish)$/i.test(trimmed)
    const hasRealAmount = Boolean(ext.amount && (ext.amount >= 100 || /(?:rs\.?|inr|₹|rupees|rupaye|taka|paisa|paise|dabbulu|panam)/i.test(trimmed)))
    const hasIncidentDetails = !isBareLangPick && Boolean(
      voiceTranscript || hasRealAmount || ext.upi || ext.phone || ext.utr || trimmed.length > 55
    )
    if (hasIncidentDetails) {
      session.stage = 'AWAITING_INCIDENT'
      session.accumulatedText = (voiceTranscript || trimmed).trim()
      return await createAndSaveNewComplaint(session, session.accumulatedText, mediaUrl, voiceTranscript)
    }

    const reply = getLanguageSwitchedMessage(switchedLang, !session.forceNewComplaint ? session.incidentId : undefined)
    session.history.push({ role: 'assistant', content: reply, timestamp })
    return { reply, incidentId: session.incidentId }
  }

  // ACTIVE COMPLAINT FLOW:
  // When citizen ALREADY has an active complaint on file, any message sent should automatically
  // update their existing complaint (unless they ask for status, greeting, or explicit new complaint).
  // Suppressed entirely while forceNewComplaint is set — the user is mid-way through filing a fresh case.
  if (!session.forceNewComplaint && session.incidentId && (session.stage === 'FILED' || session.stage === 'AWAITING_UPDATE_OR_NEW')) {
    const noteText = (voiceTranscript || userInput).trim()

    // 1. Greeting with active case
    if (isInitialGreeting || isWebsiteDefaultMsg) {
      session.stage = 'FILED'
      const greetingActiveCase = getActiveComplaintGreeting(session.language, session.incidentId)
      session.history.push({ role: 'assistant', content: greetingActiveCase, timestamp })
      return { reply: greetingActiveCase, incidentId: session.incidentId }
    }

    // 2. Explicit command to start a brand new complaint
    const isExplicitNew = /^(new|start new|file new|new complaint|fresh|naya|nai|नई|नया|नई शिकायत|নতুন|नवीन|కొత్త|புதிய|નવી|نیا|ಹೊಸ|ନୂତନ|പുതിയ|ਨਵੀਂ)$/i.test(noteText)
    if (isExplicitNew) {
      session.stage = 'AWAITING_INCIDENT'
      session.accumulatedText = ''
      session.incidentId = undefined
      session.extractedData = undefined
      session.pendingUpdateText = undefined
      session.pendingMediaUrl = undefined
      session.pendingVisionEvidence = undefined
      session.forceNewComplaint = true

      const promptMsg = getStartNewComplaintPrompt(session.language)
      session.history.push({ role: 'assistant', content: promptMsg, timestamp })
      return { reply: promptMsg }
    }

    // 3. ANY OTHER MESSAGE (UTR, Bank Name, narrative, voice note) -> AUTOMATICALLY READ & UPDATE ACTIVE COMPLAINT!
    return await updateExistingComplaint(session, session.incidentId, noteText)
  }

  // FORCED NEW COMPLAINT FLOW:
  // User said "NEW" (sticky flag set). We've already passed the status/greeting/reset guards
  // above. Any substantive message now = the narrative for the brand-new complaint.
  // Route straight to createAndSaveNewComplaint; the flag is cleared there on success.
  if (session.forceNewComplaint) {
    const newText = (voiceTranscript || trimmed).trim()
    const isJustNewCommand = /^(new|start new|file new|new complaint|fresh|naya|nai|नई|नया|नई शिकायत|নতুন|नवीन|కొత్త|புதிய|ਨਵੀ|نیا|ಹೊಸ|ନୂତନ|പുതിയ|ਨਵੀਂ)$/i.test(newText)
    const isNavToken = /^(?:[1-9]|1[0-2]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣|en|english|hi|hindi|bn|bengali|mr|marathi|te|telugu|ta|tamil|gu|gujarati|ur|urdu|kn|kannada|or|odia|ml|malayalam|pa|punjabi|yes|no|ok|okay|start|menu|hello|hey|namaste)$/i.test(newText)
    const ext = quickExtract(newText)
    const hasRealAmount = Boolean(ext.amount && (ext.amount >= 100 || /(?:rs\.?|inr|₹|rupees|rupaye|taka|paisa|paise)/i.test(newText)))
    const looksSubstantive = !isNavToken && Boolean(
      voiceTranscript || mediaUrl || imageBase64 ||
      (newText.length >= 25 && !isJustNewCommand) ||
      hasRealAmount || ext.upi || ext.phone || ext.utr
    )
    if (!looksSubstantive) {
      const askMsg = getStartNewComplaintPrompt(session.language)
      session.stage = 'AWAITING_INCIDENT'
      session.accumulatedText = ''
      session.history.push({ role: 'assistant', content: askMsg, timestamp })
      return { reply: askMsg }
    }
    session.language = detectLanguage(newText || voiceTranscript || '')
    session.stage = 'AWAITING_INCIDENT'
    const narrative = [session.accumulatedText, newText].filter(Boolean).join(' ').trim()
    session.accumulatedText = narrative
    return await createAndSaveNewComplaint(session, narrative || newText, mediaUrl, voiceTranscript)
  }

  // Direct Incident Prompt Handler (for users without an active complaint, or after starting fresh):
  // When a user pastes a substantive incident prompt directly, bypass all greeting menus,
  // language selection, and update choices, and immediately file the complaint!
  if (isDetailedIncidentPrompt(trimmed, voiceTranscript)) {
    const fullIncidentText = (voiceTranscript || trimmed).trim()
    console.log(`\n⚡ [WhatsApp Agent] DIRECT INCIDENT PROMPT DETECTED from +${session.phoneNumber}!`)
    console.log(`[WhatsApp Agent] Skipping intermediate menus and filing complaint directly...`)

    session.language = detectLanguage(fullIncidentText)
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
    const ext = quickExtract(trimmed)
    const isBareLangPick = /^(?:[1-9]|1[0-2]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣|en|english|hi|hindi|bn|bengali|mr|marathi|te|telugu|ta|tamil|gu|gujarati|ur|urdu|kn|kannada|or|odia|ml|malayalam|pa|punjabi)$/i.test(trimmed)
    const hasIncidentDetails = !isBareLangPick && Boolean(voiceTranscript || ext.amount || ext.upi || ext.phone || trimmed.length > 40)

    if (!hasIncidentDetails) {
      return sendLanguageGreeting()
    }

    session.language = detectLanguage(voiceTranscript || trimmed)
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
  let updateComplainantName: string | null = extractMultilingualComplainant(note)
  if (!updateComplainantName) {
    const explicitNameMatch = note.match(/(?:my name is|mera naam|naam hai)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
    if (explicitNameMatch && explicitNameMatch[1]) {
      const candidate = explicitNameMatch[1].trim()
      if (!/^(a|an|the|not|none|unknown)$/i.test(candidate)) {
        updateComplainantName = candidate
      }
    }
  }
  if (!updateComplainantName) {
    const iAmMatch = note.match(/(?:i am|main hoon|mai hoon)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
    if (iAmMatch && iAmMatch[1]) {
      const candidate = iAmMatch[1].trim()
      const isVerbOrGrammar = /\b(filing|writing|lodging|reporting|calling|facing|complaining|reaching|seeking|trying|unable|contacting|victim|scammed|cheated|looted|here|a|an|the|not|sorry|now|very)\b/i.test(candidate)
      if (!isVerbOrGrammar) {
        updateComplainantName = candidate
      }
    }
  }

  // Accused / fraudster correction regex: e.g. "his name is not amrit vijal its amruth vishal and he is from tapmi manipal"
  const fraudsterCorrectionMatch = note.match(/(?:his name is not|his name is|not [a-z0-9\s]+ (?:it's|its|it is)|correct name is|accused is|fraudster is)\s*([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?(?:\s+(?:from|at)\s+[A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)?)/i)
  const detectedFraudsterInNote = extractMultilingualFraudster(note)

  const fallback = {
    utr: utrMatch ? utrMatch[1] : null,
    bankName: bankMatch ? bankMatch[0] : null,
    upiId: upiMatch ? upiMatch[0] : null,
    fraudsterIdentifier: fraudsterCorrectionMatch ? fraudsterCorrectionMatch[1].trim() : (detectedFraudsterInNote !== 'Not Identified' ? detectedFraudsterInNote : (phoneMatch ? phoneMatch[1] : upiMatch ? upiMatch[0] : null)),
    accountNumber: accountMatch ? accountMatch[1] : null,
    amount: extractMultilingualAmount(note) ?? null,
    amountIsAdditional: false,
    complainantName: updateComplainantName,
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
          content: `You are an Indian cybercrime triage assistant. The user is providing an update or correction to an existing cybercrime complaint (e.g. correcting the accused fraudster's name like "his name is not X it's Y", providing a UTR, bank name, amount, UPI ID, account number, or complainant name). Extract all updated/corrected incident details.

For "amount": also decide "amountIsAdditional".
- true  → the user describes a NEW / SECOND / FURTHER debit or loss on top of what was already reported ("another 15000 was taken", "then 5000 more", "unhone phir 2000 kaat liye"). The value should be ADDED to the existing complaint total.
- false → the user is CORRECTING the previously stated amount ("the amount was actually 80000, not 60000", "sahi amount 50000 hai"). The value REPLACES the total.
If no amount is mentioned, amount = null and amountIsAdditional = false.

Return JSON: utr (string|null), bankName (string|null), upiId (string|null), fraudsterIdentifier (string|null), accountNumber (string|null), amount (number|null), amountIsAdditional (boolean), complainantName (string|null).`,
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
      amountIsAdditional: parsed.amountIsAdditional === true,
      complainantName: parsed.complainantName || fallback.complainantName,
    }
  } catch {
    return { ...fallback, amountIsAdditional: false }
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
  if (extractedUpdate.amount) {
    filledItems.push(
      extractedUpdate.amountIsAdditional
        ? (isHi ? `अतिरिक्त हानि जोड़ी गई: ₹${extractedUpdate.amount.toLocaleString('en-IN')}` : `Additional loss added: ₹${extractedUpdate.amount.toLocaleString('en-IN')}`)
        : (isHi ? `सुधारी गई राशि: ₹${extractedUpdate.amount.toLocaleString('en-IN')}` : `Corrected Amount: ₹${extractedUpdate.amount.toLocaleString('en-IN')}`)
    )
  }
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
        // A "second debit of 15000" ADDS to the running total; "the amount was
        // actually 80000" REPLACES it. If no amount in the note, keep as-is.
        const prevAmount = Number(row.amount) || 0
        const updatedAmount = extractedUpdate.amount
          ? (extractedUpdate.amountIsAdditional ? prevAmount + extractedUpdate.amount : extractedUpdate.amount)
          : prevAmount
        const updatedComplainant = extractedUpdate.complainantName || row.complainant_name || 'Anonymous Complainant'
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
  const reply = formatUpdateConfirmation(session.language, incidentId, filledItems, trackingLink)

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
  const langMeta = LANGUAGE_MAP[session.language] || LANGUAGE_MAP['en']
  const targetLangName = langMeta.name
  const targetNative = langMeta.nativeName
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
            content: `You are an Indian cybercrime triage officer. Return ONLY JSON matching TriageResult schema. Fields: fraudType (Financial Fraud, Women/Children Related Crime, Extortion & Blackmail, Identity Theft, E-Commerce Scams, Investment Scam, Other Cyber Crime), fraudsterIdentifier, complainantName, amount (number), bankName, accountNumber, upiId, timeline, summary (2 sentences in English), summaryHi (2 sentences in Hindi), summaryRegional (2 sentences in ${targetLangName} / ${targetNative}), complaintDraft (formal police complaint in English), complaintDraftHi (formal police complaint in Hindi), complaintDraftRegional (formal police complaint in ${targetLangName} / ${targetNative}), freezeSteps (string[]), applicableLaws (string[]), frauderContact, recommendedChannel ("bank"|"agency"|"platform"|"helpline"), recommendedChannelTarget.

COMPLAINANT: This report comes via WhatsApp. Only set "complainantName" to a real name if the person explicitly states their own name in the narrative ("my name is X", "mera naam X hai"). If filing on behalf of someone else (e.g. "on behalf of X"), X is the victim, NOT the complainant! Set complainantName to the filer's name (or "Anonymous Complainant" if unnamed), and open complaintDraft with "I am filing this complaint on behalf of X regarding...". Otherwise set it to "Anonymous Complainant", open complaintDraft with "I am filing this complaint regarding..." (never "I, Anonymous Complainant"), and leave the address/city as "[Address / city — to be provided]".`,
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

      const onBehalfOfTarget: string | null = extractMultilingualOnBehalfOf(incidentText)
      const selfIntroName: string | null = extractMultilingualComplainant(incidentText)

      const rawComplainant = (parsed.complainantName && typeof parsed.complainantName === 'string' && parsed.complainantName.trim()) || ''
      const isVictimName = Boolean(
        onBehalfOfTarget &&
        rawComplainant &&
        (rawComplainant.toLowerCase().includes(onBehalfOfTarget.toLowerCase()) || onBehalfOfTarget.toLowerCase().includes(rawComplainant.toLowerCase()))
      )

      const finalComplainant = selfIntroName || (!isVictimName && rawComplainant && !['not identified', 'not provided', 'unknown', 'n/a', 'none', 'anonymous complainant'].includes(rawComplainant.toLowerCase()) ? rawComplainant : 'Anonymous Complainant')

      if (onBehalfOfTarget) {
        if (parsed.complaintDraft && !/on behalf of/i.test(parsed.complaintDraft)) {
          parsed.complaintDraft = parsed.complaintDraft.replace(
            new RegExp(`I,\\s*(?:${finalComplainant})?,?\\s*(?:hereby state that|hereby lodge|am filing)?`, 'i'),
            `I, ${finalComplainant}, am filing this formal cybercrime complaint on behalf of ${onBehalfOfTarget} regarding`
          )
        }
        if (parsed.complaintDraftHi && !/की ओर से|के behalf/i.test(parsed.complaintDraftHi)) {
          parsed.complaintDraftHi = parsed.complaintDraftHi.replace(
            new RegExp(`मैं,\\s*(?:${finalComplainant})?,?\\s*`, 'i'),
            `मैं, ${finalComplainant}, ${onBehalfOfTarget} की ओर से यह `
          )
        }
      }

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
        summaryRegional: parsed.summaryRegional || (session.language === 'hi' ? parsed.summaryHi : undefined),
        complaintDraft: parsed.complaintDraft || `Formal complaint regarding unauthorized cyber fraud of ₹${extracted.amount || 0}.`,
        complaintDraftHi: parsed.complaintDraftHi || `अनधिकृत साइबर धोखाधड़ी की औपचारिक शिकायत।`,
        complaintDraftRegional: parsed.complaintDraftRegional || (session.language === 'hi' ? parsed.complaintDraftHi : undefined),
        language: session.language,
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
      triageResult = generateFallbackResult(incidentText, extracted, session.language)
    }
  } else {
    triageResult = generateFallbackResult(incidentText, extracted, session.language)
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
      const regionalSummaryToSave = triageResult.summaryRegional || triageResult.summaryHi
      const regionalDraftToSave = triageResult.complaintDraftRegional || triageResult.complaintDraftHi

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
          ${triageResult.summary}, ${regionalSummaryToSave}, ${triageResult.complaintDraft}, ${regionalDraftToSave},
          ${triageResult.frauderContact}, ${triageResult.bankName}, ${triageResult.accountNumber}, ${triageResult.upiId}, ${triageResult.timeline},
          ${JSON.stringify(triageResult.freezeSteps)}, ${JSON.stringify(triageResult.applicableLaws)}, ${new Date().toISOString()}, ${session.language},
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
  // New complaint is filed — the sticky "NEW" flag has done its job.
  session.forceNewComplaint = false

  const trackingLink = `${APP_URL}/dashboard?id=${triageResult.incidentId}`

  const lawsList = triageResult.applicableLaws
    .map((l: any) => (typeof l === 'string' ? l : (l.section || l.title || 'IT Act')))
    .join(', ')

  const reply = formatComplaintFiledReply(
    session.language,
    triageResult,
    lawsList,
    extracted.utr,
    trackingLink,
    voiceTranscript
  )

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  session.history.push({ role: 'assistant', content: reply, timestamp })

  return {
    reply,
    filedComplaint: triageResult,
    incidentId: triageResult.incidentId,
  }
}

function generateFallbackResult(text: string, ext: ReturnType<typeof quickExtract>, lang: SupportedLanguage = 'en'): TriageResult {
  const incidentId = generateId()
  const amount = ext.amount || extractMultilingualAmount(text) || 45000
  const detectedFraudster = extractMultilingualFraudster(text)
  const fraudster = detectedFraudster !== 'Not Identified' ? detectedFraudster : (ext.upi || ext.phone || 'Fraudulent Entity')

  const onBehalfOfTarget = extractMultilingualOnBehalfOf(text)
  const namedComplainant = extractMultilingualComplainant(text)
  const complainantName = namedComplainant || 'Anonymous Complainant'
  const detectedCategory = inferCategoryFromMultilingualText(text)
  const channelInfo = inferChannelFromFraudType(detectedCategory)

  const draftOpenerEn = onBehalfOfTarget
    ? `${namedComplainant ? `I, ${namedComplainant}, am` : 'I am'} filing this formal complaint on behalf of ${onBehalfOfTarget} regarding`
    : (namedComplainant ? `I, ${namedComplainant}, am filing a formal complaint regarding` : 'I am filing a formal complaint regarding')

  const draftOpenerHi = onBehalfOfTarget
    ? `${namedComplainant ? `मैं, ${namedComplainant},` : 'मैं'} ${onBehalfOfTarget} की ओर से यह औपचारिक शिकायत दर्ज करा रहा हूँ:`
    : (namedComplainant ? `मैं, ${namedComplainant}, अपने खाते से` : 'मैं अपने खाते से')

  const meta = LANGUAGE_MAP[lang] || LANGUAGE_MAP['en']

  let summaryRegional: string | undefined = undefined
  let complaintDraftRegional: string | undefined = undefined

  if (lang !== 'en' && lang !== 'hi') {
    summaryRegional = `${meta.nativeName}: ${detectedCategory} — ₹${amount.toLocaleString('en-IN')} WhatsApp AI Triage incident report.`
    complaintDraftRegional = getRegionalComplaintDraft(lang, complainantName, onBehalfOfTarget, detectedCategory, text || detectedCategory, amount)
  }

  return {
    incidentId,
    fraudType: detectedCategory,
    fraudsterIdentifier: fraudster,
    complainantName,
    amount,
    urgencyLevel: 'CRITICAL',
    summary: `${detectedCategory} involving ₹${amount.toLocaleString('en-IN')} reported via WhatsApp Bot.`,
    summaryHi: `व्हाट्सएप बॉट के माध्यम से ${detectedCategory} (₹${amount.toLocaleString('en-IN')}) दर्ज की गई।`,
    summaryRegional,
    complaintDraft: `To The Station House Officer / Cyber Crime Cell,
${draftOpenerEn} an unauthorized debit of ₹${amount.toLocaleString('en-IN')} from ${onBehalfOfTarget ? `${onBehalfOfTarget}'s account` : 'my account'}. The beneficiary identifier is ${fraudster}${ext.utr ? ` with transaction reference UTR: ${ext.utr}` : ''}. I request immediate lien-marking of funds and registration of FIR under Section 66C and 66D of Information Technology Act.${namedComplainant ? '' : '\n\n[Complainant address / city — to be provided]'}`,
    complaintDraftHi: `थाना प्रभारी / साइबर अपराध शाखा,
${draftOpenerHi} ₹${amount.toLocaleString('en-IN')} की अनधिकृत निकासी की औपचारिक शिकायत। आरोपी का पहचानकर्ता ${fraudster} है। कृपया आईटी अधिनियम की धारा 66C और 66D के तहत कार्रवाई करें।${namedComplainant ? '' : '\n\n[शिकायतकर्ता का पता / शहर — दिया जाना है]'}`,
    complaintDraftRegional,
    language: lang,
    frauderContact: ext.utr ? `Ref UTR: ${ext.utr}; Contact: ${ext.phone || 'Not Provided'}` : (ext.phone || 'Not Provided'),
    bankName: 'Bank Nodal Desk',
    accountNumber: 'Not Provided',
    upiId: ext.upi || 'Not Provided',
    timeline: new Date().toLocaleString(),
    freezeSteps: defaultFreezeSteps,
    applicableLaws: defaultLaws,
    recommendedChannel: channelInfo.channel,
    recommendedChannelTarget: channelInfo.target,
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
