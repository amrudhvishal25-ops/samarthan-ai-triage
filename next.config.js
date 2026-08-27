/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['openai', 'pdf-parse', 'heic-convert', '@neondatabase/serverless'],
}

module.exports = nextConfig
