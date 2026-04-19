'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OwnerSidebar from '@/components/OwnerSidebar'
import { isLoggedIn } from '@/lib/auth'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isLoggedIn()) {
      router.push('/login?redirect=/owner/dashboard')
    }
  }, [])

  // Always render the full layout — never return null
  // This prevents server/client HTML mismatch (hydration error)
  // The auth redirect happens client-side after mount
  return (
    <div className="flex min-h-screen bg-background">
      {mounted && <OwnerSidebar />}
      <main className={`flex-1 min-h-screen overflow-x-hidden transition-all ${mounted ? 'lg:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  )
}
