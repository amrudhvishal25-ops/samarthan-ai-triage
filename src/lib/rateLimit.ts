// Daily per-IP cap on the hosted demo, since triage calls hit a paid OpenAI key.
// Bring your own OPENAI_API_KEY (see .env.example) and this limit no longer applies to you locally —
// it only guards the shared hosted deployment.
const MAX_PER_DAY = process.env.MAX_DAILY_TRIAGE ? parseInt(process.env.MAX_DAILY_TRIAGE, 10) : 5
const dailyCounts = new Map<string, number>()

function getClientIp(req: Request): string {
  const vercelForwarded = req.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) return vercelForwarded.split(',')[0].trim()
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function checkDailyLimit(
  req: Request,
  { scope = 'triage', limit = MAX_PER_DAY }: { scope?: string; limit?: number } = {},
): Promise<{ allowed: boolean; ip: string }> {
  // If user brought their own OpenAI API key in headers, allow unlimited access
  const byoKey = req.headers.get('x-openai-key')
  if (scope === 'triage' && byoKey && byoKey.startsWith('sk-')) {
    return { allowed: true, ip: 'byo-key' }
  }

  // Only enforce rate limiting in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_RATE_LIMIT !== 'true') {
    return { allowed: true, ip: 'local-unlimited' }
  }

  const ip = getClientIp(req)
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)
  const key = `${scope}:${today}:${ip}`
  const count = dailyCounts.get(key) ?? 0
  const allowed = count < limit
  if (allowed) dailyCounts.set(key, count + 1)
  return { allowed, ip }
}
