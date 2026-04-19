'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { profileApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { FiArrowUpRight, FiArrowDownLeft, FiCreditCard, FiPlus } from 'react-icons/fi'
import { MdAccountBalanceWallet } from 'react-icons/md'

export default function WalletPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login?redirect=/wallet'); return }
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await profileApi.getWalletTransactions()
      const raw = res.data?.data
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
      setTransactions(list)
      const bal = list.reduce((sum: number, t: Record<string, unknown>) => {
        const amt = Number(t.amount || 0)
        return String(t.type) === 'credit' ? sum + amt : sum - amt
      }, 0)
      setBalance(Math.max(0, bal))
    } catch { setTransactions([]) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">My Wallet</h1>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white mb-6 shadow-primary">
          <div className="flex items-center gap-3 mb-4">
            <MdAccountBalanceWallet className="text-2xl text-white/80" />
            <span className="text-white/80 text-sm">Available Balance</span>
          </div>
          <p className="font-poppins font-extrabold text-4xl">₹{balance.toLocaleString()}</p>
          <div className="flex gap-3 mt-5">
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition-all rounded-2xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 border border-white/30">
              <FiPlus /> Add Money
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition-all rounded-2xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 border border-white/30">
              <FiCreditCard /> Withdraw
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="card p-5">
          <h3 className="font-poppins font-semibold text-dark-gray mb-4">Transaction History</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="shimmer w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="shimmer h-4 w-2/3 rounded-lg" />
                    <div className="shimmer h-3 w-1/3 rounded-lg" />
                  </div>
                  <div className="shimmer h-5 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MdAccountBalanceWallet className="text-5xl mx-auto mb-3" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => {
                const isCredit = String(tx.type) === 'credit'
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
                      {isCredit ? <FiArrowDownLeft className="text-green-600" /> : <FiArrowUpRight className="text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-gray">{String(tx.description || tx.title || 'Transaction')}</p>
                      <p className="text-xs text-gray-400">{formatDate(String(tx.created_at || ''))}</p>
                    </div>
                    <span className={`font-semibold text-sm ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                      {isCredit ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
