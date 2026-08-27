/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['openai'],
  // Removed 'standalone' output — Vercel handles deployment differently
}

module.exports = nextConfig
