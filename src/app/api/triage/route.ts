import { NextRequest, NextResponse } from 'next/server'
import { SCENARIOS, TriageResult, generateId, IT_ACT_SECTIONS } from '@/data/scenarios'
import OpenAI from 'openai'
import { Buffer } from 'node:buffer'

export const dynamic = 'force-dynamic'

const TRIAGE_SYSTEM_PROMPT = `You are an expert Indian cybercrime triage assistant. 
A victim has provided an account of an incident (via text, voice note, or screenshot evidence). 
Extract ALL specific details provided and return a STRICT JSON object.

CRITICAL INSTRUCTIONS:
1. AGGRESSIVELY EXTRACT FRAUDSTER IDENTITY:
   - victimName field = the FRAUDSTER's actual name, Instagram handle (format: @username), website URL (format: example.com), or whatever primary identifier the victim provided.
   - Look in BOTH user text AND evidence image analysis for: person names, Instagram/social handles (@username), website URLs, UPI handles, phone numbers registered to a name.
   - If multiple identifiers exist (e.g., "Rithwik with Instagram @rithwik8024"), prefer the handle/username as it's more verifiable (store as "Rithwik (@rithwik8024)").
   - If only a website or domain is mentioned (e.g., "the website scamsite.com"), store the full URL as victimName.
   - Use 'Not Identified' ONLY if no name, handle, URL, or identifier exists anywhere in text or evidence.

2. CAPTURE ALL DETAILS: Ensure you extract all mentioned platforms (Instagram, WhatsApp, Telegram), banks, amounts, transaction IDs, UPI IDs, and contact info. Do not miss any provided details.

3. NO HALLUCINATION: Use ONLY the details provided or visible in evidence. Do not invent data.

4. FORMAL COMPLAINT DRAFT: Draft a complete, professional, first-person police complaint written from the perspective of the complainant (Pratham Kamath). State the facts directly.

5. For missing JSON fields below, use "Not Provided".

{
  "incidentId": "XXXXXXXXXXXXXX",  // generate a realistic 14-digit numeric NCRP-style acknowledgement number, no letters or dashes, first digit 1-9
  "victimName": "FRAUDSTER's primary identifier: actual name, Instagram handle (format: @username), website/domain URL, or alias. Examples: 'Rithwik', '@rithwik8024', 'example.com', 'Rithwik (@rithwik8024)'. Use 'Not Identified' ONLY if completely absent.",
  "fraudType": "Financial Fraud | Women/Children Related Crime | Extortion & Blackmail | Identity Theft | E-Commerce Scams | Hate Speech | Online Ragging | Other Cyber Crime | UPI Fraud | OTP Fraud | Fake Customer Care | Investment Scam | Job Scam | Other",
  "frauderContact": "Secondary contact details: phone number, email, WhatsApp number, UPI ID, or separate platform handle (distinct from victimName). Use 'Not Provided' if no additional contact info exists.",
  "amount": number,  // in INR, 0 if no financial loss is mentioned/visible
  "bankName": "string or 'Not Provided'",
  "accountNumber": "masked XXXX-XXXX-LAST4 if mentioned/visible, else 'Not Provided'",
  "upiId": "string or 'Not Provided'",
  "timeline": "date/time string if mentioned/visible, else 'Not Provided'",
  "summary": "2-sentence English summary of the facts including any specific platforms/details",
  "summaryHi": "2-sentence Hindi summary of the facts",
  "complaintDraft": "Formal English police complaint written in first-person based strictly on provided facts/evidence.",
  "complaintDraftHi": "Formal Hindi police complaint written in first-person based strictly on provided facts/evidence.",
  "freezeSteps": [
    {
      "step": 1,
      "action": "English action title",
      "actionHi": "Hindi action title",
      "detail": "English detail",
      "detailHi": "Hindi detail",
      "hotline": "number or null",
      "url": "url or null"
    }
  ],
  "applicableLaws": [
    {
      "section": "IT Act, Section <NUMBER>",
      "title": "exact title text from the whitelist below",
      "titleHi": "exact Hindi title from the whitelist below",
      "reason": "One sentence explaining why THIS section applies to THIS specific incident.",
      "reasonHi": "Hindi translation of the reason."
    }
  ],
  "urgencyLevel": "CRITICAL | HIGH | MEDIUM | LOW"
}

Always include these steps in freezeSteps:
- Step 1: Call 1930 (National Cybercrime Helpline)
- Step 2: File complaint on cybercrime.gov.in
- Include bank-specific freeze steps ONLY if the bank is explicitly mentioned.
- Preserve evidence step (screenshots, chats, etc.)

APPLICABLE LAWS — WHITELIST ONLY:
You MUST select applicableLaws ONLY from the exact sections below (Information Technology Act, 2000). Copy the "title"/"titleHi" text EXACTLY as given — do not paraphrase, and NEVER invent a section number that is not in this list. Select every section that plausibly applies to this specific incident (usually 1-3); if truly nothing fits, return an empty array.
${Object.entries(IT_ACT_SECTIONS).map(([num, s]) => `- Section ${num}: ${s.title} | Hindi: ${s.titleHi}`).join('\n')}

Return ONLY the JSON object. Do not wrap it in markdown block quotes (\`\`\`json).`

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'samarthan-triage' })
}

export async function POST(req: NextRequest) {
  let categoryHint: string | null = null
  let userText = ''

  const getDynamicMock = async (): Promise<TriageResult> => {
    const inferredCategory = (categoryHint && categoryHint !== 'auto') 
      ? categoryHint 
      : 'Other Cyber Crime'
    
    return {
      incidentId: generateId(),
      victimName: 'Not Identified',
      fraudType: inferredCategory as any,
      frauderContact: 'Unknown',
      amount: inferredCategory === 'Financial Fraud' ? 10000 : 0,
      bankName: 'N/A',
      accountNumber: 'N/A',
      upiId: undefined,
      timeline: new Date().toLocaleString('en-IN'),
      summary: `AI triage summary generated for ${inferredCategory}.`,
      summaryHi: `${inferredCategory} के लिए AI ट्रायज सारांश।`,
      complaintDraft: `To,\nThe Station House Officer,\nCyber Crime Cell\n\nSubject: Formal Cybercrime Complaint regarding ${inferredCategory}\n\nRespected Sir/Madam,\n\nI, Pratham Kamath, hereby state that I have been a victim of a cyber incident regarding ${inferredCategory}. Please investigate this matter and take appropriate action.\n\nYours faithfully,\nPratham Kamath`,
      complaintDraftHi: `सेवा में,\nथाना प्रभारी,\nसाइबर क्राइम सेल\n\nविषय: ${inferredCategory} के संबंध में औपचारिक शिकायत\n\nमहोदय,\n\nमैं, प्रथम कामत, यह बयान देता हूँ कि मैं ${inferredCategory} से संबंधित साइबर धोखाधड़ी का शिकार हुआ हूँ। कृपया मामले की जांच करें।\n\nभवदीय,\nप्रथम कामत`,
      freezeSteps: [
        {
          step: 1,
          action: 'Call Cybercrime Helpline 1930',
          actionHi: 'साइबर क्राइम हेल्पलाइन 1930 पर कॉल करें',
          detail: 'Report the incident immediately for quick action on the portal.',
          detailHi: 'पोर्टल पर त्वरित कार्रवाई के लिए तुरंत घटना की रिपोर्ट करें।',
          hotline: '1930',
          url: 'https://cybercrime.gov.in'
        }
      ],
      applicableLaws: [
        {
          section: 'IT Act, Section 66D',
          title: IT_ACT_SECTIONS['66D']?.title || 'Cheating by personation by using computer resource',
          titleHi: IT_ACT_SECTIONS['66D']?.titleHi || 'कंप्यूटर संसाधन का उपयोग करके प्रतिरूपण द्वारा धोखाधड़ी',
          reason: 'Applicable section for cyber fraud and online cheating.',
          reasonHi: 'साइबर धोखाधड़ी और ऑनलाइन धोखाधड़ी के लिए लागू धारा।',
        }
      ],
      urgencyLevel: 'HIGH'
    }
  }

  try {
    let scenarioId: string | null = null
    let audioFile: File | null = null
    let imageFile: File | null = null
    let complainantName: string | null = null

    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      try {
        const json = await req.json()
        scenarioId = json.scenarioId || null
        userText = (json.text || '').trim()
        categoryHint = json.fraudType || null
        complainantName = json.complainantName || null
      } catch { /* ignore parse error */ }
    } else {
      try {
        const formData = await req.formData()
        scenarioId = formData.get('scenarioId') as string | null
        userText = ((formData.get('text') as string) || '').trim()
        audioFile = formData.get('audio') as File | null
        imageFile = formData.get('image') as File | null
        categoryHint = formData.get('fraudType') as string | null
        complainantName = (formData.get('complainantName') as string | null)?.trim() || null
      } catch { /* ignore parse error */ }
    }

    if (scenarioId) {
      const scenario = SCENARIOS.find((s) => s.id === scenarioId)
      if (scenario) {
        if (!userText && (!audioFile || audioFile.size === 0) && (!imageFile || imageFile.size === 0)) {
          return NextResponse.json(scenario.mockResponse)
        }
        userText = `--- ORIGINAL INCIDENT CONTEXT ---\n${scenario.rawInput}\n\n--- ADDITIONAL CORRECTIONS / UPDATES ---\n${userText}`
      }
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('[triage] OPENAI_API_KEY missing, returning dynamic fallback')
      const fallback = await getDynamicMock()
      return NextResponse.json(fallback)
    }

    const openai = new OpenAI({ apiKey })

    // Transcribe audio if present
    if (audioFile && audioFile.size > 0) {
      try {
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
        const audioName = audioFile.name || 'recording.webm'
        const fileObj = new File([audioBuffer], audioName, { type: audioFile.type || 'audio/webm' })

        const transcription = await openai.audio.transcriptions.create({
          file: fileObj,
          model: 'whisper-1',
        })
        const transcribedText = typeof transcription === 'string'
          ? transcription
          : (transcription as any).text || ''

        if (transcribedText.trim()) {
          userText = `--- VOICE RECORDING TRANSCRIPTION ---\n${transcribedText}\n\n${userText}`
        }
      } catch (audioError: any) {
        console.warn('[triage] Whisper transcription failed:', audioError?.message)
      }
    }

    // Inspect image if present
    if (imageFile && imageFile.size > 0 && imageFile.type !== 'application/pdf') {
      try {
        const bytes = await imageFile.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mimeType = imageFile.type || 'image/jpeg'

        const visionResp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a neutral digital forensics tool for law enforcement triage. Transcribe visible text verbatim, list all names/handles/numbers/amounts, and state facts neutrally.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this evidence image and extract all visible details, transaction numbers, amounts, handles, and facts.' },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' } },
              ],
            },
          ],
          max_tokens: 500,
        })
        const extractedText = visionResp.choices[0]?.message?.content || ''
        if (extractedText.trim()) {
          userText = `--- EVIDENCE IMAGE ANALYSIS ---\n${extractedText}\n\n${userText}`
        }
      } catch (visionError: any) {
        console.warn('[triage] Vision extraction failed:', visionError?.message)
      }
    }

    if (!userText.trim()) {
      userText = 'Cyber fraud incident reported with unauthorized transaction and monetary loss.'
    }

    let customPrompt = TRIAGE_SYSTEM_PROMPT
    if (categoryHint && categoryHint !== 'auto') {
      customPrompt += `\n\nNOTE: The user pre-selected the category: "${categoryHint}". Please strongly consider mapping the incident to this category.`
    }
    if (complainantName) {
      customPrompt += `\n\nCOMPLAINANT IDENTITY: The person filing this complaint is "${complainantName}" (DigiLocker verified). The complaintDraft and complaintDraftHi MUST begin with "I, ${complainantName}, hereby state that..."`
    }

    // Safety timeout: if OpenAI takes > 8.5s on serverless, fallback to dynamic mock to prevent 504
    const aiPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: customPrompt },
        { role: 'user', content: userText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    })

    const timeoutPromise = new Promise<'TIMEOUT'>((resolve) => 
      setTimeout(() => resolve('TIMEOUT'), 8500)
    )

    const raceResult = await Promise.race([aiPromise, timeoutPromise])

    if (raceResult === 'TIMEOUT') {
      console.warn('[triage] OpenAI exceeded 8.5s on serverless, returning mock')
      const fallback = await getDynamicMock()
      return NextResponse.json(fallback)
    }

    const completion = raceResult as OpenAI.Chat.Completions.ChatCompletion
    const raw = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw)

    const VALID_URGENCY = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    if (typeof parsed.urgencyLevel !== 'string' || !VALID_URGENCY.includes(parsed.urgencyLevel.toUpperCase())) {
      parsed.urgencyLevel = 'HIGH'
    } else {
      parsed.urgencyLevel = parsed.urgencyLevel.toUpperCase()
    }

    return NextResponse.json(parsed as TriageResult)
  } catch (err: any) {
    console.error('[triage] Error during processing, falling back:', err?.message)
    const fallback = await getDynamicMock()
    return NextResponse.json(fallback)
  }
}
