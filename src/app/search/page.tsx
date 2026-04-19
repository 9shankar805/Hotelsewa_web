'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import HotelCard from '@/components/HotelCard'
import { HotelCardShimmer } from '@/components/Shimmer'
import { hotelApi } from '@/lib/api'
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiX } from 'react-icons/fi'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [guests, setGuests] = useState(Number(searchParams.get('guests') || 1))
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query || searchParams.get('q')) doSearch()
  }, [])

  async function doSearch() {
    setLoading(true)
    setSearched(true)
    try {
      const params: Record<string, unknown> = {}
      if (query) params.search = query
      if (checkIn) params.check_in = checkIn
      if (checkOut) params.check_out = checkOut
      if (guests > 1) params.guests = guests
      const res = await hotelApi.getHotels(params)
      const raw = res.data?.data
      setResults(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch { setResults([]) } finally { setLoading(false) }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSearch()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Search form */}
        <div className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-5xl mx-auto px-4">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-surface rounded-2xl px-4 py-3">
                <FiMapPin className="text-primary flex-shrink-0" />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="City, hotel or destination" className="bg-transparent text-sm w-full outline-none" />
                {query && <button type="button" onClick={() => setQuery('')}><FiX className="text-gray-400 text-sm" /></button>}
              </div>
              <div className="flex items-center gap-2 bg-surface rounded-2xl px-4 py-3 md:w-40">
                <FiCalendar className="text-primary flex-shrink-0" />
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none" />
              </div>
              <div className="flex items-center gap-2 bg-surface rounded-2xl px-4 py-3 md:w-40">
                <FiCalendar className="text-primary flex-shrink-0" />
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none" />
              </div>
              <div className="flex items-center gap-2 bg-surface rounded-2xl px-4 py-3 md:w-36">
                <FiUsers className="text-primary flex-shrink-0" />
                <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                  className="bg-transparent text-sm w-full outline-none">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 px-6">
                <FiSearch /> Search
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!searched ? (
            <div className="text-center py-20">
              <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">Search for hotels</h3>
              <p className="text-gray-500">Enter a city, hotel name or destination above</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <HotelCardShimmer key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No results found</h3>
              <p className="text-gray-500">Try a different search term or location</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-5">{results.length} hotels found for &quot;{query}&quot;</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((h, i) => <HotelCard key={String(h.id || i)} hotel={h} index={i} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}>
      <SearchContent />
    </Suspense>
  )
}
