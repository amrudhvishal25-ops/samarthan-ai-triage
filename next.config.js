/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['openai'],
  output: 'standalone',
}

module.exports = nextConfig
