import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not configured')
  return neon(url)
}

// GET /api/complaints?id=xxx  → single complaint
// GET /api/complaints          → all complaints ordered by saved_at desc (LIMIT 100)
export async function GET(req: NextRequest) {
  try {
    const sql = getDb()
    const id = req.nextUrl.searchParams.get('id')
    if (id) {
      const rows = await sql`SELECT * FROM complaints WHERE incident_id = ${id} LIMIT 1`
      return NextResponse.json(rows[0] ?? null)
    }
    const rows = await sql`SELECT * FROM complaints ORDER BY saved_at DESC LIMIT 100`
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'public, max-age=30' } })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev && err instanceof Error ? err.message : 'Database error. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/complaints  body: complaint row (snake_case)
export async function POST(req: NextRequest) {
  try {
    const sql = getDb()
    const c = await req.json()
    // Upsert — if incident_id already exists, skip insert (idempotent)
    await sql`
      INSERT INTO complaints (
        incident_id, fraud_type, victim_name, amount, urgency_level,
        summary, summary_hi, complaint_draft, complaint_draft_hi,
        frauder_contact, bank_name, account_number, upi_id, timeline,
        freeze_steps, applicable_laws, saved_at, language,
        status, status_history, evidence_images, updates,
        recommended_channel, recommended_channel_target
      ) VALUES (
        ${c.incident_id}, ${c.fraud_type}, ${c.victim_name}, ${c.amount}, ${c.urgency_level},
        ${c.summary}, ${c.summary_hi}, ${c.complaint_draft}, ${c.complaint_draft_hi},
        ${c.frauder_contact}, ${c.bank_name}, ${c.account_number}, ${c.upi_id ?? null}, ${c.timeline},
        ${JSON.stringify(c.freeze_steps ?? [])}, ${JSON.stringify(c.applicable_laws ?? [])},
        ${c.saved_at}, ${c.language},
        ${c.status}, ${JSON.stringify(c.status_history ?? [])},
        ${JSON.stringify(c.evidence_images ?? [])}, ${JSON.stringify(c.updates ?? [])},
        ${c.recommended_channel ?? 'helpline'}, ${c.recommended_channel_target ?? '1930'}
      )
      ON CONFLICT (incident_id) DO NOTHING
    `
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev && err instanceof Error ? err.message : 'Database error. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/complaints?force=true  → truncate all complaints
export async function DELETE(req: NextRequest) {
  try {
    const force = req.nextUrl.searchParams.get('force') === 'true'
    if (!force) return NextResponse.json({ error: 'Missing ?force=true' }, { status: 400 })

    const sql = getDb()
    await sql`DELETE FROM complaints`
    return NextResponse.json({ ok: true, message: 'All complaints deleted' })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev && err instanceof Error ? err.message : 'Database error. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/complaints  body: { incident_id, ...fields to update }
export async function PATCH(req: NextRequest) {
  try {
    const sql = getDb()
    const body = await req.json()
    const { incident_id, ...fields } = body

    if (fields.status !== undefined && fields.status_history !== undefined) {
      await sql`
        UPDATE complaints
        SET status = ${fields.status},
            status_history = ${JSON.stringify(fields.status_history)}
        WHERE incident_id = ${incident_id}
      `
    } else if (fields.evidence_images !== undefined) {
      await sql`
        UPDATE complaints
        SET evidence_images = ${JSON.stringify(fields.evidence_images)}
        WHERE incident_id = ${incident_id}
      `
    } else if (fields.updates !== undefined) {
      await sql`
        UPDATE complaints
        SET updates = ${JSON.stringify(fields.updates)}
        WHERE incident_id = ${incident_id}
      `
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev && err instanceof Error ? err.message : 'Database error. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
