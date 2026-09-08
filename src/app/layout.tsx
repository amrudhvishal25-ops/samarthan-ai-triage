import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TriageProvider } from '@/context/TriageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import SmoothScroll from '@/components/SmoothScroll'

export const metadata: Metadata = {
  title: 'Samarthan — Build What Moves India Hackathon',
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
  themeColor: '#1E3A5F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('samarthan_theme');
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <TriageProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </TriageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
