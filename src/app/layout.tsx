import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TriageProvider } from '@/context/TriageContext'

export const metadata: Metadata = {
  title: 'Samarthan — Aevy TV X OpenAI',
  description: 'AI-powered cybercrime triage platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Samarthan',
  },
  openGraph: {
    title: 'Samarthan — Golden Hour Fraud Triage',
    description: 'AI-powered fraud reporting. From panic to FIR in 60 seconds.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A3A6B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <TriageProvider>
          {children}
        </TriageProvider>
      </body>
    </html>
  )
}
