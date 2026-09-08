import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

const STATE_FILE = path.resolve(process.cwd(), '.whatsapp_live_state.json')
const PID_FILE = path.resolve(process.cwd(), '.whatsapp_bot.pid')
const AUTH_DIR = path.resolve(process.cwd(), '.whatsapp_auth')
const SCRIPT_PATH = path.resolve(process.cwd(), 'scripts/whatsapp-bot.mjs')

// In production the bot runs on Railway (separate filesystem) and publishes
// its status + QR to Postgres. Read that first; fall back to the local state
// file only for same-machine local dev.
async function getStateFromDb() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  try {
    const sql = neon(url)
    const rows = await sql`select status, qr_data_url, user_phone, started_at, last_ping from bot_state where id = 'whatsapp'`
    if (!rows.length) return null
    const r = rows[0] as {
      status: string; qr_data_url: string | null; user_phone: string | null
      started_at: number | null; last_ping: number | null
    }
    const isRecent = r.last_ping != null && Date.now() - Number(r.last_ping) < 60000
    if (!isRecent) {
      return { isRunning: false, status: 'DISCONNECTED', qrDataUrl: null, userPhone: null, wasActive: r.status }
    }
    return {
      isRunning: true,
      status: r.status || 'INITIALIZING',
      qrDataUrl: r.qr_data_url || null,
      userPhone: r.user_phone || null,
      startedAt: r.started_at ? Number(r.started_at) : null,
    }
  } catch {
    return null
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (err: any) {
    return err?.code === 'EPERM'
  }
}

function getLiveState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { isRunning: false, status: 'DISCONNECTED', qrDataUrl: null, userPhone: null }
  }

  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8')
    const data = JSON.parse(raw)
    const now = Date.now()
    const isRecent = data.lastPing && (now - data.lastPing < 60000)
    const pidAlive = data.pid ? isProcessAlive(data.pid) : false

    if (!isRecent || !pidAlive) {
      return {
        isRunning: false,
        status: 'DISCONNECTED',
        qrDataUrl: null,
        userPhone: null,
        wasActive: data.status,
      }
    }

    return {
      isRunning: true,
      status: data.status || 'INITIALIZING',
      qrDataUrl: data.qrDataUrl || null,
      userPhone: data.userPhone || null,
      startedAt: data.startedAt || null,
    }
  } catch {
    return { isRunning: false, status: 'DISCONNECTED', qrDataUrl: null, userPhone: null }
  }
}

function spawnBotProcess() {
  const child = spawn(process.execPath, [SCRIPT_PATH], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
  return child.pid
}

export async function GET() {
  // Prefer a fresh same-machine state file (local dev); otherwise the DB row
  // the Railway-hosted bot publishes.
  const local = getLiveState()
  if (local.isRunning) return NextResponse.json(local)

  const remote = await getStateFromDb()
  if (remote) return NextResponse.json(remote)

  return NextResponse.json(local)
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json().catch(() => ({ action: 'start' }))

    if (action === 'start') {
      const current = getLiveState()
      if (current.isRunning) {
        return NextResponse.json({ success: true, message: 'Already running', state: current })
      }

      spawnBotProcess()
      return NextResponse.json({
        success: true,
        message: 'WhatsApp bot companion starting up...',
      })
    }

    if (action === 'stop') {
      if (fs.existsSync(PID_FILE)) {
        try {
          const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10)
          if (pid && isProcessAlive(pid)) {
            process.kill(pid, 'SIGTERM')
          }
        } catch {}
      }
      try {
        if (fs.existsSync(STATE_FILE)) {
          fs.writeFileSync(
            STATE_FILE,
            JSON.stringify({ status: 'DISCONNECTED', lastPing: Date.now() }),
            'utf-8'
          )
        }
      } catch {}

      return NextResponse.json({ success: true, message: 'Bot stopped' })
    }

    if (action === 'restart' || action === 'reset') {
      // Kill existing
      if (fs.existsSync(PID_FILE)) {
        try {
          const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10)
          if (pid && isProcessAlive(pid)) {
            process.kill(pid, 'SIGKILL')
          }
        } catch {}
      }

      // Remove auth to force fresh QR code
      try {
        if (fs.existsSync(AUTH_DIR)) {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true })
        }
      } catch {}

      spawnBotProcess()
      return NextResponse.json({
        success: true,
        message: 'Cleared credentials and restarting with fresh QR code...',
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Action failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
