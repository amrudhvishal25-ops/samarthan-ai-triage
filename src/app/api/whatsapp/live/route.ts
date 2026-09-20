import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // The interactive, in-app assistant is the supported public experience.
  // QR codes, phone numbers, and bot process controls must not be exposed.
  return NextResponse.json({
    isRunning: false,
    status: 'DEMO_ONLY',
    qrDataUrl: null,
    userPhone: null,
  })
}

export async function POST() {
  return NextResponse.json({ error: 'Live bot controls are disabled.' }, { status: 405 })
}
