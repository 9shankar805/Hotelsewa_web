'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiLink, FiXCircle } from 'react-icons/fi'
import Link from 'next/link'

const PROVIDERS = [
  { id: 'google', name: 'Google', icon: '🔵', color: '#4285F4', connected: true, email: 'user@gmail.com' },
  { id: 'facebook', name: 'Facebook', icon: '🔷', color: '#1877F2', connected: false, email: null },
  { id: 'apple', name: 'Apple', icon: '⚫', color: '#000000', connected: false, email: null },
  { id: 'phone', name: 'Phone Number', icon: '📱', color: '#52C41A', connected: true, email: '+91 98765 43210' },
]

export default function LinkedAccountsPage() {
  const [providers, setProviders] = useState(PROVIDERS)

  function toggle(id: string) {
    const p = providers.find(p => p.id === id)
    if (!p) return
    if (p.connected) {
      if (!confirm(`Unlink ${p.name}?`)) return
      setProviders(prev => prev.map(x => x.id === id ? { ...x, connected: false, email: null } : x))
      toast.success(`${p.name} unlinked`)
    } else {
      setProviders(prev => prev.map(x => x.id === id ? { ...x, connected: true, email: `user@${id}.com` } : x))
      toast.success(`${p.name} linked successfully`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Linked Accounts</h1>
        </div>

        <p className="text-sm text-gray-500 mb-5">Link your accounts for faster sign-in and to sync your data.</p>

        <div className="space-y-3">
          {providers.map(p => (
            <div key={p.id} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-surface flex-shrink-0">
                {p.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-gray">{p.name}</p>
                <p className="text-xs text-gray-400">{p.connected ? p.email : 'Not connected'}</p>
              </div>
              <button onClick={() => toggle(p.id)}
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${p.connected ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}>
                {p.connected ? <><FiXCircle className="text-xs" /> Unlink</> : <><FiLink className="text-xs" /> Link</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
