import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'HL Sales & Receivables',
  description: 'Internal Management App for HL',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  return (
    <html lang="en">
      <body>
        <div className={session ? "app-layout" : ""}>
          {session && <Navigation />}
          <main className={session ? 'app-main' : ''}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
