// Simple in-memory rate limiter for API routes
// Production: use Upstash Redis or similar
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // 10 requests per minute

// Periodic inline cleanup when map size exceeds 500
export function rateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()

  if (requestCounts.size > 500) {
    requestCounts.forEach((record, key) => {
      if (now > record.resetTime) {
        requestCounts.delete(key)
      }
    })
  }

  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(identifier, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 }
  }

  if (record.count < MAX_REQUESTS_PER_WINDOW) {
    record.count++
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count }
  }

  return { allowed: false, remaining: 0 }
}
