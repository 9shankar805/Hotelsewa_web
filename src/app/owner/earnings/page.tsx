'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { StatCardShimmer } from '@/components/Shimmer'
import { FiDollarSign, FiTrendingUp, FiArrowUp, FiDownload } from 'react-icons/fi'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PERIODS = [['Week', 'week'], ['Month', 'month'], ['Quarter', 'quarter'], ['Year', 'year']]

export default function EarningsPage() {
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadEarnings() }, [period])

  async function loadEarnings() {
    setLoading(true)
    try {
      const [earRes, txRes] = await Promise.all([
        ownerApi.getEarnings({ period }),
        ownerApi.getTransactions(),
      ])
      setData(earRes.data?.data || earRes.data)
      const txRaw = txRes.data?.data
      setTransactions(Array.isArray(txRaw) ? txRaw.slice(0, 10) : [])
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const chartData = (data?.chart as Record<string, unknown>[]) || (data?.earnings_chart as Record<string, unknown>[]) || []
  const stats = [
    { label: 'Total Earnings', value: formatPrice(Number(data?.total || data?.total_earnings || 0)), icon: FiDollarSign, color: 'from-primary to-primary-light' },
    { label: 'This Period', value: formatPrice(Number(data?.period_earnings || data?.current || 0)), icon: FiTrendingUp, color: 'from-green-500 to-green-400' },
    { label: 'Pending Payout', value: formatPrice(Number(data?.pending || data?.pending_payout || 0)), icon: FiDollarSign, color: 'from-orange-500 to-orange-400' },
    { label: 'Avg per Booking', value: formatPrice(Number(data?.avg_per_booking || data?.average || 0)), icon: FiArrowUp, color: 'from-blue-500 to-blue-400' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Earnings</h1>
        <button className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-card text-sm font-medium hover:shadow-md transition-all">
          <FiDownload className="text-primary" /> Export
        </button>
      </div>

      {/* Period */}
      <div className="flex bg-white rounded-2xl p-1 shadow-card mb-6 w-fit">
        {PERIODS.map(([label, val]) => (
          <button key={val} onClick={() => setPeriod(val)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${period === val ? 'bg-primary text-white' : 'text-gray-500'}`}>
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
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <Icon className="text-white" />
                </div>
                <p className="font-poppins font-extrabold text-2xl text-dark-gray">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            )
          })
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Area chart */}
        <div className="card p-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-5">Revenue Trend</h3>
          {loading ? <div className="shimmer h-48 rounded-2xl" /> :
            chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E60023" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#E60023" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="amount" stroke="#E60023" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          }
        </div>

        {/* Bar chart */}
        <div className="card p-6">
          <h3 className="font-poppins font-semibold text-dark-gray mb-5">Bookings vs Revenue</h3>
          {loading ? <div className="shimmer h-48 rounded-2xl" /> :
            chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#E60023" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          }
        </div>
      </div>

      {/* Transactions */}
      <div className="card p-6">
        <h3 className="font-poppins font-semibold text-dark-gray mb-5">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {['Transaction ID', 'Guest', 'Amount', 'Type', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="shimmer h-4 rounded-lg" /></td></tr>
              )) : transactions.length > 0 ? transactions.map((tx, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-surface/50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">#{String(tx.id || '').slice(-8)}</td>
                  <td className="py-3 px-4 font-medium text-dark-gray">{String((tx.user as Record<string, unknown>)?.name || tx.guest_name || 'Guest')}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">₹{Number(tx.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{String(tx.type || 'payment')}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(String(tx.created_at || '')).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4"><span className="badge text-green-600 bg-green-50">{String(tx.status || 'completed')}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
