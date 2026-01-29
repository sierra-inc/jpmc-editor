import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JPMC Agent Editor',
  description: 'Visual editor for JP Morgan Chase agent behaviors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-jpmc-gray-50">
        {children}
      </body>
    </html>
  )
}
