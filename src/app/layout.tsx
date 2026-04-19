import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import GoogleAuthProvider from '@/components/GoogleAuthProvider'

export const metadata: Metadata = {
  title: 'HotelSewa - Find & Book Hotels',
  description: 'Discover and book the best hotels at the best prices with HotelSewa',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleAuthProvider>
          {children}
        </GoogleAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E60023', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
