// Simple in-memory rate limiter for API routes
// Production: use Upstash Redis or similar
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // 10 requests per minute

export function rateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
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

// Cleanup old entries every 5 minutes to prevent memory leak
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const keysToDelete: string[] = []
    requestCounts.forEach((record, key) => {
      if (now > record.resetTime) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => requestCounts.delete(key))
  }, 5 * 60 * 1000)
}
