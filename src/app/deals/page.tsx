'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import HotelCard from '@/components/HotelCard'
import { HotelCardShimmer } from '@/components/Shimmer'
import { hotelApi } from '@/lib/api'
import { FiTag } from 'react-icons/fi'

const DEAL_BANNERS = [
  { title: 'Weekend Getaway', subtitle: 'Up to 40% off on weekend stays', color: 'from-purple-600 to-blue-500', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800' },
  { title: 'Early Bird Offer', subtitle: 'Book 30 days ahead & save 25%', color: 'from-green-500 to-teal-400', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
  { title: 'Last Minute Deals', subtitle: 'Tonight\'s best prices', color: 'from-primary to-primary-light', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800' },
]

export default function DealsPage() {
  const [hotels, setHotels] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hotelApi.getHotels({ discount: 'true' }).then(res => {
      const raw = res.data?.data
      setHotels(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    }).catch(() => setHotels([])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary to-primary-dark py-12 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FiTag className="text-2xl" />
            <h1 className="font-poppins font-extrabold text-3xl">Hot Deals 🔥</h1>
          </div>
          <p className="text-white/80">Exclusive discounts on the best hotels</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Deal banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {DEAL_BANNERS.map((b, i) => (
              <div key={i} className="relative h-44 rounded-3xl overflow-hidden cursor-pointer group shadow-card">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-lg font-poppins">{b.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-poppins font-bold text-xl text-dark-gray mb-6">Hotels with Best Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <HotelCardShimmer key={i} />)
              : hotels.length > 0
                ? hotels.map((h, i) => <HotelCard key={String(h.id || i)} hotel={h} index={i} />)
                : <div className="col-span-3 text-center py-10 text-gray-400">No deals available right now</div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
