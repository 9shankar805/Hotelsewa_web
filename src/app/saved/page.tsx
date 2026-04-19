'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import HotelCard from '@/components/HotelCard'
import { profileApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { FiHeart } from 'react-icons/fi'

export default function SavedPage() {
  const router = useRouter()
  const [saved, setSaved] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login?redirect=/saved'); return }
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await profileApi.getFavourites()
      const raw = res.data?.data
      setSaved(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch { setSaved([]) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Saved Hotels</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="shimmer h-52" />
                <div className="p-4 space-y-3">
                  <div className="shimmer h-5 w-2/3 rounded-lg" />
                  <div className="shimmer h-4 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No saved hotels</h3>
            <p className="text-gray-500 mb-6">Save hotels you love to find them easily later</p>
            <button onClick={() => router.push('/hotels')} className="btn-primary">Explore Hotels</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((h, i) => (
              <HotelCard key={String(h.id || i)} hotel={h} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
