/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['openai'],
  output: 'standalone',
  // Request size limit set in /api/triage/route.ts via FormData validation
}

module.exports = nextConfig
