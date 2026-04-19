'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { FiDownload, FiFileText } from 'react-icons/fi'

export default function ReportsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => { loadReports() }, [period])

  async function loadReports() {
    setLoading(true)
    try {
      const res = await ownerApi.getReports({ period })
      setData(res.data?.data || res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const summaryItems = [
    ['Total Bookings', String(data?.total_bookings || '0')],
    ['Total Revenue', `₹${Number(data?.total_revenue || 0).toLocaleString()}`],
    ['Avg Booking Value', `₹${Number(data?.avg_booking_value || 0).toLocaleString()}`],
    ['Cancellation Rate', `${Number(data?.cancellation_rate || 0).toFixed(1)}%`],
    ['Occupancy Rate', `${Number(data?.occupancy_rate || 0).toFixed(1)}%`],
    ['New Guests', String(data?.new_guests || '0')],
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Reports</h1>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="bg-white rounded-2xl px-4 py-2.5 text-sm font-medium shadow-card outline-none">
            {[['week', 'This Week'], ['month', 'This Month'], ['quarter', 'This Quarter'], ['year', 'This Year']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 btn-primary text-sm py-2.5">
            <FiDownload /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <div className="shimmer h-4 w-1/2 rounded-lg" />
              <div className="shimmer h-7 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {summaryItems.map(([label, value]) => (
              <div key={label} className="card p-5">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="font-poppins font-bold text-2xl text-dark-gray">{value}</p>
              </div>
            ))}
          </div>

          {!data && (
            <div className="text-center py-16">
              <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No report data available for this period</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
