'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { formatDate, getStatusColor, parseHotelImage } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiCalendar, FiMapPin, FiUsers, FiDownload, FiX, FiStar } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled', 'Hourly']

export default function TripsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [ratingModal, setRatingModal] = useState<{ bookingId: string; hotelId: string } | null>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login?redirect=/trips'); return }
    loadBookings()
  }, [])

  async function loadBookings() {
    setLoading(true)
    try {
      const res = await bookingApi.getMyBookings()
      const raw = res.data
      let list: Record<string, unknown>[] = []
      if (raw?.success) {
        const d = raw.data
        if (Array.isArray(d)) list = d
        else if (d?.data && Array.isArray(d.data)) list = d.data
        else if (d?.bookings && Array.isArray(d.bookings)) list = d.bookings
      }
      setBookings(list)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return
    try {
      const res = await bookingApi.cancelBooking(id)
      if (res.data?.success) {
        toast.success('Booking cancelled')
        loadBookings()
      } else {
        toast.error(res.data?.message || 'Failed to cancel')
      }
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  async function handleRate() {
    if (!ratingModal) return
    try {
      await bookingApi.rateHotel({ hotel_id: ratingModal.hotelId, booking_id: ratingModal.bookingId, rating, comment: review })
      toast.success('Review submitted!')
      setRatingModal(null)
      setRating(5)
      setReview('')
    } catch {
      toast.error('Failed to submit review')
    }
  }

  const filtered = bookings.filter(b => {
    const status = String(b.status || '').toLowerCase()
    if (activeTab === 1) return ['confirmed', 'pending', 'checked_in'].includes(status)
    if (activeTab === 2) return ['completed', 'checked_out'].includes(status)
    if (activeTab === 3) return status === 'cancelled'
    if (activeTab === 4) return String(b.booking_type) === 'hourly'
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">My Trips</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === i ? 'bg-primary text-white shadow-primary' : 'bg-white text-gray-600 shadow-card'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 flex gap-4">
                <div className="shimmer w-28 h-24 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="shimmer h-5 w-2/3 rounded-lg" />
                  <div className="shimmer h-4 w-1/2 rounded-lg" />
                  <div className="shimmer h-4 w-1/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MdHotel className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No trips yet</h3>
            <p className="text-gray-500 mb-6">Start exploring hotels and book your first stay</p>
            <button onClick={() => router.push('/hotels')} className="btn-primary">Explore Hotels</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b, i) => {
              const hotel = (b.hotel as Record<string, unknown>) || {}
              const status = String(b.status || 'pending')
              const image = parseHotelImage(hotel.image || hotel.images)
              const isCompleted = ['completed', 'checked_out'].includes(status.toLowerCase())
              const isCancellable = ['confirmed', 'pending'].includes(status.toLowerCase())

              return (
                <div key={i} className="card p-5 animate-fade-in">
                  <div className="flex gap-4">
                    <div className="w-28 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-surface">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-poppins font-bold text-dark-gray truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={() => router.push(`/booking/${b.id}`)}>{String(hotel.name || b.hotel_name || 'Hotel')}</h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {String(b.booking_type) === 'hourly' && (
                            <span className="badge text-blue-600 bg-blue-50 text-xs">⏰ Hourly</span>
                          )}
                          <span className={`badge ${getStatusColor(status)}`}>{status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <FiMapPin className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500 truncate">{String(hotel.address || hotel.city || '')}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {String(b.booking_type) === 'hourly' ? (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="text-primary" />
                            {String(b.check_in_datetime || b.check_in || '').replace('T', ' ').slice(0, 16)} → {String(b.check_out_datetime || b.check_out || '').replace('T', ' ').slice(11, 16)}
                            {b.total_hours && <span className="ml-1 text-blue-600 font-medium">({String(b.total_hours)}h)</span>}
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1"><FiCalendar className="text-primary" /> {formatDate(String(b.check_in || b.checkIn || ''))}</span>
                            <span>→</span>
                            <span>{formatDate(String(b.check_out || b.checkOut || ''))}</span>
                          </>
                        )}
                        <span className="flex items-center gap-1"><FiUsers className="text-primary" /> {String(b.guests || 1)} guests</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-primary">₹{Number(b.total_price || b.amount || 0).toLocaleString()}</span>
                        <div className="flex gap-2">
                          <button onClick={() => router.push(`/booking/${b.id}/invoice`)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors">
                            <FiDownload /> Invoice
                          </button>
                          {isCompleted && (
                            <button onClick={() => setRatingModal({ bookingId: String(b.id), hotelId: String(hotel.id || b.hotel_id) })}
                              className="flex items-center gap-1 text-xs text-gold hover:text-yellow-600 transition-colors">
                              <FiStar /> Rate
                            </button>
                          )}
                          {isCancellable && (
                            <button onClick={() => router.push(`/booking/${b.id}/cancel`)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                              <FiX /> Cancel
                            </button>
                          )}
                        </div>                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="font-poppins font-bold text-xl mb-4">Rate Your Stay</h3>
            <div className="flex gap-2 justify-center mb-4">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)}>
                  <FiStar className={`text-3xl transition-colors ${n <= rating ? 'text-gold fill-gold' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea value={review} onChange={e => setReview(e.target.value)}
              placeholder="Share your experience..." rows={4}
              className="input-field resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRatingModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleRate} className="btn-primary flex-1">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
