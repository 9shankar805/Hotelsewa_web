'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import { TableRowShimmer } from '@/components/Shimmer'
import toast from 'react-hot-toast'
import { FiSearch, FiFilter, FiCheck, FiX, FiEye } from 'react-icons/fi'

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled']
const STATUS_MAP: Record<number, string | undefined> = { 1: 'pending', 2: 'confirmed', 3: 'checked_in', 4: 'completed', 5: 'cancelled' }

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)

  useEffect(() => { loadBookings() }, [tab])

  async function loadBookings() {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      if (tab > 0 && STATUS_MAP[tab]) params.status = STATUS_MAP[tab]
      const res = await ownerApi.getBookings(params)
      const raw = res.data?.data
      setBookings(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await ownerApi.updateBookingStatus(id, status)
      toast.success(`Booking ${status}`)
      loadBookings()
      setSelected(null)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = bookings.filter(b => {
    if (!search) return true
    const guest = (b.user as Record<string, unknown>) || {}
    return String(guest.name || b.guest_name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(b.id || '').includes(search)
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Bookings</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-card">
            <FiSearch className="text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search guest, ID..." className="bg-transparent text-sm outline-none w-48" />
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === i ? 'bg-primary text-white' : 'bg-white text-gray-600 shadow-card'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {['Booking ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 8 }).map((_, i) => <TableRowShimmer key={i} cols={8} />) :
                filtered.length > 0 ? filtered.map((b, i) => {
                  const guest = (b.user as Record<string, unknown>) || {}
                  const room = (b.room as Record<string, unknown>) || {}
                  const status = String(b.status || 'pending')
                  return (
                    <tr key={i} className="border-t border-gray-50 hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">#{String(b.id || '').slice(-6)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {String(guest.name || b.guest_name || 'G')[0]}
                          </div>
                          <div>
                            <p className="font-medium text-dark-gray">{String(guest.name || b.guest_name || 'Guest')}</p>
                            <p className="text-xs text-gray-400">{String(guest.email || b.guest_email || '')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{String(room.name || room.type || b.room_type || '-')}</td>
                      <td className="py-3.5 px-4 text-gray-600">{formatDate(String(b.check_in || b.checkIn || ''))}</td>
                      <td className="py-3.5 px-4 text-gray-600">{formatDate(String(b.check_out || b.checkOut || ''))}</td>
                      <td className="py-3.5 px-4 font-semibold text-dark-gray">₹{Number(b.total_price || b.amount || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`badge ${getStatusColor(status)}`}>{status}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelected(b)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all" title="View">
                            <FiEye className="text-xs" />
                          </button>
                          {status === 'pending' && (
                            <button onClick={() => updateStatus(String(b.id), 'confirmed')} className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-all" title="Confirm">
                              <FiCheck className="text-xs" />
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(status) && (
                            <button onClick={() => updateStatus(String(b.id), 'cancelled')} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all" title="Cancel">
                              <FiX className="text-xs" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-400">No bookings found</td></tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-poppins font-bold text-xl">Booking Details</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center hover:bg-gray-200 transition-all">
                <FiX />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Booking ID', `#${String(selected.id || '').slice(-8)}`],
                ['Guest', String((selected.user as Record<string, unknown>)?.name || selected.guest_name || 'Guest')],
                ['Email', String((selected.user as Record<string, unknown>)?.email || selected.guest_email || '-')],
                ['Phone', String((selected.user as Record<string, unknown>)?.phone || selected.guest_phone || '-')],
                ['Room', String((selected.room as Record<string, unknown>)?.name || selected.room_type || '-')],
                ['Check-in', formatDate(String(selected.check_in || selected.checkIn || ''))],
                ['Check-out', formatDate(String(selected.check_out || selected.checkOut || ''))],
                ['Guests', String(selected.guests || 1)],
                ['Total Amount', `₹${Number(selected.total_price || selected.amount || 0).toLocaleString()}`],
                ['Status', String(selected.status || 'pending')],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-dark-gray">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              {String(selected.status) === 'pending' && (
                <button onClick={() => updateStatus(String(selected.id), 'confirmed')} className="btn-primary flex-1 text-sm py-2.5">
                  Confirm Booking
                </button>
              )}
              {String(selected.status) === 'confirmed' && (
                <button onClick={() => updateStatus(String(selected.id), 'checked_in')} className="btn-primary flex-1 text-sm py-2.5">
                  Check In
                </button>
              )}
              {String(selected.status) === 'checked_in' && (
                <button onClick={() => updateStatus(String(selected.id), 'completed')} className="btn-primary flex-1 text-sm py-2.5">
                  Check Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
