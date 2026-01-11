import '../styles/globals.css'
import type { Metadata } from 'next'
import { LoadingProvider } from '@/contexts/LoadingContext'

export const metadata = {
  title: 'C74 - Tunisia\'s Trusted Service Marketplace',
  description: 'Connect with verified professionals for all your home service needs. Plumbing, electrical, AC maintenance, and cleaning services across Tunisia.',
  keywords: ['C74', 'Tunisia', 'services', 'marketplace', 'plumbing', 'electrical', 'AC', 'cleaning'],
  authors: [{ name: 'C74 Team' }],
  creator: 'C74',
  publisher: 'C74',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'C74 - Tunisia\'s Trusted Service Marketplace',
    description: 'Connect with verified professionals for all your home service needs.',
    type: 'website',
    locale: 'en_US',
    url: 'https://c74.tn',
    siteName: 'C74',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'C74 - Tunisia\'s Trusted Service Marketplace',
    description: 'Connect with verified professionals for all your home service needs.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  )
}
