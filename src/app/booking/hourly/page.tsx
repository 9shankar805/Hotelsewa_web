'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi, hotelApi } from '@/lib/api'
import { getUser, isLoggedIn } from '@/lib/auth'
import { parseHotelImage } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiClock, FiUsers, FiArrowLeft, FiShield, FiAlertCircle } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'

function HourlyBookingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const hotelId = params.get('hotel_id') || ''
  const roomTypeId = params.get('room_type_id') || ''
  const checkInDt = params.get('check_in_datetime') || ''
  const checkOutDt = params.get('check_out_datetime') || ''
  const guestsParam = Number(params.get('guests') || 1)

  const user = getUser()
  const [hotel, setHotel] = useState<Record<string, unknown> | null>(null)
  const [roomType, setRoomType] = useState<Record<string, unknown> | null>(null)
  const [pricePreview, setPricePreview] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [redeemPoints, setRedeemPoints] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: '',
  })

  useEffect(() => {
    if (!isLoggedIn()) { router.push(`/login?redirect=/booking/hourly${window.location.search}`); return }
    if (!hotelId || !roomTypeId || !checkInDt || !checkOutDt) { router.push('/hotels'); return }
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [hotelRes, priceRes] = await Promise.allSettled([
        hotelApi.getHotelDetails(hotelId),
        bookingApi.previewHourlyPrice({
          hotel_id: hotelId, room_type_id: roomTypeId,
          booking_type: 'hourly', check_in_datetime: checkInDt, check_out_datetime: checkOutDt,
        }),
      ])
      if (hotelRes.status === 'fulfilled') {
        let data = hotelRes.value.data?.data
        if (data?.data) data = data.data
        setHotel(data)
        const rt = (data?.room_types as Record<string, unknown>[])?.find(r => String(r.id) === roomTypeId)
        if (rt) setRoomType(rt)
      }
      if (priceRes.status === 'fulfilled') {
        setPricePreview(priceRes.value.data?.data || priceRes.value.data)
      }
    } catch { toast.error('Failed to load booking details') }
    finally { setLoading(false) }
  }

  async function applyCoupon() {
    if (!coupon.trim()) return
    try {
      const res = await bookingApi.validateCoupon({ code: coupon, hotel_id: hotelId })
      const d = res.data?.data || res.data
      if (d?.discount_amount || d?.discount) {
        setDiscount(Number(d.discount_amount || d.discount || 0))
        setCouponApplied(true)
        toast.success('Coupon applied!')
      } else { toast.error('Invalid coupon') }
    } catch { toast.error('Invalid coupon code') }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.email) { toast.error('Fill required fields'); return }

    // Validate hours
    const totalHours = Number(pricePreview?.total_hours || 0)
    const minH = Number(roomType?.min_hours || 1)
    const maxH = Number(roomType?.max_hours || 12)
    if (totalHours < minH || totalHours > maxH) {
      toast.error(`Duration must be between ${minH} and ${maxH} hours`); return
    }

    setSubmitting(true)
    try {
      const res = await bookingApi.createHourlyBooking({
        hotel_id: hotelId,
        room_type_id: roomTypeId,
        booking_type: 'hourly',
        check_in_datetime: checkInDt,
        check_out_datetime: checkOutDt,
        adults: guestsParam,
        children: 0,
        special_requests: form.specialRequests,
        redeem_points: redeemPoints ? 500 : 0,
      })
      const data = res.data?.data || res.data
      const bookingId = data?.booking?.id || data?.id || data?.booking_id
      if (bookingId) {
        const holdExpiry = data?.hold_expires_at
        if (holdExpiry) toast.success(`Booking held until ${holdExpiry} — pay now!`, { duration: 5000 })
        router.push(`/booking/${bookingId}/payment?amount=${finalAmount}&type=hourly`)
      } else {
        toast.error(res.data?.message || 'Booking failed')
      }
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  // Parse datetime for display
  const [inDate, inTime] = checkInDt.split(' ')
  const [, outTime] = checkOutDt.split(' ')
  const totalHours = Number(pricePreview?.total_hours || 0)
  const hourlyPrice = Number(pricePreview?.hourly_price || roomType?.hourly_price || 0)
  const subtotal = hourlyPrice * totalHours
  const finalAmount = subtotal - discount

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
          <div>
            <h1 className="font-poppins font-bold text-2xl text-dark-gray">Hourly Booking</h1>
            <p className="text-xs text-orange-500 font-medium flex items-center gap-1 mt-0.5">
              <FiAlertCircle className="text-xs" /> Booking held for 10 minutes after creation — pay promptly
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Hotel + booking summary */}
              {hotel && (
                <div className="card p-5 flex gap-4">
                  <div className="w-24 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-surface">
                    <img src={parseHotelImage(hotel.image || hotel.images)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-poppins font-bold text-dark-gray">{String(hotel.name)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{String(hotel.address || hotel.city || '')}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">
                        <FiClock className="text-xs" /> {inDate} · {inTime} → {outTime}
                      </span>
                      <span className="flex items-center gap-1"><FiUsers className="text-primary" /> {guestsParam} guest{guestsParam > 1 ? 's' : ''}</span>
                      {roomType && <span className="font-medium text-dark-gray">{String(roomType.name)}</span>}
                    </div>
                    {totalHours > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{totalHours} hour{totalHours > 1 ? 's' : ''} · ₹{hourlyPrice}/hr</p>
                    )}
                  </div>
                </div>
              )}

              {/* Guest details */}
              <div className="card p-6">
                <h3 className="font-poppins font-semibold text-dark-gray mb-4">Guest Details</h3>
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
                    <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-field" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">Special Requests</label>
                    <textarea value={form.specialRequests} onChange={e => setForm(f => ({...f, specialRequests: e.target.value}))}
                      rows={2} className="input-field resize-none" placeholder="Quiet room, early access..." />
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="card p-5">
                <h3 className="font-poppins font-semibold text-dark-gray mb-3">Coupon Code</h3>
                <div className="flex gap-3">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} disabled={couponApplied}
                    className="input-field flex-1" placeholder="Enter coupon code" />
                  <button type="button" onClick={applyCoupon} disabled={couponApplied}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${couponApplied ? 'bg-green-50 text-green-600' : 'bg-primary text-white'}`}>
                    {couponApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Redeem points */}
              <div className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-dark-gray text-sm">Redeem Loyalty Points</p>
                  <p className="text-xs text-gray-400">Use 500 points = ₹50 off</p>
                </div>
                <button type="button" onClick={() => setRedeemPoints(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${redeemPoints ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${redeemPoints ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                <FiShield className="text-green-600 text-xl flex-shrink-0" />
                <p className="text-sm text-green-700">Secured payment · Cancel 2+ hours before check-in for full refund</p>
              </div>
            </div>

            {/* Price summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="font-poppins font-semibold text-dark-gray mb-4">Price Summary</h3>
                <div className="space-y-3 text-sm">
                  {pricePreview?.breakdown && Array.isArray(pricePreview.breakdown) ? (
                    (pricePreview.breakdown as Array<{label: string; amount: number}>).map((b, i) => (
                      <div key={i} className="flex justify-between text-gray-600">
                        <span>{b.label}</span>
                        <span>₹{Number(b.amount).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between text-gray-600">
                      <span>{totalHours}h × ₹{hourlyPrice}/hr</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  {redeemPoints && (
                    <div className="flex justify-between text-blue-600">
                      <span>Points redeemed</span>
                      <span>-₹50</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-dark-gray">
                    <span>Total</span>
                    <span className="text-primary text-lg">₹{(finalAmount - (redeemPoints ? 50 : 0)).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100 text-xs text-orange-700">
                  <FiAlertCircle className="inline mr-1" />
                  After booking, you have <strong>10 minutes</strong> to complete payment before the hold expires.
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
                  {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiClock />}
                  {submitting ? 'Creating booking...' : 'Confirm & Pay'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">You won't be charged until payment</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function HourlyBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}>
      <HourlyBookingForm />
    </Suspense>
  )
}
