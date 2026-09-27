import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

// GET /api/complaints?id=xxx  → single complaint (404 if not found)
// GET /api/complaints          → all complaints ordered by saved_at desc (LIMIT 100)
export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    if (!sql) {
      return NextResponse.json([])
    }
    const id = req.nextUrl.searchParams.get('id')
    if (id) {
      const rows = await sql`SELECT * FROM complaints WHERE incident_id = ${id} LIMIT 1`
      if (!rows[0]) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
      return NextResponse.json(rows[0])
    }
    const rows = await sql`SELECT * FROM complaints ORDER BY saved_at DESC LIMIT 100`
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev && err instanceof Error ? err.message : 'Database error. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/complaints  body: complaint row (snake_case)
// Upserts - if incident_id exists, updates all fields (so dashboard edits persist)
export async function POST(req: NextRequest) {
  let c: Record<string, unknown>
  try {
    c = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!c.incident_id) {
    return NextResponse.json({ error: 'Missing incident_id' }, { status: 400 })
  }

  try {
    const sql = getDb()
    if (!sql) {
      return NextResponse.json({ ok: true, fallback: 'localStorage' })
    }
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
        ${c.incident_id as string}, ${c.fraud_type as string}, ${(c.fraudster_identifier ?? c.victim_name ?? '') as string}, ${(c.complainant_name ?? '') as string},
        ${c.amount as number}, ${c.urgency_level as string},
        ${c.summary as string}, ${(c.summary_hi ?? '') as string}, ${c.complaint_draft as string}, ${(c.complaint_draft_hi ?? '') as string},
        ${(c.frauder_contact ?? '') as string}, ${(c.bank_name ?? '') as string}, ${(c.account_number ?? '') as string}, ${(c.upi_id ?? null) as string | null}, ${(c.timeline ?? '') as string},
        ${JSON.stringify(c.freeze_steps ?? [])}, ${JSON.stringify(c.applicable_laws ?? [])},
        ${c.saved_at as string}, ${(c.language ?? 'en') as string},
        ${(c.status ?? 'SUBMITTED') as string}, ${JSON.stringify(c.status_history ?? [])},
        ${JSON.stringify(c.evidence_images ?? [])}, ${JSON.stringify(c.updates ?? [])},
        ${(c.recommended_channel ?? 'helpline') as string}, ${(c.recommended_channel_target ?? '1930') as string},
        ${(c.citizen_phone ?? null) as string | null}
      )
      ON CONFLICT (incident_id) DO UPDATE SET
        fraud_type = EXCLUDED.fraud_type,
        fraudster_identifier = EXCLUDED.fraudster_identifier,
        complainant_name = EXCLUDED.complainant_name,
        amount = EXCLUDED.amount,
        urgency_level = EXCLUDED.urgency_level,
        summary = EXCLUDED.summary,
        summary_hi = EXCLUDED.summary_hi,
        complaint_draft = EXCLUDED.complaint_draft,
        complaint_draft_hi = EXCLUDED.complaint_draft_hi,
        frauder_contact = EXCLUDED.frauder_contact,
        bank_name = EXCLUDED.bank_name,
        account_number = EXCLUDED.account_number,
        upi_id = EXCLUDED.upi_id,
        timeline = EXCLUDED.timeline,
        freeze_steps = EXCLUDED.freeze_steps,
        applicable_laws = EXCLUDED.applicable_laws,
        language = EXCLUDED.language,
        status = EXCLUDED.status,
        status_history = CASE 
          WHEN jsonb_array_length(EXCLUDED.status_history::jsonb) > 1 
          THEN EXCLUDED.status_history 
          ELSE COALESCE(NULLIF(complaints.status_history, '[]'::jsonb), EXCLUDED.status_history) 
        END,
        evidence_images = CASE
          WHEN jsonb_array_length(EXCLUDED.evidence_images::jsonb) > 0
          THEN EXCLUDED.evidence_images
          ELSE COALESCE(complaints.evidence_images, EXCLUDED.evidence_images)
        END,
        updates = CASE 
          WHEN jsonb_array_length(EXCLUDED.updates::jsonb) > 0 
          THEN EXCLUDED.updates 
          ELSE COALESCE(complaints.updates, EXCLUDED.updates) 
        END,
        recommended_channel = EXCLUDED.recommended_channel,
        recommended_channel_target = EXCLUDED.recommended_channel_target,
        citizen_phone = COALESCE(complaints.citizen_phone, EXCLUDED.citizen_phone)
    `
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev && err instanceof Error ? err.message : 'Database error. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/complaints  body: { incident_id, ...fields to update }
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { incident_id, ...fields } = body
  if (!incident_id) {
    return NextResponse.json({ error: 'Missing incident_id' }, { status: 400 })
  }

  try {
    const sql = getDb()
    if (!sql) {
      return NextResponse.json({ ok: true, fallback: 'localStorage' })
    }

    const sets: string[] = []
    const vals: unknown[] = []

    if (fields.status !== undefined) {
      sets.push('status')
      vals.push(fields.status)
    }
    if (fields.status_history !== undefined) {
      sets.push('status_history')
      vals.push(JSON.stringify(fields.status_history))
    }
    if (fields.evidence_images !== undefined) {
      sets.push('evidence_images')
      vals.push(JSON.stringify(fields.evidence_images))
    }
    if (fields.updates !== undefined) {
      sets.push('updates')
      vals.push(JSON.stringify(fields.updates))
    }
    if (fields.complaint_draft !== undefined) {
      sets.push('complaint_draft')
      vals.push(fields.complaint_draft)
    }
    if (fields.complaint_draft_hi !== undefined) {
      sets.push('complaint_draft_hi')
      vals.push(fields.complaint_draft_hi)
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    for (let i = 0; i < sets.length; i++) {
      const col = sets[i]
      const val = vals[i]
      if (col === 'status') await sql`UPDATE complaints SET status = ${val} WHERE incident_id = ${incident_id}`
      else if (col === 'status_history') await sql`UPDATE complaints SET status_history = ${val} WHERE incident_id = ${incident_id}`
      else if (col === 'evidence_images') await sql`UPDATE complaints SET evidence_images = ${val} WHERE incident_id = ${incident_id}`
      else if (col === 'updates') await sql`UPDATE complaints SET updates = ${val} WHERE incident_id = ${incident_id}`
      else if (col === 'complaint_draft') await sql`UPDATE complaints SET complaint_draft = ${val} WHERE incident_id = ${incident_id}`
      else if (col === 'complaint_draft_hi') await sql`UPDATE complaints SET complaint_draft_hi = ${val} WHERE incident_id = ${incident_id}`
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev && err instanceof Error ? err.message : 'Database error. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
