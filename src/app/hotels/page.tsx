'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import HotelCard from '@/components/HotelCard'
import { HotelCardShimmer } from '@/components/Shimmer'
import { hotelApi } from '@/lib/api'
import { FiFilter, FiSearch, FiX, FiSliders } from 'react-icons/fi'

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Most Reviewed']
const PRICE_RANGES = [
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: 999999 },
]
const AMENITIES = ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Parking', 'AC', 'Bar']
const RATINGS = [5, 4, 3]

function HotelsContent() {
  const searchParams = useSearchParams()
  const [hotels, setHotels] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState(0)
  const [priceRange, setPriceRange] = useState<number | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => { loadHotels() }, [searchParams])

  async function loadHotels() {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      const q = searchParams.get('q')
      const city = searchParams.get('city')
      const checkIn = searchParams.get('checkIn')
      const checkOut = searchParams.get('checkOut')
      const guests = searchParams.get('guests')
      if (q) params.search = q
      if (city) params.city = city
      if (checkIn) params.check_in = checkIn
      if (checkOut) params.check_out = checkOut
      if (guests) params.guests = guests

      const res = await hotelApi.getHotels(params)
      const raw = res.data?.data
      let list: Record<string, unknown>[] = []
      if (Array.isArray(raw)) list = raw
      else if (raw?.data && Array.isArray(raw.data)) list = raw.data
      setHotels(list)
      setTotal(raw?.total || list.length)
    } catch {
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = hotels.filter(h => {
    if (search && !String(h.name || '').toLowerCase().includes(search.toLowerCase()) &&
        !String(h.address || h.city || '').toLowerCase().includes(search.toLowerCase())) return false
    if (priceRange !== null) {
      const r = PRICE_RANGES[priceRange]
      const p = Number(h.min_price || h.price || 0)
      if (p < r.min || p > r.max) return false
    }
    if (minRating !== null && Number(h.rating || 0) < minRating) return false
    return true
  }).sort((a, b) => {
    if (sort === 1) return Number(a.min_price || a.price || 0) - Number(b.min_price || b.price || 0)
    if (sort === 2) return Number(b.min_price || b.price || 0) - Number(a.min_price || a.price || 0)
    if (sort === 3) return Number(b.rating || 0) - Number(a.rating || 0)
    if (sort === 4) return Number(b.total_reviews || 0) - Number(a.total_reviews || 0)
    return 0
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Search bar */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-surface rounded-2xl px-4 py-2.5">
              <FiSearch className="text-primary flex-shrink-0" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search hotels, cities..." className="bg-transparent text-sm w-full outline-none" />
              {search && <button onClick={() => setSearch('')}><FiX className="text-gray-400" /></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${showFilters ? 'bg-primary text-white' : 'bg-surface text-dark-gray'}`}>
              <FiSliders /> Filters
            </button>
            <select value={sort} onChange={e => setSort(Number(e.target.value))}
              className="bg-surface rounded-2xl px-4 py-2.5 text-sm font-medium outline-none cursor-pointer">
              {SORT_OPTIONS.map((o, i) => <option key={i} value={i}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
          {/* Filters sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0 space-y-6 animate-fade-in">
              <div className="card p-5">
                <h3 className="font-semibold text-dark-gray mb-4 flex items-center gap-2"><FiFilter /> Filters</h3>

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-dark-gray mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {PRICE_RANGES.map((r, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="price" checked={priceRange === i} onChange={() => setPriceRange(i === priceRange ? null : i)}
                          className="accent-primary" />
                        <span className="text-sm text-gray-600">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-dark-gray mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {RATINGS.map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r === minRating ? null : r)}
                          className="accent-primary" />
                        <span className="text-sm text-gray-600">{'⭐'.repeat(r)} & above</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-dark-gray mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map(a => (
                      <button key={a} onClick={() => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${selectedAmenities.includes(a) ? 'bg-primary text-white' : 'bg-surface text-gray-600'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => { setPriceRange(null); setMinRating(null); setSelectedAmenities([]) }}
                  className="w-full mt-5 text-sm text-primary font-semibold hover:underline">
                  Clear all filters
                </button>
              </div>
            </aside>
          )}

          {/* Hotel grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${filtered.length} hotels found`}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {loading
                ? Array.from({ length: 9 }).map((_, i) => <HotelCardShimmer key={i} />)
                : filtered.length > 0
                  ? filtered.map((h, i) => <HotelCard key={String(h.id)} hotel={h} index={i} />)
                  : (
                    <div className="col-span-3 text-center py-20">
                      <div className="text-6xl mb-4">🏨</div>
                      <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No hotels found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <HotelsContent />
    </Suspense>
  )
}
