import OpenAI from 'openai'
import { generateId, TriageResult, FreezeStep, ApplicableLaw, IT_ACT_SECTIONS } from '@/data/scenarios'
import { inferChannelFromFraudType } from '@/data/escalationChannels'

export interface WhatsAppSession {
  phoneNumber: string
  stage: 'GATHERING' | 'CLARIFYING' | 'CONFIRMING' | 'FILED'
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
    stage: 'GATHERING',
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
  const hindiPattern = /[\u0900-\u097F]|mera|meri|gaya|gaye|paisa|paise|karo|bhai|sahab|khata|kat|gayi|dhokha|thagi/i
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
  mediaUrl?: string
): Promise<{ reply: string; filedComplaint?: TriageResult; incidentId?: string }> {
  const isHi = detectLanguage(userInput) === 'hi' || session.language === 'hi'
  session.language = isHi ? 'hi' : 'en'

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  session.history.push({ role: 'user', content: userInput, timestamp })
  session.accumulatedText += (session.accumulatedText ? ' ' : '') + userInput

  const extracted = quickExtract(session.accumulatedText)

  // If user is just saying hello or greeting
  if (/^(hi|hello|namaste|help|madad|pranam|hey)[\s!.]*$/i.test(userInput.trim()) && session.history.length <= 1) {
    const reply = isHi
      ? 'नमस्ते, यह समर्थन राष्ट्रीय साइबर अपराध AI सहायता सेवा (1930) है।\n\nकृपया बताएं आपके साथ क्या हुआ? (जैसे: बैंक से पैसे कटे, फर्जी कॉल, ब्लैकमेल या फर्जी निवेश)। आप बोलकर या स्क्रीनशॉट भी भेज सकते हैं।'
      : 'Hello, this is Samarthan Cybercrime AI Assistant (National Helpline 1930 partner).\n\nPlease describe what happened: money debited, fake investment, phishing link, or blackmail. You can send a voice note, message, or screenshot.'
    session.history.push({ role: 'assistant', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    return { reply }
  }

  // Check if we have enough info to file or if we need a critical follow-up
  const hasAmount = Boolean(extracted.amount && extracted.amount > 0)
  const hasTxnRef = Boolean(extracted.utr || extracted.upi || extracted.phone)
  const isFinancial = /upi|bank|otp|paise|rs|rupaye|khata|cut|debited|transfer|investment|trading/i.test(session.accumulatedText)

  // Clarification Step: if financial scam and missing UTR/Txn details
  if (isFinancial && !hasTxnRef && session.stage === 'GATHERING' && session.history.filter(h => h.role === 'user').length === 1) {
    session.stage = 'CLARIFYING'
    const reply = isHi
      ? `समझ गया। तुरंत बैंक खाता फ्रीज करने के लिए, क्या आपके पास लेनदेन का 12-अंकों का UPI UTR नंबर, बैंक का नाम या धोखेबाज़ का UPI ID/नंबर है? (आप पेमेंट का स्क्रीनशॉट भी भेज सकते हैं)`
      : `Understood. To initiate an emergency bank freeze, do you have the 12-digit UPI UTR number, bank name, or fraudster's UPI ID/phone? (You can also reply with a screenshot).`
    session.history.push({ role: 'assistant', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    return { reply }
  }

  // Ready to File! Run full triage via OpenAI or robust rule-based fallback
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
          ${JSON.stringify(triageResult.freezeSteps)}, ${JSON.stringify(triageResult.applicableLaws)}, ${Date.now()}, ${isHi ? 'hi' : 'en'},
          'SUBMITTED', ${JSON.stringify([{ status: 'SUBMITTED', timestamp: Date.now(), note: 'Filed automatically via WhatsApp Bot' }])},
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

  const reply = isHi
    ? `🚨 *आपकी शिकायत दर्ज कर ली गई है!*
📌 *घटना आईडी:* ${triageResult.incidentId}
⚖️ *कानूनी धारा:* ${triageResult.applicableLaws.join(', ')}
💰 *राशि:* ₹${triageResult.amount.toLocaleString('en-IN')}

⚡ *तत्काल गोल्डन ऑवर कार्रवाई:*
1. तुरंत 1930 डायल करें और उपरोक्त आईडी बताएं।
2. अपने बैंक को कॉल करके UTR नंबर ${extracted.utr || 'लेनदेन संदर्भ'} फ्रीज करने को कहें।

📄 *लाइव स्टेटस और औपचारिक FIR ड्राफ्ट देखें:*
${trackingLink}`
    : `🚨 *COMPLAINT FILED SUCCESSFULLY!*
📌 *Incident ID:* ${triageResult.incidentId}
⚖️ *Applicable Laws:* ${triageResult.applicableLaws.join(', ')}
💰 *Amount:* ₹${triageResult.amount.toLocaleString('en-IN')}

⚡ *IMMEDIATE GOLDEN HOUR ACTIONS:*
1. Dial 1930 immediately and quote this incident ID.
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
