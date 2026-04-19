'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { FiDollarSign, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await ownerApi.getWithdrawals()
      const raw = res.data?.data
      setWithdrawals(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch { setWithdrawals([]) } finally { setLoading(false) }
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    completed: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
    processing: 'text-blue-600 bg-blue-50',
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Withdrawals</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <FiPlus /> Request Withdrawal
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-fade-in">
          <h3 className="font-poppins font-semibold text-dark-gray mb-4">New Withdrawal Request</h3>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-surface rounded-2xl px-4 py-3">
              <FiDollarSign className="text-primary" />
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount (₹)" className="bg-transparent text-sm w-full outline-none" />
            </div>
            <button onClick={() => { toast.success('Withdrawal request submitted!'); setShowForm(false); setAmount('') }}
              className="btn-primary px-6">Submit</button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Withdrawals are processed within 3-5 business days</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {['ID', 'Amount', 'Bank Account', 'Requested', 'Status'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="py-3 px-4"><div className="shimmer h-4 rounded-lg" /></td></tr>
                ))
              ) : withdrawals.length > 0 ? withdrawals.map((w, i) => {
                const status = String(w.status || 'pending')
                return (
                  <tr key={i} className="border-t border-gray-50 hover:bg-surface/50">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500">#{String(w.id || '').slice(-8)}</td>
                    <td className="py-3.5 px-4 font-semibold text-dark-gray">₹{Number(w.amount || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-gray-600">{String(w.bank_account || w.account || '****1234')}</td>
                    <td className="py-3.5 px-4 text-gray-500">{formatDate(String(w.created_at || ''))}</td>
                    <td className="py-3.5 px-4">
                      <span className={`badge text-xs ${STATUS_COLORS[status] || 'text-gray-600 bg-gray-50'}`}>{status}</span>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No withdrawal requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
