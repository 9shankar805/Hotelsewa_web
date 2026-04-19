'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiSearch, FiCheckCircle, FiClock, FiUser, FiCalendar } from 'react-icons/fi'
import { MdQrCode2 } from 'react-icons/md'

interface Booking {
  id: string | number
  guest_name?: string
  user?: { name?: string }
  room?: { name?: string; type?: string }
  room_type?: string
  check_in?: string
  check_out?: string
  status?: string
  checkin_status?: string
  qr_code?: string
}

export default function CheckinPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [qrModal, setQrModal] = useState<Booking | null>(null)
  const [tab, setTab] = useState<'today' | 'upcoming' | 'checkedin'>('today')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await ownerApi.getBookings({ limit: 50 })
      const raw = res.data?.data
      setBookings(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch { setBookings([]) }
    finally { setLoading(false) }
  }

  async function handleCheckin(id: string | number) {
    try {
      await ownerApi.updateBookingStatus(String(id), 'checked_in')
      toast.success('Guest checked in successfully')
      load()
    } catch { toast.error('Failed to check in guest') }
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = bookings.filter(b => {
    const name = String(b.guest_name || b.user?.name || '').toLowerCase()
    const matchSearch = name.includes(search.toLowerCase())
    const checkIn = String(b.check_in || '').split('T')[0]
    if (tab === 'today') return matchSearch && checkIn === today
    if (tab === 'upcoming') return matchSearch && checkIn > today
    if (tab === 'checkedin') return matchSearch && (b.checkin_status === 'checked_in' || b.status === 'checked_in')
    return matchSearch
  })

  const TABS = [
    { key: 'today', label: "Today's Arrivals" },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'checkedin', label: 'Checked In' },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Check-in Management</h1>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-card border border-gray-100 w-64">
          <FiSearch className="text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search guest..." className="flex-1 text-sm outline-none bg-transparent" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Today's Arrivals", value: bookings.filter(b => String(b.check_in || '').split('T')[0] === today).length, icon: FiCalendar, color: 'from-primary to-primary-light' },
          { label: 'Checked In', value: bookings.filter(b => b.status === 'checked_in' || b.checkin_status === 'checked_in').length, icon: FiCheckCircle, color: 'from-green-500 to-green-400' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'confirmed').length, icon: FiClock, color: 'from-orange-500 to-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="text-white" />
            </div>
            <p className="font-poppins font-bold text-2xl text-dark-gray">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 shadow-card mb-5 w-fit border border-gray-100">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-primary text-white' : 'text-gray-500 hover:text-dark-gray'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-20 rounded-2xl" />) :
          filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiUser className="text-5xl mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No guests found</p>
            </div>
          ) : filtered.map((b, i) => {
            const name = String(b.guest_name || b.user?.name || 'Guest')
            const room = String(b.room?.name || b.room?.type || b.room_type || '-')
            const isCheckedIn = b.status === 'checked_in' || b.checkin_status === 'checked_in'
            return (
              <div key={i} className="card p-4 flex items-center gap-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary text-lg flex-shrink-0">
                  {name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-gray">{name}</p>
                  <p className="text-xs text-gray-400">{room} · Check-in: {formatDate(String(b.check_in || ''))}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQrModal(b)}
                    className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                    <MdQrCode2 className="text-lg" />
                  </button>
                  {isCheckedIn ? (
                    <span className="badge text-green-600 bg-green-50 text-xs">Checked In</span>
                  ) : (
                    <button onClick={() => handleCheckin(b.id)}
                      className="btn-primary text-xs py-2 px-4">Check In</button>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center animate-fade-in">
            <h3 className="font-poppins font-bold text-xl mb-1">Check-in QR Code</h3>
            <p className="text-sm text-gray-400 mb-5">{String(qrModal.guest_name || qrModal.user?.name || 'Guest')}</p>
            <div className="w-48 h-48 bg-surface rounded-2xl mx-auto flex items-center justify-center mb-5">
              {qrModal.qr_code ? (
                <img src={qrModal.qr_code} alt="QR" className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <MdQrCode2 className="text-8xl text-gray-300" />
              )}
            </div>
            <p className="text-xs text-gray-400 mb-5">Booking ID: #{String(qrModal.id)}</p>
            <button onClick={() => setQrModal(null)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
