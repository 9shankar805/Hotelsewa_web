'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiDownload, FiFileText, FiDollarSign } from 'react-icons/fi'

interface TaxReport {
  period: string
  revenue: number
  gst_collected: number
  gst_rate: number
  taxable_amount: number
  status: 'filed' | 'pending' | 'overdue'
}

const SAMPLE: TaxReport[] = [
  { period: 'March 2025', revenue: 185000, gst_collected: 33300, gst_rate: 18, taxable_amount: 151700, status: 'filed' },
  { period: 'February 2025', revenue: 142000, gst_collected: 25560, gst_rate: 18, taxable_amount: 116440, status: 'filed' },
  { period: 'January 2025', revenue: 198000, gst_collected: 35640, gst_rate: 18, taxable_amount: 162360, status: 'pending' },
  { period: 'December 2024', revenue: 220000, gst_collected: 39600, gst_rate: 18, taxable_amount: 180400, status: 'filed' },
  { period: 'November 2024', revenue: 165000, gst_collected: 29700, gst_rate: 18, taxable_amount: 135300, status: 'overdue' },
]

const STATUS_COLORS: Record<string, string> = {
  filed: 'text-green-600 bg-green-50',
  pending: 'text-orange-600 bg-orange-50',
  overdue: 'text-red-600 bg-red-50',
}

export default function TaxReportsPage() {
  const [reports, setReports] = useState<TaxReport[]>(SAMPLE)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState('2025')

  useEffect(() => { load() }, [year])

  async function load() {
    setLoading(true)
    try {
      const res = await ownerApi.getReports({ type: 'tax', year })
      const raw = res.data?.data || res.data
      if (Array.isArray(raw) && raw.length > 0) setReports(raw)
    } catch { /* use sample */ }
    finally { setLoading(false) }
  }

  const totalRevenue = reports.reduce((s, r) => s + r.revenue, 0)
  const totalGst = reports.reduce((s, r) => s + r.gst_collected, 0)

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Tax Reports</h1>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(e.target.value)} className="input-field py-2 text-sm w-28">
            {['2025', '2024', '2023'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => toast.success('Downloading annual tax report...')}
            className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'from-primary to-primary-light' },
          { label: 'GST Collected', value: `₹${totalGst.toLocaleString()}`, icon: FiFileText, color: 'from-orange-500 to-orange-400' },
          { label: 'Net Revenue', value: `₹${(totalRevenue - totalGst).toLocaleString()}`, icon: FiDollarSign, color: 'from-green-500 to-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="text-white text-sm" />
            </div>
            <p className="font-poppins font-bold text-xl text-dark-gray">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* GST Info */}
      <div className="card p-5 mb-5 bg-blue-50 border border-blue-100">
        <p className="font-semibold text-blue-800 mb-1">GST Information</p>
        <p className="text-sm text-blue-600">Hotels with tariff ₹1,000–₹7,500/night: 12% GST. Above ₹7,500/night: 18% GST. File GSTR-1 by 11th and GSTR-3B by 20th of each month.</p>
      </div>

      {/* Reports table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-surface">
                {['Period', 'Revenue', 'GST Rate', 'GST Collected', 'Net Amount', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="shimmer h-5 rounded-lg" /></td></tr>
              )) : reports.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-surface transition-colors">
                  <td className="py-3 px-4 font-medium text-dark-gray">{r.period}</td>
                  <td className="py-3 px-4 text-gray-600">₹{r.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600">{r.gst_rate}%</td>
                  <td className="py-3 px-4 font-semibold text-orange-600">₹{r.gst_collected.toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-dark-gray">₹{r.taxable_amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`badge text-xs capitalize ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => toast.success(`Downloading ${r.period} report...`)}
                      className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <FiDownload className="text-gray-400 text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
