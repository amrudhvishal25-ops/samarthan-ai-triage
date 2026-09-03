import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FOLLOWUP_SYSTEM_PROMPT = `You are a cybercrime case assistant. A victim has already filed a complaint and is now adding a NEW piece of information to their existing case (a fresh detail, a new message from the fraudster, a new transaction, etc.).

Given the case summary and the new note, return STRICT JSON:
{
  "actionPoints": ["1-3 short, concrete follow-up actions the victim or an operator should take because of this NEW information, in English"],
  "actionPointsHi": ["Hindi translations of the same points, same order"]
}

Rules:
- Base action points ONLY on the new note and case context given. Do not invent facts.
- Keep each point under 20 words, imperative tone (e.g. "Block this new number immediately", "Forward this message as evidence to the bank").
- If the note doesn't warrant any new action, return empty arrays.
- Return ONLY the JSON object, no markdown.`

export async function POST(req: NextRequest) {
  let body: { note?: string; fraudType?: string; summary?: string; frauderContact?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
  }

  const { note, fraudType, summary, frauderContact } = body

  if (!note || !note.trim()) {
    return NextResponse.json({ error: 'Note is required' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 })
  }

  try {
    const openai = new OpenAI({ apiKey })
    const context = `CASE CONTEXT:\nFraud type: ${fraudType || 'Unknown'}\nExisting summary: ${summary || 'Not available'}\nKnown fraudster contact: ${frauderContact || 'Not available'}\n\nNEW UPDATE FROM VICTIM:\n${note}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
        { role: 'user', content: context },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const raw = completion.choices[0]?.message?.content || '{"actionPoints":[],"actionPointsHi":[]}'
    const parsed = JSON.parse(raw)
    return NextResponse.json({
      actionPoints: Array.isArray(parsed.actionPoints) ? parsed.actionPoints : [],
      actionPointsHi: Array.isArray(parsed.actionPointsHi) ? parsed.actionPointsHi : [],
    })
  } catch (apiError: any) {
    console.warn('[followup] OpenAI call failed:', apiError?.message)
    return NextResponse.json({ error: 'AI processing failed', actionPoints: [], actionPointsHi: [] }, { status: 502 })
  }
}
