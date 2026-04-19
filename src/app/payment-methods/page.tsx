'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { isLoggedIn } from '@/lib/auth'
import { FiCreditCard, FiPlus, FiTrash2 } from 'react-icons/fi'
import { MdAccountBalance } from 'react-icons/md'
import toast from 'react-hot-toast'

const SAMPLE_CARDS = [
  { type: 'Visa', last4: '4242', expiry: '12/27', name: 'John Doe', color: 'from-blue-600 to-blue-800' },
  { type: 'Mastercard', last4: '5555', expiry: '08/26', name: 'John Doe', color: 'from-red-600 to-orange-600' },
]

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [cards] = useState(SAMPLE_CARDS)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ number: '', expiry: '', cvv: '', name: '' })

  if (!isLoggedIn()) { router.push('/login?redirect=/payment-methods'); return null }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Payment Methods</h1>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <FiPlus /> Add Card
          </button>
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-6">
          {cards.map((card, i) => (
            <div key={i} className={`bg-gradient-to-br ${card.color} rounded-3xl p-6 text-white shadow-elevated relative`}>
              <div className="flex items-center justify-between mb-6">
                <FiCreditCard className="text-2xl text-white/80" />
                <span className="font-bold text-lg">{card.type}</span>
              </div>
              <p className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• {card.last4}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs">Card Holder</p>
                  <p className="font-semibold text-sm">{card.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Expires</p>
                  <p className="font-semibold text-sm">{card.expiry}</p>
                </div>
                <button onClick={() => toast.success('Card removed')}
                  className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* UPI */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <MdAccountBalance className="text-green-600 text-xl" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-dark-gray text-sm">UPI</p>
              <p className="text-xs text-gray-400">Pay directly from your bank</p>
            </div>
            <button className="text-sm text-primary font-semibold hover:underline">Add UPI</button>
          </div>
        </div>

        {/* Add card form */}
        {showAdd && (
          <div className="card p-6 animate-fade-in">
            <h3 className="font-poppins font-semibold text-dark-gray mb-4">Add New Card</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Card Number</label>
                <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  placeholder="1234 5678 9012 3456" className="input-field font-mono" maxLength={19} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Expiry</label>
                  <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                    placeholder="MM/YY" className="input-field" maxLength={5} />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">CVV</label>
                  <input type="password" value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))}
                    placeholder="•••" className="input-field" maxLength={4} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Name on Card</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe" className="input-field" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={() => { toast.success('Card added!'); setShowAdd(false) }} className="btn-primary flex-1">Add Card</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
