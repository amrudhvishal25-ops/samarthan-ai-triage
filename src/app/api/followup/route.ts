import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export interface ExtractedFollowupFields {
  utr: string | null
  bankName: string | null
  accountNumber: string | null
  upiId: string | null
  fraudsterIdentifier: string | null
  amount: number | null
  complainantName: string | null
  timeline: string | null
}

function fallbackExtract(text: string): ExtractedFollowupFields {
  const utrMatch = text.match(/\b([0-9]{12})\b/) || text.match(/(?:utr|ref|txn|reference)[\s:#-]*([0-9A-Za-z]{8,18})/i)
  const upiMatch = text.match(/[\w.-]+@[\w.-]+/i)
  const phoneMatch = text.match(/(?:(?:\+?91)?[ -]?)?([6-9]\d{9})\b/)
  const bankMatch = text.match(/\b(hdfc|sbi|state bank(?: of india)?|icici|axis|pnb|punjab national bank|kotak|bob|bank of baroda|canara|union bank|indusind|yes bank|idfc|paytm payments bank|airtel payments bank)\b/i)
  const amountMatch = text.match(/(?:rs\.?|inr|₹|amount|rupees|rupaye)?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\s*(?:rs|rupees|inr|hazar|k|lakh))?/i)
  const accountMatch = text.match(/(?:a\/c|acc|account|acct|khata)[\s:#-]*([0-9]{9,18})/i)

  return {
    utr: utrMatch ? utrMatch[1] : null,
    bankName: bankMatch ? bankMatch[0] : null,
    upiId: upiMatch ? upiMatch[0] : null,
    fraudsterIdentifier: phoneMatch ? phoneMatch[1] : upiMatch ? upiMatch[0] : null,
    accountNumber: accountMatch ? accountMatch[1] : null,
    amount: amountMatch && parseInt(amountMatch[1].replace(/,/g, ''), 10) > 0 ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : null,
    complainantName: null,
    timeline: null,
  }
}

const FOLLOWUP_SYSTEM_PROMPT = `You are an expert Indian Cybercrime case investigator and structured data extraction engine.
A victim has already filed a complaint and is adding a NEW UPDATE note to their existing case (e.g. providing a 12-digit UTR, their bank name, fraudster's UPI handle, phone number, new transaction, etc.).

YOUR TASKS:
1. Extract any compulsory or case fields mentioned in this note:
   - "utr": 12-digit UPI UTR number, IMPS/NEFT reference, or transaction ID (string or null)
   - "bankName": victim's bank name from which money debited (e.g. HDFC, SBI, ICICI, etc.) (string or null)
   - "accountNumber": victim's account number or card if mentioned (string or null)
   - "upiId": scammer's or beneficiary's UPI VPA (containing @) (string or null)
   - "fraudsterIdentifier": fraudster's name, phone, handle, or identity (string or null)
   - "amount": disputed fraud amount in INR if updated (number or null)
   - "complainantName": complainant's name if stated (string or null)
   - "timeline": date or time of incident if mentioned (string or null)

2. "actionPoints": ["1-3 short, concrete next steps for victim/bank officer based on this update, in English"]
3. "actionPointsHi": ["Hindi translation of the action points"]

4. "updatedDraft": Updated formal police FIR complaint incorporating the newly discovered details cleanly into the statement.
5. "updatedDraftHi": Hindi translation of the updated complaint draft.

Return STRICT JSON matching this schema:
{
  "extracted": {
    "utr": null,
    "bankName": null,
    "accountNumber": null,
    "upiId": null,
    "fraudsterIdentifier": null,
    "amount": null,
    "complainantName": null,
    "timeline": null
  },
  "actionPoints": [],
  "actionPointsHi": [],
  "updatedDraft": null,
  "updatedDraftHi": null
}`

export async function POST(req: NextRequest) {
  let body: {
    note?: string
    fraudType?: string
    summary?: string
    frauderContact?: string
    bankName?: string
    accountNumber?: string
    upiId?: string
    amount?: number
    complaintDraft?: string
    complaintDraftHi?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
  }

  const { note, fraudType, summary, frauderContact, bankName, accountNumber, upiId, amount, complaintDraft, complaintDraftHi } = body

  if (!note || !note.trim()) {
    return NextResponse.json({ error: 'Note is required' }, { status: 400 })
  }

  const fbExtracted = fallbackExtract(note)
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey === 'mock-key' || !apiKey.startsWith('sk-')) {
    return NextResponse.json({
      extracted: fbExtracted,
      actionPoints: fbExtracted.utr ? [`Quote UTR ${fbExtracted.utr} to bank immediately to freeze funds`] : [],
      actionPointsHi: fbExtracted.utr ? [`फंड फ्रीज करने के लिए तुरंत बैंक को UTR ${fbExtracted.utr} बताएं`] : [],
      updatedDraft: null,
      updatedDraftHi: null,
    })
  }

  try {
    const openai = new OpenAI({ apiKey })
    const context = `CASE CONTEXT:
Fraud type: ${fraudType || 'Unknown'}
Existing summary: ${summary || 'Not available'}
Known fraudster contact/ref: ${frauderContact || 'Not available'}
Current bank: ${bankName || 'Not available'}
Current account: ${accountNumber || 'Not available'}
Current UPI: ${upiId || 'Not available'}
Current amount: ₹${amount || 0}
Existing Draft: ${complaintDraft || ''}

NEW UPDATE FROM VICTIM:
"${note}"`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
        { role: 'user', content: context },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw)

    const extracted: ExtractedFollowupFields = {
      utr: parsed.extracted?.utr || fbExtracted.utr || null,
      bankName: parsed.extracted?.bankName || fbExtracted.bankName || null,
      accountNumber: parsed.extracted?.accountNumber || fbExtracted.accountNumber || null,
      upiId: parsed.extracted?.upiId || fbExtracted.upiId || null,
      fraudsterIdentifier: parsed.extracted?.fraudsterIdentifier || fbExtracted.fraudsterIdentifier || null,
      amount: typeof parsed.extracted?.amount === 'number' ? parsed.extracted.amount : fbExtracted.amount,
      complainantName: parsed.extracted?.complainantName || null,
      timeline: parsed.extracted?.timeline || null,
    }

    return NextResponse.json({
      extracted,
      actionPoints: Array.isArray(parsed.actionPoints) ? parsed.actionPoints : [],
      actionPointsHi: Array.isArray(parsed.actionPointsHi) ? parsed.actionPointsHi : [],
      updatedDraft: parsed.updatedDraft || null,
      updatedDraftHi: parsed.updatedDraftHi || null,
    })
  } catch (apiError: any) {
    console.warn('[followup] OpenAI call failed, using rule extractor:', apiError?.message)
    return NextResponse.json({
      extracted: fbExtracted,
      actionPoints: fbExtracted.utr ? [`Quote UTR ${fbExtracted.utr} to bank immediately`] : [],
      actionPointsHi: fbExtracted.utr ? [`बैंक को तुरंत UTR ${fbExtracted.utr} बताएं`] : [],
      updatedDraft: null,
      updatedDraftHi: null,
    })
  }
}
