'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { StatCardShimmer } from '@/components/Shimmer'
import { FiTrendingUp, FiUsers, FiStar } from 'react-icons/fi'
import { MdBedroomParent } from 'react-icons/md'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#E60023', '#1890FF', '#52C41A', '#FA8C16', '#722ED1']
const PERIODS = [['Week', 'week'], ['Month', 'month'], ['Year', 'year']]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAnalytics() }, [period])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const res = await ownerApi.getAnalytics({ period })
      setData(res.data?.data || res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const bookingTrend = (data?.booking_trend as Record<string, unknown>[]) || []
  const roomTypeData = (data?.room_type_distribution as Record<string, unknown>[]) || []
  const guestOrigin = (data?.guest_origin as Record<string, unknown>[]) || []

  const stats = [
    { label: 'Total Bookings', value: String(data?.total_bookings || '0'), icon: MdBedroomParent, color: 'text-primary bg-primary/10' },
    { label: 'Unique Guests', value: String(data?.unique_guests || '0'), icon: FiUsers, color: 'text-blue-600 bg-blue-50' },
    { label: 'Avg Rating', value: `${Number(data?.avg_rating || 0).toFixed(1)}★`, icon: FiStar, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Occupancy', value: `${Number(data?.occupancy_rate || 0).toFixed(0)}%`, icon: FiTrendingUp, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Analytics</h1>
        <div className="flex bg-white rounded-2xl p-1 shadow-card">
          {PERIODS.map(([label, val]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === val ? 'bg-primary text-white' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardShimmer key={i} />) :
          stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <Icon className="text-lg" />
                </div>
                <p className="font-poppins font-extrabold text-2xl text-dark-gray">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            )
          })
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Booking trend */}
        <div className="card p-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-5">Booking Trend</h3>
          {loading ? <div className="shimmer h-52 rounded-2xl" /> :
            bookingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#E60023" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          }
        </div>

        {/* Room type distribution */}
        <div className="card p-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-5">Room Type Distribution</h3>
          {loading ? <div className="shimmer h-52 rounded-2xl" /> :
            roomTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={roomTypeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                    {roomTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          }
        </div>
      </div>

      {/* Guest origin */}
      {!loading && guestOrigin.length > 0 && (
        <div className="card p-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-5">Guest Origin</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={guestOrigin} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#E60023" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
