'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => { loadBookings() }, [currentDate])

  async function loadBookings() {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
      const res = await ownerApi.getCalendar({ startDate, endDate })
      const raw = res.data?.data
      setBookings(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch { setBookings([]) } finally { setLoading(false) }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  function getBookingsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.filter(b => {
      const checkIn = String(b.check_in || b.checkIn || '').split('T')[0]
      const checkOut = String(b.check_out || b.checkOut || '').split('T')[0]
      return checkIn <= dateStr && checkOut >= dateStr
    })
  }

  const today = new Date()
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Booking Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center hover:bg-surface transition-all">
            <FiChevronLeft />
          </button>
          <span className="font-poppins font-semibold text-dark-gray min-w-40 text-center">{monthName}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center hover:bg-surface transition-all">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="card p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayBookings = getBookingsForDay(day)
            const hasBookings = dayBookings.length > 0
            return (
              <div key={day} className={`min-h-16 p-1.5 rounded-xl border transition-all ${isToday(day) ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-surface'}`}>
                <span className={`text-xs font-semibold block mb-1 ${isToday(day) ? 'text-primary' : 'text-dark-gray'}`}>{day}</span>
                {loading ? null : dayBookings.slice(0, 2).map((b, bi) => (
                  <div key={bi} className={`text-xs px-1.5 py-0.5 rounded-md mb-0.5 truncate ${getStatusColor(String(b.status || 'confirmed'))}`}>
                    {String((b.user as Record<string, unknown>)?.name || b.guest_name || 'Guest').split(' ')[0]}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-xs text-gray-400 px-1">+{dayBookings.length - 2} more</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming bookings list */}
      <div className="mt-6 card p-5">
        <h3 className="font-poppins font-semibold text-dark-gray mb-4 flex items-center gap-2">
          <FiCalendar className="text-primary" /> This Month&apos;s Bookings
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="shimmer w-12 h-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-1/2 rounded-lg" />
                  <div className="shimmer h-3 w-1/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No bookings this month</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 10).map((b, i) => {
              const guest = (b.user as Record<string, unknown>) || {}
              const status = String(b.status || 'pending')
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{String(guest.name || 'G')[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-gray">{String(guest.name || b.guest_name || 'Guest')}</p>
                    <p className="text-xs text-gray-400">{formatDate(String(b.check_in || ''))} → {formatDate(String(b.check_out || ''))}</p>
                  </div>
                  <span className={`badge text-xs ${getStatusColor(status)}`}>{status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
