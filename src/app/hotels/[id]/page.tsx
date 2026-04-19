'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { hotelApi, bookingApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { parseHotelImage, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiMapPin, FiStar, FiWifi, FiHeart, FiShare2, FiChevronLeft, FiChevronRight, FiCheck, FiCalendar, FiUsers } from 'react-icons/fi'
import { MdPool, MdSpa, MdRestaurant, MdLocalParking, MdFitnessCenter } from 'react-icons/md'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <FiWifi />, Pool: <MdPool />, Spa: <MdSpa />, Restaurant: <MdRestaurant />,
  Parking: <MdLocalParking />, Gym: <MdFitnessCenter />,
}

export default function HotelDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [hotel, setHotel] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [bookingType, setBookingType] = useState<'nightly' | 'hourly'>('nightly')
  // Nightly
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [rooms, setRooms] = useState(1)
  const [pricePreview, setPricePreview] = useState<Record<string, unknown> | null>(null)
  // Hourly
  const [hourlyDate, setHourlyDate] = useState('')
  const [hourlyStart, setHourlyStart] = useState('14:00')
  const [hourlyEnd, setHourlyEnd] = useState('18:00')
  const [hourlyRoomId, setHourlyRoomId] = useState<string>('')
  const [hourlyPreview, setHourlyPreview] = useState<Record<string, unknown> | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'reviews' | 'policies'>('overview')

  useEffect(() => { loadHotel() }, [id])

  async function loadHotel() {
    setLoading(true)
    try {
      const res = await hotelApi.getHotelDetails(String(id))
      let data = res.data?.data
      if (data?.data) data = data.data
      setHotel(data)
    } catch {
      toast.error('Failed to load hotel details')
    } finally {
      setLoading(false)
    }
  }

  async function handlePreviewPrice() {
    if (!checkIn || !checkOut) return
    try {
      const res = await bookingApi.previewPrice({ hotel_id: id, check_in: checkIn, check_out: checkOut, guests, rooms })
      setPricePreview(res.data?.data || res.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { if (checkIn && checkOut) handlePreviewPrice() }, [checkIn, checkOut, guests, rooms])

  // Hourly price preview
  useEffect(() => {
    if (!hourlyDate || !hourlyStart || !hourlyEnd || !hourlyRoomId) return
    const checkInDt = `${hourlyDate} ${hourlyStart}:00`
    const checkOutDt = `${hourlyDate} ${hourlyEnd}:00`
    bookingApi.previewHourlyPrice({
      hotel_id: String(id), room_type_id: hourlyRoomId,
      booking_type: 'hourly', check_in_datetime: checkInDt, check_out_datetime: checkOutDt,
    }).then(r => setHourlyPreview(r.data?.data || r.data)).catch(() => {})
  }, [hourlyDate, hourlyStart, hourlyEnd, hourlyRoomId])

  function handleBook() {
    if (!isLoggedIn()) { router.push(`/login?redirect=/hotels/${id}`); return }
    if (bookingType === 'hourly') {
      if (!hourlyDate || !hourlyStart || !hourlyEnd || !hourlyRoomId) {
        toast.error('Select date, time and room for hourly booking'); return
      }
      const params = new URLSearchParams({
        hotel_id: String(id), room_type_id: hourlyRoomId,
        booking_type: 'hourly',
        check_in_datetime: `${hourlyDate} ${hourlyStart}:00`,
        check_out_datetime: `${hourlyDate} ${hourlyEnd}:00`,
        guests: String(guests),
      })
      router.push(`/booking/hourly?${params.toString()}`)
    } else {
      if (!checkIn || !checkOut) { toast.error('Select check-in and check-out dates'); return }
      const params = new URLSearchParams({ hotel_id: String(id), check_in: checkIn, check_out: checkOut, guests: String(guests), rooms: String(rooms) })
      router.push(`/booking/new?${params.toString()}`)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-4 py-8">
        <div className="shimmer h-96 rounded-3xl mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="shimmer h-8 w-2/3 rounded-xl" />
            <div className="shimmer h-4 w-1/2 rounded-xl" />
            <div className="shimmer h-32 rounded-2xl" />
          </div>
          <div className="shimmer h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  )

  if (!hotel) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="text-center pt-16">
        <div className="text-6xl mb-4">🏨</div>
        <h2 className="font-poppins font-bold text-2xl">Hotel not found</h2>
      </div>
    </div>
  )

  const images: string[] = (() => {
    function fixUrl(url: string): string {
      const match = url.match(/https?:\/\/[^/]+\/storage\/(https?:\/\/.+)/)
      return match ? match[1] : url
    }
    const raw = hotel.images || hotel.image
    if (Array.isArray(raw)) return raw.map(s => fixUrl(String(s))).filter(Boolean)
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw)
        if (Array.isArray(p)) return p.map(s => fixUrl(String(s))).filter(Boolean)
      } catch { /* ignore */ }
      return [fixUrl(raw)]
    }
    // Also try gallery images as fallback
    const gallery = hotel.gallery as Array<{ items?: Array<{ url?: string }> }> | undefined
    if (Array.isArray(gallery)) {
      const galleryUrls: string[] = []
      gallery.forEach(cat => {
        cat.items?.forEach(item => {
          if (item.url) galleryUrls.push(fixUrl(item.url))
        })
      })
      if (galleryUrls.length > 0) return galleryUrls
    }
    return [parseHotelImage(raw)]
  })()

  const amenities = (hotel.amenities as string[]) || []
  const roomTypes = (hotel.room_types as Record<string, unknown>[]) || []
  const reviews = (hotel.reviews as Record<string, unknown>[]) || []
  const rating = Number(hotel.rating || 0)
  const price = Number(hotel.min_price || hotel.price || 0)

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1
  const totalPrice = pricePreview ? Number(pricePreview.total || 0) : price * nights * rooms

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Image gallery */}
        <div className="relative h-80 md:h-[480px] bg-gray-200 overflow-hidden">
          {images.length > 0 && (
            <img src={images[imgIdx]} alt={String(hotel.name)} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-card hover:bg-white transition-all">
                <FiChevronLeft />
              </button>
              <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-card hover:bg-white transition-all">
                <FiChevronRight />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white w-5' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-card hover:bg-white">
              <FiHeart className="text-primary" />
            </button>
            <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-card hover:bg-white">
              <FiShare2 className="text-dark-gray" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="card p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-poppins font-bold text-2xl text-dark-gray">{String(hotel.name)}</h1>
                    <div className="flex items-center gap-1.5 mt-2">
                      <FiMapPin className="text-primary text-sm" />
                      <span className="text-sm text-gray-500">{String(hotel.address || `${hotel.city || ''}, ${hotel.state || ''}`)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <FiStar className="text-gold fill-gold" />
                      <span className="font-bold text-dark-gray">{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{String(hotel.total_reviews || 0)} reviews</span>
                  </div>
                </div>

                {/* Amenities chips */}
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {amenities.slice(0, 8).map((a, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-xs bg-surface text-gray-600 font-medium px-3 py-1.5 rounded-xl">
                        {AMENITY_ICONS[a] || '✓'} {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card mb-6">
                {(['overview', 'rooms', 'reviews', 'policies'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-primary text-white' : 'text-gray-500 hover:text-dark-gray'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="card p-6 space-y-4">
                  <h3 className="font-poppins font-semibold text-lg">About this hotel</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {String(hotel.description || hotel.about || 'Experience luxury and comfort at its finest. This hotel offers world-class amenities and exceptional service to make your stay unforgettable.')}
                  </p>
                  {!!hotel.check_in_time && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-[#F0F2F5] rounded-2xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Check-in</p>
                        <p className="font-semibold text-dark-gray">{String(hotel.check_in_time)}</p>
                      </div>
                      <div className="bg-[#F0F2F5] rounded-2xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Check-out</p>
                        <p className="font-semibold text-dark-gray">{String(hotel.check_out_time || '12:00 PM')}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="space-y-4">
                  {roomTypes.length > 0 ? roomTypes.map((room, i) => (
                    <div key={i} className="card p-5 flex gap-4">
                      <div className="w-28 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-[#F0F2F5]">
                        {!!room.image && <img src={String(room.image)} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-dark-gray">{String(room.name || room.type)}</h4>
                          {!!room.hourly_available && (
                            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-lg">⏰ Hourly</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{String(room.description || '')}</p>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary text-lg">₹{Number(room.base_price || room.price || 0).toLocaleString()}<span className="text-xs text-gray-400 font-normal">/night</span></span>
                            {!!(room.hourly_available && room.hourly_price) && (
                              <span className="text-sm text-blue-600 font-semibold">₹{Number(room.hourly_price).toLocaleString()}<span className="text-xs text-blue-400 font-normal">/hr</span></span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setBookingType('nightly'); document.querySelector('.sticky')?.scrollIntoView({ behavior: 'smooth' }) }}
                              className="btn-primary text-xs py-2 px-3">Book Night</button>
                            {!!room.hourly_available && (
                              <button onClick={() => { setBookingType('hourly'); setHourlyRoomId(String(room.id)); document.querySelector('.sticky')?.scrollIntoView({ behavior: 'smooth' }) }}
                                className="text-xs py-2 px-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors">Book Hour</button>
                            )}
                          </div>
                        </div>
                        {!!(room.hourly_available && room.min_hours) && (
                          <p className="text-xs text-gray-400 mt-1">Hourly: min {String(room.min_hours)}h – max {String(room.max_hours)}h</p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="card p-8 text-center text-gray-400">No room types available</div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((r, i) => (
                    <div key={i} className="card p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">{String(r.user_name || r.name || 'U')[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-dark-gray">{String(r.user_name || r.name || 'Guest')}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <FiStar key={j} className={`text-xs ${j < Number(r.rating || 0) ? 'text-gold fill-gold' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">{formatDate(String(r.created_at || ''))}</span>
                      </div>
                      <p className="text-sm text-gray-600">{String(r.comment || r.review || '')}</p>
                    </div>
                  )) : (
                    <div className="card p-8 text-center text-gray-400">No reviews yet</div>
                  )}
                </div>
              )}

              {activeTab === 'policies' && (
                <div className="card p-6 space-y-4">
                  {[
                    ['Check-in', String(hotel.check_in_time || '2:00 PM')],
                    ['Check-out', String(hotel.check_out_time || '12:00 PM')],
                    ['Cancellation', String(hotel.cancellation_policy || 'Free cancellation up to 24 hours before check-in')],
                    ['Pets', String(hotel.pet_policy || 'Pets not allowed')],
                    ['Smoking', String(hotel.smoking_policy || 'Non-smoking property')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <FiCheck className="text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-dark-gray">{k}</p>
                        <p className="text-sm text-gray-500">{v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking card */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                {/* Booking type toggle */}
                <div className="flex bg-surface rounded-2xl p-1 mb-4">
                  {(['nightly', 'hourly'] as const).map(t => (
                    <button key={t} onClick={() => setBookingType(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${bookingType === t ? 'bg-primary text-white' : 'text-gray-500'}`}>
                      {t === 'nightly' ? '🌙 Nightly' : '⏰ Hourly'}
                    </button>
                  ))}
                </div>

                {bookingType === 'nightly' ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="font-poppins font-extrabold text-2xl text-primary">₹{price.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">/night</span>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-semibold text-dark-gray mb-1.5 block flex items-center gap-1">
                          <FiCalendar className="text-primary" /> Check-in
                        </label>
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split('T')[0]} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark-gray mb-1.5 block flex items-center gap-1">
                          <FiCalendar className="text-primary" /> Check-out
                        </label>
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                          min={checkIn || new Date().toISOString().split('T')[0]} className="input-field text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-dark-gray mb-1.5 block flex items-center gap-1">
                            <FiUsers className="text-primary" /> Guests
                          </label>
                          <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="input-field text-sm">
                            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-dark-gray mb-1.5 block">Rooms</label>
                          <select value={rooms} onChange={e => setRooms(Number(e.target.value))} className="input-field text-sm">
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    {checkIn && checkOut && (
                      <div className="bg-surface rounded-2xl p-4 mb-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>₹{price.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''} × {rooms} room{rooms > 1 ? 's' : ''}</span>
                          <span>₹{(price * nights * rooms).toLocaleString()}</span>
                        </div>
                        {!!pricePreview?.tax && (
                          <div className="flex justify-between text-gray-600">
                            <span>Taxes &amp; fees</span>
                            <span>₹{Number(pricePreview.tax).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-dark-gray border-t border-gray-200 pt-2">
                          <span>Total</span>
                          <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Hourly booking form */}
                    {(() => {
                      const hourlyRooms = roomTypes.filter(r => r.hourly_available && r.hourly_price)
                      if (hourlyRooms.length === 0) return (
                        <div className="text-center py-4 text-sm text-gray-400 bg-surface rounded-2xl mb-4">
                          No rooms available for hourly booking
                        </div>
                      )
                      const selectedRoom = hourlyRooms.find(r => String(r.id) === hourlyRoomId) || hourlyRooms[0]
                      const hourlyPrice = Number(selectedRoom?.hourly_price || 0)
                      const minH = Number(selectedRoom?.min_hours || 1)
                      const maxH = Number(selectedRoom?.max_hours || 12)
                      const startH = parseInt(hourlyStart)
                      const endH = parseInt(hourlyEnd)
                      const totalHours = endH > startH ? endH - startH : 0
                      const hourlyTotal = hourlyPreview ? Number(hourlyPreview.total_price || 0) : hourlyPrice * totalHours

                      return (
                        <>
                          <div className="flex items-baseline gap-1 mb-4">
                            <span className="font-poppins font-extrabold text-2xl text-primary">₹{hourlyPrice.toLocaleString()}</span>
                            <span className="text-sm text-gray-400">/hour</span>
                          </div>
                          <div className="space-y-3 mb-4">
                            <div>
                              <label className="text-xs font-semibold text-dark-gray mb-1.5 block">Room Type</label>
                              <select value={hourlyRoomId || String(hourlyRooms[0]?.id || '')}
                                onChange={e => setHourlyRoomId(e.target.value)} className="input-field text-sm">
                                {hourlyRooms.map(r => (
                                  <option key={String(r.id)} value={String(r.id)}>
                                    {String(r.name)} — ₹{Number(r.hourly_price)}/hr
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-dark-gray mb-1.5 block flex items-center gap-1">
                                <FiCalendar className="text-primary" /> Date
                              </label>
                              <input type="date" value={hourlyDate} onChange={e => setHourlyDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} className="input-field text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-dark-gray mb-1.5 block">Check-in Time</label>
                                <input type="time" value={hourlyStart} onChange={e => setHourlyStart(e.target.value)} className="input-field text-sm" />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-dark-gray mb-1.5 block">Check-out Time</label>
                                <input type="time" value={hourlyEnd} onChange={e => setHourlyEnd(e.target.value)} className="input-field text-sm" />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-dark-gray mb-1.5 block flex items-center gap-1">
                                <FiUsers className="text-primary" /> Guests
                              </label>
                              <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="input-field text-sm">
                                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                          </div>
                          {totalHours > 0 && (
                            <div className="bg-surface rounded-2xl p-4 mb-4 space-y-2 text-sm">
                              <div className="flex justify-between text-gray-600">
                                <span>{totalHours} hour{totalHours > 1 ? 's' : ''} × ₹{hourlyPrice.toLocaleString()}</span>
                                <span>₹{(hourlyPrice * totalHours).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-bold text-dark-gray border-t border-gray-200 pt-2">
                                <span>Total</span>
                                <span className="text-primary">₹{hourlyTotal.toLocaleString()}</span>
                              </div>
                              {(totalHours < minH || totalHours > maxH) && (
                                <p className="text-xs text-red-500">Min {minH}h – Max {maxH}h for this room</p>
                              )}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </>
                )}

                <button onClick={handleBook} className="btn-primary w-full flex items-center justify-center gap-2">
                  {bookingType === 'hourly' ? '⏰ Book by Hour' : 'Book Now'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  {bookingType === 'hourly' ? '10-min hold · Pay to confirm' : 'Free cancellation · No hidden fees'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
