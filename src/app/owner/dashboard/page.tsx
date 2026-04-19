'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { formatPrice, formatDate } from '@/lib/utils'
import { StatCardShimmer, TableRowShimmer } from '@/components/Shimmer'
import { FiCalendar, FiDollarSign, FiUsers, FiArrowUp, FiArrowRight, FiTrendingUp } from 'react-icons/fi'
import { MdHotel, MdBedroomParent } from 'react-icons/md'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

// Re-export getGreeting from utils
function useGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const PERIODS = [['Today', 'today'], ['Week', 'week'], ['Month', 'month'], ['Year', 'year']]

export default function OwnerDashboard() {
  const user = getUser()
  const greeting = useGreeting()
  const [period, setPeriod] = useState('today')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
  const [earnings, setEarnings] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [period])

  async function loadDashboard() {
    setLoading(true)
    try {
      const [dashRes, bookRes] = await Promise.all([
        ownerApi.getDashboard(period),
        ownerApi.getBookings({ limit: 5 }),
      ])
      const d = dashRes.data?.data || dashRes.data
      setData(d)
      const earningsRaw = d?.earnings_chart || d?.chart || []
      setEarnings(Array.isArray(earningsRaw) ? earningsRaw : [])
      const bRaw = bookRes.data?.data
      setBookings(Array.isArray(bRaw) ? bRaw.slice(0, 5) : Array.isArray(bRaw?.data) ? bRaw.data.slice(0, 5) : [])
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Total Bookings', value: String(data?.total_bookings || data?.bookings || '0'), change: String(data?.bookings_change || '+0%'), icon: FiCalendar, gradient: 'from-primary to-primary-light' },
    { label: 'Occupancy Rate', value: `${Number(data?.occupancy_rate || data?.occupancy || 0).toFixed(0)}%`, change: String(data?.occupancy_change || '+0%'), icon: MdBedroomParent, gradient: 'from-blue-500 to-blue-400' },
    { label: 'Revenue', value: formatPrice(Number(data?.revenue || data?.total_revenue || 0)), change: String(data?.revenue_change || '+0%'), icon: FiDollarSign, gradient: 'from-green-500 to-green-400' },
    { label: 'Active Guests', value: String(data?.active_guests || data?.guests || '0'), change: String(data?.guests_change || '+0%'), icon: FiUsers, gradient: 'from-orange-500 to-orange-400' },
  ]

  const quickLinks = [
    { href: '/owner/analytics', icon: FiTrendingUp, label: 'Analytics', color: '#1890FF' },
    { href: '/owner/bookings', icon: FiCalendar, label: 'Bookings', color: '#E60023' },
    { href: '/owner/rooms', icon: MdBedroomParent, label: 'Rooms', color: '#52C41A' },
    { href: '/owner/earnings', icon: FiDollarSign, label: 'Earnings', color: '#FA8C16' },
  ]

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">{greeting}, {user?.name?.split(' ')[0] || 'Owner'} 👋</p>
            <h1 className="font-poppins font-bold text-2xl mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <MdHotel className="text-white text-2xl" />
          </div>
        </div>
        <div className="mt-4 bg-white/15 rounded-2xl p-3 flex items-center gap-3 border border-white/20">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <MdHotel className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white/70 text-xs">Your Property</p>
            <p className="text-white font-semibold text-sm">Hotel Dashboard</p>
          </div>
          <span className="flex items-center gap-1 bg-green-500/25 text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-400/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Active
          </span>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex bg-white rounded-2xl p-1 shadow-card mb-6 w-fit">
        {PERIODS.map(([label, val]) => (
          <button key={val} onClick={() => setPeriod(val)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${period === val ? 'bg-primary text-white' : 'text-gray-500 hover:text-dark-gray'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardShimmer key={i} />) :
          stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                    <Icon className="text-white text-base" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <FiArrowUp className="text-xs" /> {s.change.replace('+', '').replace('-', '')}
                  </span>
                </div>
                <p className="font-poppins font-extrabold text-2xl text-dark-gray">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            )
          })
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Earnings chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-poppins font-semibold text-dark-gray">Earnings Overview</h3>
            <Link href="/owner/earnings" className="text-xs text-primary font-semibold flex items-center gap-1">View all <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div className="shimmer h-48 rounded-2xl" />
          ) : earnings.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={earnings}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E60023" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E60023" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="amount" stroke="#E60023" strokeWidth={2} fill="url(#earningsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No earnings data available</div>
          )}
        </div>

        {/* Quick access */}
        <div className="card p-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface hover:shadow-card transition-all group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon style={{ color }} className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-dark-gray">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-poppins font-semibold text-dark-gray">Recent Bookings</h3>
          <Link href="/owner/bookings" className="text-xs text-primary font-semibold flex items-center gap-1">View all <FiArrowRight /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <TableRowShimmer key={i} cols={6} />) :
                bookings.length > 0 ? bookings.map((b, i) => {
                  const guest = (b.user as Record<string, unknown>) || {}
                  const room = (b.room as Record<string, unknown>) || {}
                  const status = String(b.status || 'pending')
                  const statusColors: Record<string, string> = {
                    confirmed: 'text-green-600 bg-green-50', pending: 'text-yellow-600 bg-yellow-50',
                    cancelled: 'text-red-600 bg-red-50', completed: 'text-blue-600 bg-blue-50',
                  }
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-surface transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {String(guest.name || b.guest_name || 'G')[0]}
                          </div>
                          <span className="font-medium text-dark-gray">{String(guest.name || b.guest_name || 'Guest')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{String(room.name || room.type || b.room_type || '-')}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(String(b.check_in || b.checkIn || ''))}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(String(b.check_out || b.checkOut || ''))}</td>
                      <td className="py-3 px-4 font-semibold text-dark-gray">₹{Number(b.total_price || b.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${statusColors[status.toLowerCase()] || 'text-gray-600 bg-gray-50'}`}>{status}</span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No recent bookings</td></tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
