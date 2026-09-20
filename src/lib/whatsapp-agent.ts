import OpenAI from 'openai'
import { generateId, TriageResult, FreezeStep, ApplicableLaw, IT_ACT_SECTIONS, RecommendedChannel } from '@/data/scenarios'
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
  extractMultilingualUTR,
  extractMultilingualBank,
  extractMultilingualAccount,
  extractMultilingualUPI,
  extractMultilingualIFSC,
  detectDigitalArrest,
  getDigitalArrestWarning,
  getApplicableBNSLaws,
  isAdditionalAmount,
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
  // Sticky flag: user asked for a brand-new complaint. It stays true across
  // turns until a new complaint is created in this session.
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

export function stripAddressPlaceholders(text: string | undefined): string {
  if (!text) return ''
  return text
    .replace(/\s*\[(?:Complainant\s+)?address\s*\/\s*city\s*[-–—]?\s*to be provided\]/gi, '')
    .replace(/\s*\[(?:शिकायतकर्ता का\s+)?पता\s*\/\s*शहर\s*[-–—]?\s*दिया जाना है\]/gi, '')
    .trim()
}

export function isNewIncidentNarrative(text: string, voiceTranscript?: string): boolean {
  const content = (voiceTranscript || text || '').trim()
  if (content.length < 20) return false

  // 1. Explicit complaint filing intent
  if (/\b(?:file (?:a )?new complaint|start (?:a )?new|report (?:a )?new|new cybercrime|report a fraud|new incident|fresh complaint)\b/i.test(content)) {
    return true
  }

  // 2. Personal introduction / complainant identification
  const hasIntro = /\b(?:my name is|i am|this is|mera naam|hamara naam|ente peru|naa peru|nanna hesaru|amar naam|meraa naam)\b/i.test(content)

  // 3. Incident occurrence / timeline opening
  const hasTimelineAnchor = /\b(?:two days ago|three days ago|four days ago|five days ago|few days ago|yesterday|last week|last month|on \d{1,2}(?:st|nd|rd|th)?|do din pehle|teen din pehle|char din pehle|kal |parso |recently|today morning|today afternoon)\b/i.test(content)

  // 4. Incident narrative triggers (describing what happened in a fresh scam)
  const hasScamNarrative = /\b(?:someone took|guy called|travel agent called|he took my|she took my|called and asked|posing as|pretending to be|fake website|booked a flight|pension money|deposited \d+|transferred \d+|lost a total of|cheated me of|fraudster stole|unauthorized debit of|money was debited|took all my)\b/i.test(content)

  if (hasIntro && (hasTimelineAnchor || hasScamNarrative || content.length > 50)) {
    return true
  }

  if (hasTimelineAnchor && (hasScamNarrative || content.length > 60)) {
    return true
  }

  if (hasScamNarrative && content.length > 70) {
    return true
  }

  return false
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
  if (bnMatches) {
    // Assamese shares this block with Bengali. Check its distinctive letters
    // and vocabulary before the generic Bengali fallback.
    const assameseMarkers = /[\u09F0\u09F1]|(?:অসম|মই|মোৰ|আছে|হয়|টকা|প্ৰ|চাইবাৰ)/
    if (assameseMarkers.test(trimmed)) addCount('as', bnMatches.length)
    else addCount('bn', bnMatches.length)
  }

  const teMatches = trimmed.match(/[\u0C00-\u0C7F]/g)
  if (teMatches) addCount('te', teMatches.length)

  const taMatches = trimmed.match(/[\u0B80-\u0BFF]/g)
  if (taMatches) addCount('ta', taMatches.length)

  const guMatches = trimmed.match(/[\u0A80-\u0AFF]/g)
  if (guMatches) addCount('gu', guMatches.length)

  // Urdu and Sindhi share Perso-Arabic script. Never label that script as Hindi.
  // We only classify it when distinctive vocabulary is present; ambiguous text stays neutral.
  const urMatches = trimmed.match(/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/g)
  if (urMatches) {
    const sindhiMarkers = /(?:آهي|آهيان|آهن|مان|منهنجو|منھنجو|سنڌي|سنڌ|پئسا|فراڊ|شڪايت|طرفان|لاءِ|ڪيو|ٿيو|وڊيو|ڊجيٽل)/
    const urduMarkers = /(?:اردو|ہے|ہیں|میں|میرا|میری|میرے|نہیں|شکایت|دھوکہ|فراڈ|پیسے|کرنا|ہوا|والد|کی جانب سے)/
    if (sindhiMarkers.test(trimmed) && !urduMarkers.test(trimmed)) {
      addCount('sd', urMatches.length)
    } else if (/^(?:ur|urdu|اردو)$/i.test(trimmed.trim()) || urduMarkers.test(trimmed)) {
      addCount('ur', urMatches.length)
    }
  }

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
    const hindiMarkers = /(?:मेरा|मेरी|मेरे|मुझे|मुझसे|हुआ|हुई|हुए|गया|गई|गए|है|हैं|था|थी|थे|नहीं|नही|शिकायत|धोखा|धोखाधड़ी|ठगी|खाता|खाते|पैसा|पैसे|रुपये|रुपया|निकाले|निकाल|कटा|कटे|कटी|आरोपी|बताओ|कीजिए)/
    const marathiMarkers = /(?:माझे|माझा|माझी|माझ्या|माझं|झाले|झाला|झाली|झालं|गेले|गेला|गेली|गेलं|आहे|आहेत|नाही|नाहीत|तक्रार|फसवणूक|खात्यातून|रुपयांची|नोंदवा|खंडणी|दिसत|करायचे|करायची|केली)/
    const nepaliMarkers = /(?:मेरो|मलाई|भयो|भएक|छु|छन्|गरे|रुपैयाँ|रकम|ठगी|उजुरी|प्रहरी|तर्फबाट|लागि|पैसा)/
    if (nepaliMarkers.test(trimmed) && !hindiMarkers.test(trimmed) && !marathiMarkers.test(trimmed)) {
      addCount('ne', devMatches.length)
    } else if (marathiMarkers.test(trimmed) && !hindiMarkers.test(trimmed)) {
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

  if (topLang) {
    // When Whisper transcribes spoken Malayalam or Telugu without explicit language hints,
    // it often defaults to Tamil script (\u0B80-\u0BFF) due to acoustic similarities.
    // Detect distinctive Malayalam/Telugu vocabulary rendered in Tamil glyphs:
    if (topLang === 'ta') {
      if (/(?:பேரு|ஆணு|மும்ப|஦ேஸம்|வய\s*ஸாய்ட்|வய\u0BECஸாய்ட்|மூனு|கம்ப்லைனே|கம்ப்லைன்|இந்ந)/i.test(trimmed)) {
        return 'ml'
      }
      if (/(?:நா பயரு|நீ நூ|ஒக|வேல்ல்தே|அக்கண்ணுச்ச|குண்\a*ண்காண)/i.test(trimmed)) {
        return 'te'
      }
    }
    return topLang
  }

  // Romanized transliteration heuristics for code-switched text
  if (/\b(?:maru naam|maru name|chhe|lidhu|lidha|thaya|karyu|mate|mathi|aavya|khata|koi e|padavi|gujarati)\b/i.test(trimmed)) return 'gu'
  if (/\b(?:nanna hesaru|nanna name|nanna|hesaru|kottu|thagond|madidare|madi|antha|bedirisi|madisidare|aamele|hana|kaledu|hoyithu|kannada)\b/i.test(trimmed)) return 'kn'
  if (/\b(?:ente peru|ente name|ente|njan|njaan|enikku|eniku|paisa|panam|poyi|nashtapettu|nashtamayi|ayachu|thattippu|thattipp|vilichu|paranju|accountil|bankil|chathichu|kallan|parathi|shikayath|ninnu|cheythu|cheyyan|undennu|eduthu|malayalam)\b/i.test(trimmed)) return 'ml'
  if (/\b(?:na peru|naa peru|dabbulu|poyayi|jarigindi|chudandi|chesaru|cheyinchukunnaru|ichi|pettincharu|chesindi|unnaru|vyakthi|naku|telugu)\b/i.test(trimmed)) return 'te'
  if (/\b(?:en peyar|en peyer|ennoda|panam|pochu|yematram|kaasu|pannala|panniduvaanga|thiruditaanga|solli|vandhuchu|pannitan|pannaanga|tamil)\b/i.test(trimmed)) return 'ta'
  if (/\b(?:mora nama|mora na|mora|tanka|katigala|karichanti|kariba|karuchi|threat dei|odia|oriya)\b/i.test(trimmed)) return 'or'
  if (/\b(?:moi|mor naam|moiu|ase|asil|korisu|hoise|hoisil|toka|poisa|thog|probonchona|assamese|axomiya)\b/i.test(trimmed)) return 'as'
  if (/\b(?:amar name|amar naam|amar|amader|ekta|kore|korche|hoyechhe|hoyeche|geche|katlo|katse|thokano|niyechhe|bengali|bangla)\b/i.test(trimmed)) return 'bn'
  if (/\b(?:da misuse|ton|kadheya|mang leya|de naa te|ban ke|laaye|pind|gall|ch paise|chite|kiti|punjabi)\b/i.test(trimmed)) return 'pa'
  if (/\b(?:majhe naav|mazhe naav|majhe|mazhe|ahe|aahe|kela|pathvun|maagat|ahet|sathi|chori|jhale|gela|gele|fusavli|takraar|karnyachya|marathi)\b/i.test(trimmed)) return 'mr'
  if (/\b(?:mero naam|ma|malai|bhayo|bhayeko|chha|chhu|gariyo|rupaiya|thagi|ujuri|prahari|nepali)\b/i.test(trimmed)) return 'ne'
  if (/\b(?:man|munhjo|munhji|aahe|aahiyan|sindhi|paesa|fraud|shikayat|tarafan|laai|kayo|thiyo)\b/i.test(trimmed)) return 'sd'
  if (/^(?:ur|urdu|اردو)$/i.test(trimmed.trim())) return 'ur'
  // Only trigger Hindi detection on words that are distinctly Hindi/Hindustani and would
  // NOT appear in a purely English sentence (exclude: name, my, fraud, account, bank, etc.)
  if (/\b(?:mera|meri|mere|mujhe|humne|humara|humari|kiya|diya|liya|huye|hua|hai|hain|tha|thi|paise|paisa|rupaye|rupay|karo|karein|karna|bhai|sahab|dhokha|thagi|maine|apne|karwaya|shukriya|janab|kyun|kaise|batao|bataiye|de do|kardo|gaya|gayi|gaye|shikayat|madad|chahiye|nahi|nhi|bolo|boliye|bataye)\b/i.test(trimmed)) return 'hi'

  return 'en'
}

export function matchLanguageSwitch(trimmed: string): SupportedLanguage | null {
  const t = trimmed.trim().toLowerCase()

  // 1. Exact numeric picks (1 to 15)
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
  if (/^(?:13|13\.|1️⃣3️⃣)$/.test(t)) return 'as'
  if (/^(?:14|14\.|1️⃣4️⃣)$/.test(t)) return 'ne'
  if (/^(?:15|15\.|1️⃣5️⃣)$/.test(t)) return 'sd'

  // 2. Language name keywords / scripts
  if (/^(?:en|english|angrezi|angreji)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:talk|speak|converse|reply|chat)\s*(?:in\s+)?(?:english|angrezi)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?english/i.test(t)) {
    return 'en'
  }

  if (/^(?:hindi|हिंदी|हिन्दी)(?:\s+(?:please|plz|bhasha|language))?$/i.test(t) ||
      /^(?:hi\s+(?:please|plz|bhasha|language))$/i.test(t) ||
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

  if (/^(?:as|assamese|axomiya|অসমীয়া)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:assamese|axomiya|অসমীয়া)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:assamese|axomiya|অসমীয়া)/i.test(t)) return 'as'

  if (/^(?:ne|nepali|नेपाली)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:nepali|नेपाली)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:nepali|नेपाली)/i.test(t)) return 'ne'

  if (/^(?:sd|sindhi|سنڌي|सिन्धी)(?:\s+(?:please|plz|language))?$/i.test(t) ||
      /(?:talk|speak|chat)\s*(?:in\s+)?(?:sindhi|سنڌي|सिन्धी)/i.test(t) ||
      /(?:change|switch|set)\s*(?:language\s*)?(?:to\s*)?(?:sindhi|سنڌي|सिन्धी)/i.test(t)) return 'sd'

  return null
}

// Fast heuristic to extract UTR, amount, and handles from free text
export function quickExtract(text: string) {
  const normText = normalizeIndicNumerals(text)
  const multilingualAmount = extractMultilingualAmount(normText)
  const amountMatch = normText.match(/(?:rs\.?|inr|₹|amount|rupees|rupaye)?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\s*(?:rs|rupees|inr|hazar|k|lakh))?/i)
  const utrRes = extractMultilingualUTR(text)
  const phoneMatch = normText.match(/(?:(?:\+?91)?[ -]?)?([6-9]\d{9})/i)
  const detectedUpi = extractMultilingualUPI(text)
  const upiMatch = normText.match(/[\w.-]+@[\w.-]+/i)
  const detectedFraudster = extractMultilingualFraudster(text)
  const bank = extractMultilingualBank(text)
  const account = extractMultilingualAccount(text)
  const ifsc = extractMultilingualIFSC(text)
  const isDigitalArrest = detectDigitalArrest(text)

  return {
    amount: multilingualAmount ?? (amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : undefined),
    utr: utrRes.utr || undefined,
    phone: phoneMatch ? phoneMatch[1] : undefined,
    upi: detectedUpi || (upiMatch ? upiMatch[0] : undefined),
    fraudster: detectedFraudster !== 'Not Identified' ? detectedFraudster : undefined,
    bankName: bank || undefined,
    accountNumber: account || undefined,
    ifscCode: ifsc || undefined,
    isDigitalArrest,
  }
}

// Robust extractor for Complaint Acknowledgement IDs, UTRs, and update command phrases
export function extractComplaintOrUtrNumber(text: string): { id: string | null; isExplicitUpdateCommand: boolean; updateNote: string } {
  const normalized = normalizeIndicNumerals(text.trim())

  let targetId: string | null = null
  let matchPos = -1
  let matchLen = 0

  // 1. INC-XXXX-XXXX
  const incMatch = normalized.match(/INC-\d{4}-\d{4}/i)
  if (incMatch && incMatch.index !== undefined) {
    targetId = incMatch[0].toUpperCase()
    matchPos = incMatch.index
    matchLen = incMatch[0].length
  }

  // 2. 14-digit numeric ID (Standard NCRP ID)
  if (!targetId) {
    const ncrpMatch = normalized.match(/(?:#|\b)(\d{14})\b/)
    if (ncrpMatch && ncrpMatch.index !== undefined) {
      targetId = ncrpMatch[1]
      matchPos = ncrpMatch.index
      matchLen = ncrpMatch[0].length
    }
  }

  // 3. 12-digit numeric ID (Standard UTR / Banking reference)
  if (!targetId) {
    const utrMatch = normalized.match(/(?:#|\b)(\d{12})\b/)
    if (utrMatch && utrMatch.index !== undefined) {
      targetId = utrMatch[1]
      matchPos = utrMatch.index
      matchLen = utrMatch[0].length
    }
  }

  // 4. Any #ID or 8-18 digit standalone number
  if (!targetId) {
    const looseMatch = normalized.match(/#(\d{6,18})\b/) || normalized.match(/\b(\d{8,18})\b/)
    if (looseMatch && looseMatch.index !== undefined) {
      targetId = looseMatch[1]
      matchPos = looseMatch.index
      matchLen = looseMatch[0].length
    }
  }

  if (!targetId) {
    return { id: null, isExplicitUpdateCommand: false, updateNote: '' }
  }

  // Extract the remaining text surrounding the ID as the updateNote / command
  const before = normalized.slice(0, matchPos).trim()
  const after = normalized.slice(matchPos + matchLen).trim()
  const combinedRemains = `${before} ${after}`.trim()

  // Clean out common inquiry / command prefixes/suffixes to find true update content
  const cleanedNote = combinedRemains
    .replace(/^(?:please\s+|can\s+you\s+)?(?:give\s+(?:me\s+)?(?:an\s+)?|check\s+(?:the\s+)?|tell\s+me\s+(?:about\s+)?|show\s+(?:me\s+)?(?:the\s+)?|get\s+)?(?:status|update|updates|track|tracking|progress|details)\s*(?:of|on|for|regarding|about|का|की)?\s*/gi, '')
    .replace(/^(?:कृपया\s+)?(?:स्टेटस|अपडेट|स्थिति|प्रगति|विवरण|जांच)\s*(?:का|की|के)?\s*/gi, '')
    .replace(/^(?:case|incident|complaint|shikayat|तक्रार|केस|शिकायत|no\.?|number|id|#)\s*[:#-]*\s*/gi, '')
    .replace(/(?:का|की|के)\s*(?:स्टेटस|अपडेट|स्थिति|प्रगति|विवरण)\s*(?:बताओ|दीजिए|दें|क्या\s*है)?$/gi, '')
    .replace(/(?:kya\s*(?:hua|update|status)|status\s*kya\s*hai|batao|please|plz)$/gi, '')
    .replace(/^[\s,;:-]+|[\s,;:-]+$/g, '')
    .trim()

  const isExplicitUpdate = /(?:update|status|track|अपडेट|स्थिति|प्रगति|स्टेटस)/i.test(normalized)

  return {
    id: targetId,
    isExplicitUpdateCommand: isExplicitUpdate,
    updateNote: cleanedNote
  }
}

export function isDetailedIncidentPrompt(text: string, voiceTranscript?: string): boolean {
  const full = (voiceTranscript || text).trim()
  if (!full) return false

  // Disqualify short navigation keywords, greetings, and system numbers across all 15 languages
  if (MULTILINGUAL_GREETINGS_OR_NAV_REGEX.test(full) || /^(status|track|reset|\/reset|restart|clear|hi|hello|hey|namaste|help|madad|pranam|hlo|hii|yes|no|[1-9]|1[0-5]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣|1️⃣3️⃣|1️⃣4️⃣|1️⃣5️⃣)$/i.test(full)) {
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
  query: string,
  preloadedComplaint?: any
): Promise<{ reply: string; incidentId?: string }> {
  // Multilingual query language alignment: only for simulator; WhatsApp is strictly English
  const queryLang = detectLanguage(query)
  const hasEnglishWords = /\b(?:status|update|case|complaint|check|tell|give|incident|track|progress|report)\b/i.test(query)
  if ((session as any).isSimulator) {
    if (queryLang && queryLang !== 'en') {
      session.language = queryLang
    } else if (hasEnglishWords && session.language !== 'en' && !(/[\u0900-\u0D7F\u0600-\u06FF]/.test(query))) {
      session.language = 'en'
    }
  } else {
    session.language = 'en'
  }

  // The public demo keeps a conversation in its current session only. It never
  // searches another person's report or phone number in a shared database.
  const complaint: any = preloadedComplaint || (session.extractedData ? {
    incident_id: session.extractedData.incidentId,
    language: session.language,
    status: 'SUBMITTED',
    updates: [],
    ...session.extractedData,
  } : null)

  if (!complaint) {
    const noCaseMsg = getNoActiveComplaintFoundMsg(session.language, session.phoneNumber)
    session.history.push({ role: 'assistant', content: noCaseMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    return { reply: noCaseMsg }
  }

  const id = complaint.incident_id
  session.incidentId = id
  session.stage = 'FILED'
  session.forceNewComplaint = false

  // Adopt complaint language if user sent bare number — but WhatsApp is strictly English
  if ((session as any).isSimulator && complaint.language && complaint.language in LANGUAGE_MAP && !(/[\u0900-\u0D7F\u0600-\u06FF]/.test(query)) && !hasEnglishWords) {
    session.language = complaint.language
  } else if (!(session as any).isSimulator) {
    session.language = 'en'
  }

  const statusEmojis: Record<string, string> = {
    DRAFT: '📝',
    SUBMITTED: '🟡',
    BANK_NOTIFIED: '🏦',
    PLATFORM_REPORTED: '📱',
    FIR_FILED: '🚔',
    UNDER_INVESTIGATION: '🔍',
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

  // On WhatsApp, language is strictly English per requirement. Only simulator allows multilingual UI switching.
  if (!(session as any).isSimulator) {
    session.language = 'en'
    if (session.stage === 'SELECT_LANGUAGE') {
      session.stage = 'AWAITING_INCIDENT'
    }
  } else {
    // Seamless Multilingual Detection for web simulator
    const rawInput = (voiceTranscript || userInput).trim()
    const detectedLang = detectLanguage(rawInput)
    const hasSubstantiveEnglish = /\b(?:the|is|are|was|were|my|on|for|at|to|from|in|update|status|check|please|give|tell|bank|police|complaint|incident|report|fraudster|stolen|lost|account|froze|frozen|money|loss)\b/i.test(rawInput)

    if (detectedLang && detectedLang !== 'en') {
      session.language = detectedLang
      if (session.stage === 'SELECT_LANGUAGE') {
        session.stage = 'AWAITING_INCIDENT'
      }
    } else if (hasSubstantiveEnglish && session.language !== 'en' && !(/[\u0900-\u0D7F\u0600-\u06FF]/.test(rawInput))) {
      session.language = 'en'
      if (session.stage === 'SELECT_LANGUAGE') {
        session.stage = 'AWAITING_INCIDENT'
      }
    }
  }

  // Clear the reset marker after this turn; session state is never restored
  // from a shared datastore.
  delete (session as any)._skipDbRestore

  // Extract Complaint Acknowledgement ID, UTR, or update command
  const idInfo = extractComplaintOrUtrNumber(trimmed)
  const matchedComplaint: any = session.extractedData && session.extractedData.incidentId === idInfo.id
    ? { incident_id: session.extractedData.incidentId, ...session.extractedData }
    : null

  // 1. Direct single-message update with ID: e.g. "update 20260311000001 bank froze account"
  const isPureInquiry = !idInfo.updateNote || /^(?:status|update|kya hua|kya update|batao|check|report|details|स्थिति|अपडेट)$/i.test(idInfo.updateNote)
  if (idInfo.id && matchedComplaint && !isPureInquiry && idInfo.updateNote.length >= 3) {
    return await updateExistingComplaint(session, matchedComplaint.incident_id, idInfo.updateNote)
  }

  // 2. Explicit ID status query or bare ID lookup: e.g. "update 20260311000001", "status 20260311000001", "20260311000001"
  if (idInfo.id && (idInfo.isExplicitUpdateCommand || isPureInquiry)) {
    return await handleStatusQuery(session, trimmed, matchedComplaint)
  }

  // 3. General Status / Progress query without explicit ID (e.g. "what is my case status", "meri complaint ka kya hua")
  const hasUpdateOrStatusWord = /(?:\b(?:status|update|updates|track|tracking|progress|check|report)\b|(?:kya hua|kya update|update kya|batao|स्थिति|स्टेटस|प्रगति|क्या हुआ|अपडेट))/i.test(trimmed)
  const hasFilingIndicators = Boolean(
    /(?:debited|lost|transferred|stolen|cheated|looted|fraudster|threat|blackmail|scam|gaye|kaat|liye)\b/i.test(trimmed) &&
    /\d{3,}/.test(trimmed)
  )

  const isStatusQuery = Boolean(
    hasUpdateOrStatusWord && (
      Boolean(session.incidentId) ||
      (trimmed.length <= 45 && !hasFilingIndicators) ||
      /(?:case|complaint|incident|shikayat|तक्रार|केस|शिकायत|mera|meri|my)/i.test(trimmed) ||
      /^(?:what(?:'s|\s+is)?\s+(?:the\s+)?(?:status|update)|give\s+(?:me\s+)?(?:an\s+)?update|any\s+update|tell\s+me\s+(?:the\s+)?(?:status|update)|check\s+(?:the\s+)?(?:status|update)|can\s+you\s+(?:give|check|tell)\s+(?:me\s+)?(?:the\s+)?update)/i.test(trimmed) ||
      /(?:update|status)\s+(?:on|for|of|regarding|about)\s+/i.test(trimmed) ||
      /(?:का|की)\s*(?:स्थिति|अपडेट|स्टेटस)/i.test(trimmed)
    )
  )

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
        // WhatsApp is strictly English — only detect language for the simulator
        session.language = (session as any).isSimulator
          ? (detectLanguage(trimmed || visionEvidence.summary) === 'hi' ? 'hi' : 'en')
          : 'en'
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
  const isInitialGreeting = /^(?:hi|hello|hey|namaste|help|madad|pranam|hlo|hii|hiya|good\s*(?:morning|afternoon|evening)|hi samarthan|hello samarthan|namaste samarthan)[\s!.,?]*$/i.test(trimmed)
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

  // Hard reset, fresh website link click, or initial greeting without an active complaint
  // -> Always reset to brand new greeting with language selection
  if (isResetCommand || isWebsiteDefaultMsg || (!session.incidentId && isInitialGreeting)) {
    return sendLanguageGreeting()
  }

  // Language switch intent is only enabled for the web simulator; WhatsApp is English-only.
  const switchedLang = (session as any).isSimulator ? matchLanguageSwitch(trimmed) : null
  if (switchedLang) {
    session.language = switchedLang
    if (session.stage === 'SELECT_LANGUAGE') {
      session.stage = 'AWAITING_INCIDENT'
    }

    const ext = quickExtract(trimmed)
    const isBareLangPick = /^(?:[1-9]|1[0-5]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣|1️⃣3️⃣|1️⃣4️⃣|1️⃣5️⃣|en|english|angrezi|angreji|hindi|हिंदी|हिन्दी|bn|bengali|bangla|বাংলা|mr|marathi|मराठी|te|telugu|తెలుగు|ta|tamil|தமிழ்|gu|gujarati|ગુજરાતી|ur|urdu|اردو|kn|kannada|ಕನ್ನಡ|or|odia|oriya|ଓଡ଼ିଆ|ml|malayalam|മലയാളം|pa|punjabi|ਪੰਜਾਬੀ|as|assamese|axomiya|অসমীয়া|ne|nepali|नेपाली|sd|sindhi|سنڌي|सिन्धी|hinglish)$/i.test(trimmed)
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
  // Suppressed entirely while forceNewComplaint is set - the user is mid-way through filing a fresh case.
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

    // 3. Check if citizen is reporting a fresh cybercrime incident narrative (not just an update)
    if (isNewIncidentNarrative(noteText, voiceTranscript)) {
      session.stage = 'AWAITING_INCIDENT'
      session.accumulatedText = noteText
      session.incidentId = undefined
      session.extractedData = undefined
      session.pendingUpdateText = undefined
      session.pendingMediaUrl = undefined
      session.pendingVisionEvidence = undefined
      session.forceNewComplaint = false
      return await createAndSaveNewComplaint(session, noteText, mediaUrl, voiceTranscript)
    }

    // 4. ANY OTHER MESSAGE (UTR, Bank Name, narrative, voice note) -> AUTOMATICALLY READ & UPDATE ACTIVE COMPLAINT!
    return await updateExistingComplaint(session, session.incidentId, noteText)
  }

  // FORCED NEW COMPLAINT FLOW:
  // User said "NEW" (sticky flag set). We've already passed the status/greeting/reset guards
  // above. Any substantive message now = the narrative for the brand-new complaint.
  // Route straight to createAndSaveNewComplaint; the flag is cleared there on success.
  if (session.forceNewComplaint) {
    const newText = (voiceTranscript || trimmed).trim()
    const isJustNewCommand = /^(new|start new|file new|new complaint|fresh|naya|nai|नई|नया|नई शिकायत|নতুন|नवीन|కొత్త|புதிய|ਨਵੀ|نیا|ಹೊಸ|ନୂତନ|പുതിയ|ਨਵੀਂ)$/i.test(newText)
    const isNavToken = /^(?:[1-9]|1[0-5]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣|1️⃣3️⃣|1️⃣4️⃣|1️⃣5️⃣|en|english|hi|hindi|bn|bengali|mr|marathi|te|telugu|ta|tamil|gu|gujarati|ur|urdu|kn|kannada|or|odia|ml|malayalam|pa|punjabi|as|assamese|ne|nepali|sd|sindhi|yes|no|ok|okay|start|menu|hello|hey|namaste)$/i.test(newText)
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
    // WhatsApp is strictly English — only detect language for the simulator
    session.language = (session as any).isSimulator ? detectLanguage(newText || voiceTranscript || '') : 'en'
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

    // WhatsApp is strictly English — only detect language for the simulator
    session.language = (session as any).isSimulator ? detectLanguage(fullIncidentText) : 'en'
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
    const isGreetingOrNav = isInitialGreeting || isWebsiteDefaultMsg || /^(?:menu|start|help|options)$/i.test(trimmed)
    if (isGreetingOrNav) {
      return sendLanguageGreeting()
    }

    // WhatsApp is strictly English — only detect language for the simulator
    session.language = (session as any).isSimulator ? detectLanguage(voiceTranscript || trimmed) : 'en'
    session.stage = 'AWAITING_INCIDENT'
  }

  // STAGE: AWAITING_INCIDENT -> First incident intake
  const initialText = (voiceTranscript || userInput).trim()
  session.accumulatedText += (session.accumulatedText ? ' ' : '') + initialText
  return await createAndSaveNewComplaint(session, session.accumulatedText, mediaUrl, voiceTranscript)
}

// Helper: Extract structured update fields using GPT-4o-mini
async function extractUpdateDetailsWithAI(note: string) {
  const normalized = normalizeIndicNumerals(note)
  const utrRes = extractMultilingualUTR(note)
  const bank = extractMultilingualBank(note)
  const account = extractMultilingualAccount(note)
  const isAdditional = isAdditionalAmount(note)
  const upiMatch = normalized.match(/[\w.-]+@[\w.-]+/)
  const phoneMatch = normalized.match(/(?:(?:\+?91)?[ -]?)?([6-9]\d{9})\b/)
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

  const fraudsterCorrectionMatch = note.match(/(?:his name is not|his name is|not [a-z0-9\s]+ (?:it's|its|it is)|correct name is|accused is|fraudster is)\s*([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?(?:\s+(?:from|at)\s+[A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)?)/i)
  const detectedFraudsterInNote = extractMultilingualFraudster(note)
  const detectedUpiInNote = extractMultilingualUPI(note)
  const detectedIfscInNote = extractMultilingualIFSC(note)

  const fallback = {
    utr: utrRes.utr,
    bankName: bank,
    upiId: detectedUpiInNote || (upiMatch ? upiMatch[0] : null),
    ifscCode: detectedIfscInNote,
    fraudsterIdentifier: fraudsterCorrectionMatch ? fraudsterCorrectionMatch[1].trim() : (detectedFraudsterInNote !== 'Not Identified' ? detectedFraudsterInNote : (phoneMatch ? phoneMatch[1] : detectedUpiInNote || (upiMatch ? upiMatch[0] : null))),
    accountNumber: account,
    amount: extractMultilingualAmount(note) || null,
    amountIsAdditional: isAdditional,
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
      amount: typeof parsed.amount === 'number' ? parsed.amount : fallback.amount,
      amountIsAdditional: typeof parsed.amountIsAdditional === 'boolean' ? parsed.amountIsAdditional : fallback.amountIsAdditional,
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
  const detectedNoteLang = detectLanguage(noteText)
  const hasEnglishWords = /\b(?:status|update|case|complaint|check|tell|give|incident|track|progress|report|account|bank|police|froze|frozen|money|amount|loss|cheated|stolen|scam)\b/i.test(noteText)
  // WhatsApp is strictly English — only detect language for the simulator
  if ((session as any).isSimulator) {
    if (detectedNoteLang && detectedNoteLang !== 'en') {
      session.language = detectedNoteLang
    } else if (hasEnglishWords && session.language !== 'en' && !(/[\u0900-\u0D7F\u0600-\u06FF]/.test(noteText))) {
      session.language = 'en'
    }
  } else {
    session.language = 'en'
  }
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

  const targetIncidentId = incidentId

  // Keep only the current chat's state in memory. Persisting a phone number,
  // financial data, or screenshot update requires real user authentication.
  if (session.extractedData?.incidentId === targetIncidentId) {
    if (extractedUpdate.amount) session.extractedData.amount = extractedUpdate.amount
    if (extractedUpdate.bankName) session.extractedData.bankName = extractedUpdate.bankName
    if (extractedUpdate.upiId) session.extractedData.upiId = extractedUpdate.upiId
    if (extractedUpdate.accountNumber) session.extractedData.accountNumber = extractedUpdate.accountNumber
    if (extractedUpdate.fraudsterIdentifier) session.extractedData.fraudsterIdentifier = extractedUpdate.fraudsterIdentifier
  }

  const trackingLink = `${APP_URL}/dashboard?id=${targetIncidentId}`
  const reply = formatUpdateConfirmation(session.language, targetIncidentId, filledItems, trackingLink)

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  session.history.push({ role: 'assistant', content: reply, timestamp })
  return { reply, incidentId: targetIncidentId }
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
            content: `You are an Indian cybercrime triage officer. Return ONLY JSON matching TriageResult schema. Fields: fraudType (Financial Fraud, Women/Children Related Crime, Extortion & Blackmail, Identity Theft, E-Commerce Scams, Investment Scam, Other Cyber Crime), fraudsterIdentifier, complainantName, amount (number), bankName, accountNumber, upiId, ifscCode, utrNumber, timeline, summary (2 sentences in English), summaryHi (2 sentences in Hindi), summaryRegional (2 sentences in ${targetLangName} / ${targetNative}), complaintDraft (formal police complaint in English), complaintDraftHi (formal police complaint in Hindi), complaintDraftRegional (formal police complaint in ${targetLangName} / ${targetNative}), freezeSteps (string[]), applicableLaws (string[]), frauderContact, recommendedChannel ("bank"|"agency"|"platform"|"helpline"), recommendedChannelTarget.

CRITICAL CLASSIFICATION & ROUTING RULES:
1. FINANCIAL FRAUD VS IDENTITY THEFT: If money was stolen, debited, or transferred from a bank/UPI/wallet, OR if the fraudster posed as a bank employee, asked for KYC details, OTP, PIN, password, or card numbers to take money, this is ALWAYS "Financial Fraud" (NEVER "Identity Theft")!
   - "Identity Theft" is ONLY for cases where NO money was stolen from the victim's own accounts (e.g. fake profile, forged PAN/Aadhaar used for loan in victim's name).
   - Whenever money was lost or debited (amount > 0 or UTR / UPI / bank mentioned), recommendedChannel MUST be "bank" and recommendedChannelTarget MUST be the victim's bank name (e.g. "HDFC Bank", "SBI") or "the bank".
2. MANDATORY BANKING DETAILS: If the user provides a 12-digit UPI UTR / transaction reference number, beneficiary UPI handle, or victim's bank name (e.g. HDFC Bank, SBI), extract them into "utrNumber", "upiId", and "bankName", and include them in "frauderContact".
3. COMPLAINANT: Whenever the person explicitly mentions their own name in the narrative / voice note / text (e.g. "my name is X", "mera naam X hai", "I am X", "ente peru X", etc.), ALWAYS extract that EXACT stated name into "complainantName"! Also reference the complainant by their stated name in "summary", "summaryHi", "summaryRegional" (e.g. "[Name] was defrauded of ₹..."), and in "complaintDraft" ("I, [Name], hereby lodge..."). If filing on behalf of someone else (e.g. "on behalf of X"), X is the victim, NOT the complainant! Only set "complainantName" to "Anonymous Complainant" if the filer states no name at all. Never include or append placeholders like "[Address / city - to be provided]".`,
          },
          { role: 'user', content: incidentText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      })

      const parsed = JSON.parse(completion.choices[0].message.content || '{}')
      const incidentId = generateId()
      let fraudType = (parsed.fraudType || 'Financial Fraud') as any

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
      } else if (finalComplainant !== 'Anonymous Complainant') {
        if (parsed.complaintDraft) {
          parsed.complaintDraft = parsed.complaintDraft.replace(
            /\bI,?\s*(?:Anonymous Complainant)?,?\s*(?:hereby state that|hereby lodge|am filing this complaint regarding|am filing)?/i,
            `I, ${finalComplainant}, hereby lodge this formal cybercrime complaint regarding`
          )
        }
        if (parsed.complaintDraftHi) {
          parsed.complaintDraftHi = parsed.complaintDraftHi.replace(
            /(^|[\s,।])मैं,?\s*(?:Anonymous Complainant)?,?\s*/,
            `$1मैं, ${finalComplainant}, `
          )
        }
      }

      const freezeSteps = Array.isArray(parsed.freezeSteps) && parsed.freezeSteps.length > 0 && typeof parsed.freezeSteps[0] === 'object'
        ? parsed.freezeSteps
        : defaultFreezeSteps

      const applicableLaws = Array.isArray(parsed.applicableLaws) && parsed.applicableLaws.length > 0 && typeof parsed.applicableLaws[0] === 'object'
        ? parsed.applicableLaws
        : defaultLaws

      const safeContacts: string[] = []
      if (parsed.frauderContact && !parsed.frauderContact.toLowerCase().includes('not provided')) {
        safeContacts.push(parsed.frauderContact)
      }
      if (extracted.phone && !safeContacts.some(c => c.includes(extracted.phone!))) {
        safeContacts.push(`Phone: ${extracted.phone}`)
      }
      if (extracted.upi && !safeContacts.some(c => c.includes(extracted.upi!))) {
        safeContacts.push(`UPI: ${extracted.upi}`)
      }
      const finalUtr = (parsed.utrNumber && !parsed.utrNumber.toLowerCase().includes('not provided'))
        ? parsed.utrNumber.trim()
        : (extracted.utr || undefined)
      if (finalUtr && !safeContacts.some(c => c.includes(finalUtr))) {
        safeContacts.push(`UTR: ${finalUtr}`)
      }
      const finalBank = (parsed.bankName && !parsed.bankName.toLowerCase().includes('not provided') && !parsed.bankName.toLowerCase().includes('bank nodal desk'))
        ? parsed.bankName
        : (extracted.bankName || 'Not Provided')
      const finalAccount = (parsed.accountNumber && !parsed.accountNumber.toLowerCase().includes('not provided'))
        ? parsed.accountNumber
        : (extracted.accountNumber || 'Not Provided')
      const finalIfsc = (parsed.ifscCode && !parsed.ifscCode.toLowerCase().includes('not provided'))
        ? parsed.ifscCode.trim().toUpperCase()
        : (extracted.ifscCode || undefined)
      const finalUpi = (parsed.upiId && !parsed.upiId.toLowerCase().includes('not provided'))
        ? parsed.upiId.trim()
        : (extracted.upi || undefined)

      const finalAmount = Number(parsed.amount) || extracted.amount || 0

      // Auto-correct: If money was stolen from a bank/UPI account or bank/UTR/UPI details are present,
      // it is unequivocally Financial Fraud requiring an immediate bank freeze (never UIDAI Aadhaar lock)!
      if (fraudType === 'Identity Theft' && (finalAmount > 0 || finalUtr || (finalBank && finalBank !== 'Not Provided') || finalUpi)) {
        fraudType = 'Financial Fraud'
      }

      const channelInfo = inferChannelFromFraudType(fraudType, finalAmount, finalBank, finalUtr)
      let resolvedChannel: RecommendedChannel = parsed.recommendedChannel || channelInfo.channel
      let resolvedTarget: string = parsed.recommendedChannelTarget || channelInfo.target

      if (finalAmount > 0 || finalUtr || (finalBank && finalBank !== 'Not Provided')) {
        resolvedChannel = 'bank'
        resolvedTarget = (finalBank && finalBank !== 'Not Provided') ? finalBank : 'the bank'
      }

      triageResult = {
        incidentId,
        fraudType,
        fraudsterIdentifier: parsed.fraudsterIdentifier || extracted.fraudster || extracted.upi || extracted.phone || 'Not Identified',
        complainantName: finalComplainant,
        amount: finalAmount,
        urgencyLevel: 'CRITICAL',
        summary: stripAddressPlaceholders(parsed.summary || 'Cyber fraud reported via WhatsApp triage bot.'),
        summaryHi: stripAddressPlaceholders(parsed.summaryHi || 'व्हाट्सएप ट्रायज बॉट के माध्यम से साइबर धोखाधड़ी दर्ज की गई।'),
        summaryRegional: stripAddressPlaceholders(parsed.summaryRegional || (session.language === 'hi' ? parsed.summaryHi : undefined)),
        complaintDraft: stripAddressPlaceholders(parsed.complaintDraft || `Formal complaint regarding unauthorized cyber fraud of ₹${extracted.amount || 0}.`),
        complaintDraftHi: stripAddressPlaceholders(parsed.complaintDraftHi || `अनधिकृत साइबर धोखाधड़ी की औपचारिक शिकायत।`),
        complaintDraftRegional: stripAddressPlaceholders(parsed.complaintDraftRegional || (session.language === 'hi' ? parsed.complaintDraftHi : undefined)),
        language: session.language,
        frauderContact: safeContacts.length > 0 ? safeContacts.join('; ') : 'Not Provided',
        bankName: finalBank,
        accountNumber: finalAccount,
        upiId: finalUpi,
        ifscCode: finalIfsc,
        utrNumber: finalUtr,
        timeline: new Date().toLocaleString(),
        freezeSteps,
        applicableLaws,
        recommendedChannel: resolvedChannel,
        recommendedChannelTarget: resolvedTarget,
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
    if (vision.utr) {
      triageResult.utrNumber = vision.utr
      if (!triageResult.frauderContact || triageResult.frauderContact.includes('Not Provided')) {
        triageResult.frauderContact = `UTR: ${vision.utr}`
      } else if (!triageResult.frauderContact.includes(vision.utr)) {
        triageResult.frauderContact = `${triageResult.frauderContact}; UTR: ${vision.utr}`
      }
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

  session.stage = 'FILED'
  session.incidentId = triageResult.incidentId
  session.extractedData = triageResult
  session.accumulatedText = incidentText
  // New complaint is filed - the sticky "NEW" flag has done its job.
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
  const channelInfo = inferChannelFromFraudType(detectedCategory, amount, ext.bankName, ext.utr)

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
    summaryRegional = `${meta.nativeName}: ${detectedCategory} - ₹${amount.toLocaleString('en-IN')} WhatsApp AI Triage incident report.`
    complaintDraftRegional = getRegionalComplaintDraft(lang, complainantName, onBehalfOfTarget, detectedCategory, text || detectedCategory, amount, ext.utr, ext.upi, ext.ifscCode)
  }

  const isDigitalArrest = Boolean(ext.isDigitalArrest)
  const digitalArrestAdvisory = isDigitalArrest ? getDigitalArrestWarning(lang) : undefined

  return {
    incidentId,
    fraudType: detectedCategory,
    fraudsterIdentifier: fraudster,
    complainantName,
    amount,
    urgencyLevel: 'CRITICAL',
    summary: `${detectedCategory} involving ₹${amount.toLocaleString('en-IN')} reported via WhatsApp Bot.${isDigitalArrest ? ' High-priority Digital Arrest scam detected.' : ''}`,
    summaryHi: `व्हाट्सएप बॉट के माध्यम से ${detectedCategory} (₹${amount.toLocaleString('en-IN')}) दर्ज की गई।${isDigitalArrest ? ' डिजिटल अरेस्ट जबरन वसूली का मामला पहचाना गया।' : ''}`,
    summaryRegional,
    complaintDraft: `To The Station House Officer / Cyber Crime Cell,
${draftOpenerEn} an unauthorized debit of ₹${amount.toLocaleString('en-IN')} from ${onBehalfOfTarget ? `${onBehalfOfTarget}'s account` : 'my account'}. The beneficiary identifier is ${fraudster}${ext.utr ? ` with transaction reference UTR: ${ext.utr}` : ''}${ext.upi ? `, UPI: ${ext.upi}` : ''}${ext.ifscCode ? `, IFSC: ${ext.ifscCode}` : ''}. I request immediate lien-marking of funds and registration of FIR under Section 66D of Information Technology Act and Section 318(4) of Bharatiya Nyaya Sanhita (BNS 2023).`,
    complaintDraftHi: `थाना प्रभारी / साइबर अपराध शाखा,
${draftOpenerHi} ₹${amount.toLocaleString('en-IN')} की अनधिकृत निकासी की औपचारिक शिकायत। आरोपी का पहचानकर्ता ${fraudster} है${ext.utr ? ` (यूटीआर: ${ext.utr})` : ''}${ext.upi ? ` (यूपीआई: ${ext.upi})` : ''}। कृपया आईटी अधिनियम की धारा 66D एवं भारतीय न्याय संहिता (BNS 2023) की धारा 318(4) के तहत कार्रवाई करें।`,
    complaintDraftRegional,
    language: lang,
    frauderContact: ext.utr ? `Ref UTR: ${ext.utr}${ext.upi ? `; UPI: ${ext.upi}` : ''}; Contact: ${ext.phone || 'Not Provided'}` : (ext.phone || (ext.upi ? `UPI: ${ext.upi}` : 'Not Provided')),
    bankName: ext.bankName || 'Bank Nodal Desk',
    accountNumber: ext.accountNumber || 'Not Provided',
    upiId: ext.upi || 'Not Provided',
    ifscCode: ext.ifscCode,
    utrNumber: ext.utr || undefined,
    isDigitalArrest: isDigitalArrest || undefined,
    digitalArrestAdvisory,
    timeline: new Date().toLocaleString(),
    freezeSteps: defaultFreezeSteps,
    applicableLaws: getApplicableBNSLaws(detectedCategory, isDigitalArrest, lang),
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
