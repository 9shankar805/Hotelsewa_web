'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi } from '@/lib/api'
import { formatDate, parseHotelImage, getStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiMapPin, FiDownload, FiEdit2, FiX, FiArrowLeft, FiPhone, FiMail } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import Link from 'next/link'

type Booking = Record<string, unknown>

export default function BookingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const res = await bookingApi.getMyBookings()
      const raw = res.data?.data || res.data
      const list: Booking[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
      const b = list.find((x) => String(x.id) === String(id))
      setBooking(b || null)
    } catch { toast.error('Failed to load booking') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="shimmer h-64 rounded-3xl" />
        <div className="shimmer h-40 rounded-3xl" />
        <div className="shimmer h-32 rounded-3xl" />
      </div>
    </div>
  )

  if (!booking) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-16 flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <MdHotel className="text-6xl mb-3 text-gray-300" />
        <p className="font-semibold">Booking not found</p>
        <Link href="/trips" className="btn-primary mt-4 text-sm">View All Trips</Link>
      </div>
    </div>
  )

  const hotel = (booking.hotel as Booking) || {}
  const status = String(booking.status ?? 'pending')
  const isCancellable = ['confirmed', 'pending'].includes(status.toLowerCase())
  const isModifiable = ['confirmed', 'pending'].includes(status.toLowerCase())
  const isCompleted = ['completed', 'checked_out'].includes(status.toLowerCase())
  const image = parseHotelImage(hotel.image || hotel.images)

  // Extract typed strings to avoid unknown-in-JSX errors
  const checkIn = String(booking.check_in ?? booking.checkIn ?? '')
  const checkOut = String(booking.check_out ?? booking.checkOut ?? '')
  const guestsCount = String(booking.guests ?? booking.adults ?? 1)
  const hotelName = String(hotel.name ?? booking.hotel_name ?? 'Hotel')
  const hotelAddress = String(hotel.address ?? hotel.city ?? '')
  const hotelPhone = hotel.phone ? String(hotel.phone) : ''
  const hotelEmail = hotel.email ? String(hotel.email) : ''
  const hotelId = String(hotel.id ?? booking.hotel_id ?? '')

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : Number(booking.nights ?? 1)

  const stayDetails = [
    { label: 'Check-in', value: formatDate(checkIn) },
    { label: 'Check-out', value: formatDate(checkOut) },
    { label: 'Guests', value: `${guestsCount} guests` },
    { label: 'Duration', value: `${nights} night${nights > 1 ? 's' : ''}` },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Booking Details</h1>
        </div>

        {/* Hotel card */}
        <div className="card overflow-hidden mb-5">
          <div className="h-48 overflow-hidden">
            <img src={image} alt={hotelName} className="w-full h-full object-cover" />
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-poppins font-bold text-xl text-dark-gray">{hotelName}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <FiMapPin className="text-primary text-xs" />
                  <span className="text-sm text-gray-500">{hotelAddress}</span>
                </div>
              </div>
              <span className={`badge capitalize ${getStatusColor(status)}`}>{status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Stay details */}
        <div className="card p-5 mb-5">
          <h3 className="font-poppins font-semibold text-dark-gray mb-4">Stay Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stayDetails.map(({ label, value }) => (
              <div key={label} className="bg-[#F0F2F5] rounded-2xl p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="font-semibold text-sm text-dark-gray">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="card p-5 mb-5">
          <h3 className="font-poppins font-semibold text-dark-gray mb-4">Price Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Room charges ({nights} nights)</span>
              <span>₹{Number(booking.room_charges ?? booking.subtotal ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes &amp; fees</span>
              <span>₹{Number(booking.tax ?? booking.tax_amount ?? 0).toLocaleString()}</span>
            </div>
            {Number(booking.discount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{Number(booking.discount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-dark-gray border-t border-gray-100 pt-3">
              <span>Total Paid</span>
              <span className="text-primary text-lg">₹{Number(booking.total_price ?? booking.amount ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Hotel contact */}
        {(hotelPhone || hotelEmail) && (
          <div className="card p-5 mb-5">
            <h3 className="font-poppins font-semibold text-dark-gray mb-3">Hotel Contact</h3>
            <div className="space-y-2">
              {hotelPhone && (
                <a href={`tel:${hotelPhone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors">
                  <FiPhone className="text-primary" /> {hotelPhone}
                </a>
              )}
              {hotelEmail && (
                <a href={`mailto:${hotelEmail}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors">
                  <FiMail className="text-primary" /> {hotelEmail}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href={`/booking/${String(id)}/invoice`}
            className="flex flex-col items-center gap-1.5 p-4 card hover:shadow-lg transition-all text-center">
            <FiDownload className="text-primary text-xl" />
            <span className="text-xs font-medium text-gray-600">Invoice</span>
          </Link>
          {isModifiable && (
            <Link href={`/booking/${String(id)}/modify`}
              className="flex flex-col items-center gap-1.5 p-4 card hover:shadow-lg transition-all text-center">
              <FiEdit2 className="text-blue-500 text-xl" />
              <span className="text-xs font-medium text-gray-600">Modify</span>
            </Link>
          )}
          {isCancellable && (
            <Link href={`/booking/${String(id)}/cancel`}
              className="flex flex-col items-center gap-1.5 p-4 card hover:shadow-lg transition-all text-center">
              <FiX className="text-red-500 text-xl" />
              <span className="text-xs font-medium text-gray-600">Cancel</span>
            </Link>
          )}
          {isCompleted && hotelId && (
            <Link href={`/hotels/${hotelId}`}
              className="flex flex-col items-center gap-1.5 p-4 card hover:shadow-lg transition-all text-center">
              <MdHotel className="text-primary text-xl" />
              <span className="text-xs font-medium text-gray-600">Book Again</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
