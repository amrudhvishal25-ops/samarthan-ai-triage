import { neon } from '@neondatabase/serverless'

// Server-side only — never import this in client components
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  // Will be undefined on client — only throw on server
  if (typeof window === 'undefined') {
    throw new Error('DATABASE_URL is not set')
  }
}

export const sql = connectionString ? neon(connectionString) : null
export const isNeonConfigured = Boolean(connectionString)
