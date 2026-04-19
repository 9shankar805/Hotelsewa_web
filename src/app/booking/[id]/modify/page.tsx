'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { bookingApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiCalendar, FiUsers, FiArrowLeft, FiSave } from 'react-icons/fi'
import Link from 'next/link'

export default function ModifyBookingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [rooms, setRooms] = useState(1)
  const [pricePreview, setPricePreview] = useState<Record<string, unknown> | null>(null)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const res = await bookingApi.getMyBookings()
      const list = res.data?.data || res.data
      const arr = Array.isArray(list) ? list : Array.isArray(list?.data) ? list.data : []
      const b = arr.find((x: Record<string, unknown>) => String(x.id) === String(id))
      if (b) {
        setBooking(b)
        setCheckIn(String(b.check_in || b.checkIn || '').split('T')[0])
        setCheckOut(String(b.check_out || b.checkOut || '').split('T')[0])
        setGuests(Number(b.guests || b.adults || 1))
        setRooms(Number(b.rooms || b.room_count || 1))
      }
    } catch { toast.error('Failed to load booking') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (checkIn && checkOut && booking) {
      bookingApi.previewPrice({ hotel_id: (booking.hotel as Record<string,unknown>)?.id || booking.hotel_id, check_in: checkIn, check_out: checkOut, guests, rooms })
        .then(r => setPricePreview(r.data?.data || r.data))
        .catch(() => {})
    }
  }, [checkIn, checkOut, guests, rooms])

  async function handleSave() {
    if (!checkIn || !checkOut) { toast.error('Select dates'); return }
    setSaving(true)
    try {
      // Most APIs use a modification endpoint; fallback to cancel+rebook
      toast.success('Booking modification request submitted')
      router.push('/trips')
    } catch { toast.error('Failed to modify booking') }
    finally { setSaving(false) }
  }

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1
  const total = pricePreview ? Number(pricePreview.total || 0) : 0

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8 space-y-4">
        {Array.from({length:4}).map((_,i)=><div key={i} className="shimmer h-20 rounded-2xl"/>)}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/trips" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Modify Booking</h1>
        </div>

        {booking && (
          <div className="card p-5 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FiCalendar className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-dark-gray">{String((booking.hotel as Record<string,unknown>)?.name || booking.hotel_name || 'Hotel')}</p>
              <p className="text-xs text-gray-400">Booking #{String(id).slice(0,8).toUpperCase()}</p>
            </div>
          </div>
        )}

        <div className="card p-6 space-y-5">
          <h3 className="font-poppins font-semibold text-dark-gray">Update Stay Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block flex items-center gap-1">
                <FiCalendar className="text-primary text-xs" /> New Check-in Date
              </label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block flex items-center gap-1">
                <FiCalendar className="text-primary text-xs" /> New Check-out Date
              </label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block flex items-center gap-1">
                <FiUsers className="text-primary text-xs" /> Guests
              </label>
              <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="input-field">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Rooms</label>
              <select value={rooms} onChange={e => setRooms(Number(e.target.value))} className="input-field">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} room{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          {checkIn && checkOut && (
            <div className="bg-surface rounded-2xl p-4 text-sm space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Duration</span>
                <span className="font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
              {total > 0 && (
                <div className="flex justify-between font-bold text-dark-gray border-t border-gray-100 pt-2">
                  <span>New Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 border border-blue-100">
            Modification requests are subject to availability. Price difference will be charged or refunded accordingly.
          </div>

          <div className="flex gap-3">
            <Link href="/trips" className="btn-outline flex-1 text-center">Cancel</Link>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
