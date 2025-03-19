import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/navigation/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sanita - Health & Fitness Social Platform',
  description: 'Connect, share, and grow with the health and fitness community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="sanita">
      <body className={inter.className}>
        <div className="min-h-screen bg-base-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
