import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Poker Circuit Coordinator - Smart Travel Management',
  description: 'AI-powered travel optimization for professional poker circuit players. Save money, time, and maximize your ROI.',
  keywords: 'poker, tournament, circuit, travel, optimization, WSOP, WPT, EPT',
  authors: [{ name: 'OpenClaw' }],
  creator: 'OpenClaw',
  publisher: 'OpenClaw',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://poker-circuit-coordinator.com',
    title: 'Poker Circuit Coordinator - Smart Travel Management',
    description: 'AI-powered travel optimization for professional poker circuit players',
    siteName: 'Poker Circuit Coordinator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Poker Circuit Coordinator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poker Circuit Coordinator - Smart Travel Management',
    description: 'AI-powered travel optimization for professional poker circuit players',
    images: ['/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-gray-50`}>
        <div id="root" className="h-full">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  )
}