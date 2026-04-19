'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi, hotelApi } from '@/lib/api'
import { getUser, isLoggedIn } from '@/lib/auth'
import { parseHotelImage } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiCalendar, FiUsers, FiUser, FiMail, FiPhone, FiArrowLeft, FiShield } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'

function BookingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const hotelId = params.get('hotel_id')
  const roomId = params.get('room_id')
  const checkInParam = params.get('check_in') || ''
  const checkOutParam = params.get('check_out') || ''
  const guestsParam = Number(params.get('guests') || 1)
  const roomsParam = Number(params.get('rooms') || 1)

  const user = getUser()
  const [hotel, setHotel] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pricePreview, setPricePreview] = useState<Record<string, unknown> | null>(null)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discount, setDiscount] = useState(0)

  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    idNumber: '',
    specialRequests: '',
  })

  useEffect(() => {
    if (!isLoggedIn()) { router.push(`/login?redirect=/booking/new${window.location.search}`); return }
    if (!hotelId) { router.push('/hotels'); return }
    loadHotel()
  }, [hotelId])

  async function loadHotel() {
    setLoading(true)
    try {
      const res = await hotelApi.getHotelDetails(hotelId!)
      let data = res.data?.data
      if (data?.data) data = data.data
      setHotel(data)
      if (checkInParam && checkOutParam) {
        const pr = await bookingApi.previewPrice({ hotel_id: hotelId, check_in: checkInParam, check_out: checkOutParam, guests: guestsParam, rooms: roomsParam })
        setPricePreview(pr.data?.data || pr.data)
      }
    } catch { toast.error('Failed to load hotel') }
    finally { setLoading(false) }
  }

  async function applyCoupon() {
    if (!coupon.trim()) return
    try {
      const res = await bookingApi.validateCoupon({ code: coupon, hotel_id: hotelId })
      const d = res.data?.data || res.data
      if (d?.discount || d?.discount_amount) {
        setDiscount(Number(d.discount_amount || d.discount || 0))
        setCouponApplied(true)
        toast.success('Coupon applied!')
      } else { toast.error('Invalid coupon') }
    } catch { toast.error('Invalid coupon code') }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.email) { toast.error('Fill required fields'); return }
    setSubmitting(true)
    try {
      const res = await bookingApi.createBooking({
        hotel_id: hotelId,
        room_type_id: roomId,
        check_in_date: checkInParam,
        check_out_date: checkOutParam,
        adults: guestsParam,
        children: 0,
        room_count: roomsParam,
        special_requests: form.specialRequests,
        guest_name: `${form.firstName} ${form.lastName}`,
        guest_email: form.email,
        guest_phone: form.phone,
        coupon_code: couponApplied ? coupon : undefined,
      })
      const data = res.data?.data || res.data
      const bookingId = data?.id || data?.booking_id || data?.data?.id
      if (bookingId) {
        router.push(`/booking/${bookingId}/payment?amount=${finalAmount}`)
      } else {
        toast.error(res.data?.message || 'Booking failed')
      }
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  const nights = checkInParam && checkOutParam
    ? Math.max(1, Math.round((new Date(checkOutParam).getTime() - new Date(checkInParam).getTime()) / 86400000))
    : 1
  const basePrice = Number(hotel?.min_price || hotel?.price || 0)
  const roomTotal = pricePreview ? Number(pricePreview.subtotal || pricePreview.total || basePrice * nights * roomsParam) : basePrice * nights * roomsParam
  const tax = pricePreview ? Number(pricePreview.tax || 0) : Math.round(roomTotal * 0.18)
  const finalAmount = roomTotal + tax - discount

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-16 max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="shimmer h-40 rounded-3xl"/>)}</div>
        <div className="shimmer h-80 rounded-3xl"/>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Complete Your Booking</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-5">
              {/* Hotel summary */}
              {hotel && (
                <div className="card p-5 flex gap-4">
                  <div className="w-24 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-surface">
                    <img src={parseHotelImage(hotel.image || hotel.images)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-poppins font-bold text-dark-gray">{String(hotel.name)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{String(hotel.address || hotel.city || '')}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><FiCalendar className="text-primary" /> {checkInParam} → {checkOutParam}</span>
                      <span className="flex items-center gap-1"><FiUsers className="text-primary" /> {guestsParam} guests · {roomsParam} room{roomsParam > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest details */}
              <div className="card p-6">
                <h3 className="font-poppins font-semibold text-dark-gray mb-4 flex items-center gap-2">
                  <FiUser className="text-primary" /> Guest Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">First Name *</label>
                    <input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} className="input-field" placeholder="John" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">Last Name</label>
                    <input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} className="input-field" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">Email *</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-field pl-10" placeholder="john@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">Phone</label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-field pl-10" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">ID Number (Aadhaar/Passport)</label>
                    <input value={form.idNumber} onChange={e => setForm(f => ({...f, idNumber: e.target.value}))} className="input-field" placeholder="Enter ID number" />
                  </div>
                </div>
              </div>

              {/* Special requests */}
              <div className="card p-6">
                <h3 className="font-poppins font-semibold text-dark-gray mb-3">Special Requests</h3>
                <textarea value={form.specialRequests} onChange={e => setForm(f => ({...f, specialRequests: e.target.value}))}
                  rows={3} className="input-field resize-none" placeholder="Early check-in, high floor, extra pillows..." />
                <p className="text-xs text-gray-400 mt-2">Requests are not guaranteed but we'll do our best.</p>
              </div>

              {/* Coupon */}
              <div className="card p-6">
                <h3 className="font-poppins font-semibold text-dark-gray mb-3">Coupon Code</h3>
                <div className="flex gap-3">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} disabled={couponApplied}
                    className="input-field flex-1" placeholder="Enter coupon code" />
                  <button type="button" onClick={applyCoupon} disabled={couponApplied}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${couponApplied ? 'bg-green-50 text-green-600' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                    {couponApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                <FiShield className="text-green-600 text-xl flex-shrink-0" />
                <p className="text-sm text-green-700">Your payment is secured with 256-bit SSL encryption. Free cancellation up to 24 hours before check-in.</p>
              </div>
            </div>

            {/* Right: Price summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="font-poppins font-semibold text-dark-gray mb-4">Price Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Room charges ({nights} night{nights > 1 ? 's' : ''})</span>
                    <span>₹{roomTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & fees (18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-dark-gray">
                    <span>Total Amount</span>
                    <span className="text-primary text-lg">₹{finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-surface rounded-xl text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between"><span>Check-in</span><span className="font-medium">{checkInParam}</span></div>
                  <div className="flex justify-between"><span>Check-out</span><span className="font-medium">{checkOutParam}</span></div>
                  <div className="flex justify-between"><span>Guests</span><span className="font-medium">{guestsParam}</span></div>
                  <div className="flex justify-between"><span>Rooms</span><span className="font-medium">{roomsParam}</span></div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
                  {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {submitting ? 'Processing...' : 'Continue to Payment'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BookingNewPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}><BookingForm /></Suspense>
}
