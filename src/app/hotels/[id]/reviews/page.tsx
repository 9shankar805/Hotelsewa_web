'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { hotelApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { FiStar, FiArrowLeft, FiFilter } from 'react-icons/fi'
import Link from 'next/link'

interface Review { id?: string | number; user_name?: string; name?: string; rating?: number; comment?: string; review?: string; created_at?: string; reply?: string }

export default function HotelReviewsPage() {
  const { id } = useParams()
  const [hotel, setHotel] = useState<Record<string, unknown> | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(0) // 0 = all, 1-5 = star filter
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest')

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const res = await hotelApi.getHotelDetails(String(id))
      let data = res.data?.data
      if (data?.data) data = data.data
      setHotel(data)
      setReviews(Array.isArray(data?.reviews) ? data.reviews : [])
    } catch { setReviews([]) }
    finally { setLoading(false) }
  }

  const filtered = reviews
    .filter(r => filter === 0 || Number(r.rating) === filter)
    .sort((a, b) => {
      if (sort === 'highest') return Number(b.rating || 0) - Number(a.rating || 0)
      if (sort === 'lowest') return Number(a.rating || 0) - Number(b.rating || 0)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length : 0
  const ratingCounts = [5,4,3,2,1].map(n => ({ star: n, count: reviews.filter(r => Number(r.rating) === n).length }))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/hotels/${id}`} className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="font-poppins font-bold text-2xl text-dark-gray">Guest Reviews</h1>
            {hotel && <p className="text-sm text-gray-400">{String(hotel.name)}</p>}
          </div>
        </div>

        {/* Rating summary */}
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-poppins font-extrabold text-5xl text-dark-gray">{avgRating.toFixed(1)}</p>
              <div className="flex gap-0.5 justify-center my-1">
                {[1,2,3,4,5].map(n => <FiStar key={n} className={`text-sm ${n <= Math.round(avgRating) ? 'text-gold fill-gold' : 'text-gray-300'}`} />)}
              </div>
              <p className="text-xs text-gray-400">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-4">{star}</span>
                  <FiStar className="text-gold text-xs" />
                  <div className="flex-1 bg-surface rounded-full h-2">
                    <div className="bg-gold h-2 rounded-full transition-all" style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }} />
                  </div>
                  <span className="text-xs text-gray-400 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter(0)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === 0 ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-100'}`}>All</button>
            {[5,4,3,2,1].map(n => (
              <button key={n} onClick={() => setFilter(n)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === n ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-100'}`}>
                {n} <FiStar className="text-xs" />
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <FiFilter className="text-gray-400 text-sm" />
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="text-xs border border-gray-100 rounded-xl px-3 py-1.5 bg-white outline-none">
              <option value="newest">Newest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {loading ? Array.from({length:4}).map((_,i) => <div key={i} className="shimmer h-28 rounded-2xl"/>) :
            filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FiStar className="text-5xl mx-auto mb-3 text-gray-300" />
                <p>No reviews yet</p>
              </div>
            ) : filtered.map((r, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {String(r.user_name || r.name || 'G')[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-dark-gray">{r.user_name || r.name || 'Guest'}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(n => <FiStar key={n} className={`text-xs ${n <= Number(r.rating || 0) ? 'text-gold fill-gold' : 'text-gray-300'}`} />)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(String(r.created_at || ''))}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment || r.review}</p>
                {r.reply && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1">Hotel Response</p>
                    <p className="text-xs text-gray-500">{r.reply}</p>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
