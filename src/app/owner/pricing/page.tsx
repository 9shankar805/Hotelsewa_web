'use client'
import { useState } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FiDollarSign, FiZap, FiTrendingUp } from 'react-icons/fi'

export default function PricingPage() {
  const [roomType, setRoomType] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [suggestions, setSuggestions] = useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function getSuggestions() {
    if (!roomType || !basePrice) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const res = await api.post('/ai-pricing/suggest', { room_type: roomType, base_price: Number(basePrice) })
      setSuggestions(res.data?.data?.suggestions || res.data?.suggestions || [])
    } catch { toast.error('Failed to get suggestions') } finally { setLoading(false) }
  }

  async function applyPricing(price: number) {
    try {
      await api.post('/ai-pricing/apply', { room_type: roomType, price })
      toast.success(`Price ₹${price.toLocaleString()} applied!`)
    } catch { toast.error('Failed to apply pricing') }
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-2">Dynamic Pricing</h1>
      <p className="text-gray-500 text-sm mb-6">Use AI to optimize your room prices based on demand and market trends</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Pricing */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <FiZap className="text-primary" />
            </div>
            <h3 className="font-poppins font-semibold text-dark-gray">AI Price Suggestions</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Room Type</label>
              <select value={roomType} onChange={e => setRoomType(e.target.value)} className="input-field">
                <option value="">Select room type</option>
                {['Standard', 'Deluxe', 'Suite', 'Executive', 'Family'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Current Base Price (₹)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)}
                  placeholder="2500" className="input-field pl-11" />
              </div>
            </div>
            <button onClick={getSuggestions} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiZap />}
              Get AI Suggestions
            </button>
          </div>

          {suggestions && (
            <div className="mt-5 space-y-3 animate-fade-in">
              <h4 className="font-semibold text-sm text-dark-gray">Suggested Prices</h4>
              {suggestions.length > 0 ? suggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-surface rounded-2xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-dark-gray">₹{Number(s.price || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{String(s.reason || s.label || 'Optimized price')}</p>
                  </div>
                  <button onClick={() => applyPricing(Number(s.price))} className="text-xs text-primary font-semibold hover:underline">Apply</button>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-3">No suggestions available</p>
              )}
            </div>
          )}
        </div>

        {/* Pricing rules */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-blue-600" />
            </div>
            <h3 className="font-poppins font-semibold text-dark-gray">Pricing Rules</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Weekend Premium', desc: 'Increase price on Fri-Sun', value: '+15%', active: true },
              { label: 'Early Bird Discount', desc: 'Book 30+ days ahead', value: '-10%', active: true },
              { label: 'Last Minute Deal', desc: 'Book within 24 hours', value: '-20%', active: false },
              { label: 'Long Stay Discount', desc: '7+ nights stay', value: '-12%', active: false },
            ].map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-2xl">
                <div>
                  <p className="text-sm font-semibold text-dark-gray">{rule.label}</p>
                  <p className="text-xs text-gray-400">{rule.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${rule.value.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{rule.value}</span>
                  <button className={`w-10 h-5 rounded-full transition-all relative ${rule.active ? 'bg-primary' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${rule.active ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
