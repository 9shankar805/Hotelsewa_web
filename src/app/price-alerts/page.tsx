'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { FiBell, FiPlus, FiTrash2, FiTrendingDown, FiX } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'

interface Alert { id: number; hotel: string; city: string; targetPrice: number; currentPrice: number; active: boolean; triggered: boolean }

const SAMPLE: Alert[] = [
  { id: 1, hotel: 'The Grand Mumbai', city: 'Mumbai', targetPrice: 3000, currentPrice: 3800, active: true, triggered: false },
  { id: 2, hotel: 'Taj Palace Delhi', city: 'Delhi', targetPrice: 5000, currentPrice: 4800, active: true, triggered: true },
  { id: 3, hotel: 'Leela Goa', city: 'Goa', targetPrice: 6000, currentPrice: 7200, active: false, triggered: false },
]

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ hotel: '', city: '', targetPrice: '' })

  function addAlert() {
    if (!form.hotel || !form.targetPrice) { toast.error('Fill required fields'); return }
    setAlerts(prev => [...prev, {
      id: Date.now(), hotel: form.hotel, city: form.city,
      targetPrice: Number(form.targetPrice), currentPrice: Number(form.targetPrice) * 1.3,
      active: true, triggered: false,
    }])
    toast.success('Price alert created')
    setShowModal(false)
    setForm({ hotel: '', city: '', targetPrice: '' })
  }

  function toggle(id: number) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  function remove(id: number) {
    setAlerts(prev => prev.filter(a => a.id !== id))
    toast.success('Alert removed')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-poppins font-bold text-2xl text-dark-gray">Price Alerts</h1>
            <p className="text-sm text-gray-400 mt-1">Get notified when hotel prices drop</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <FiPlus /> New Alert
          </button>
        </div>

        {/* Triggered alerts */}
        {alerts.some(a => a.triggered) && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
            <p className="font-semibold text-green-700 flex items-center gap-2 mb-2">
              <FiTrendingDown /> Price Drop Alerts!
            </p>
            {alerts.filter(a => a.triggered).map(a => (
              <p key={a.id} className="text-sm text-green-600">
                {a.hotel} dropped to ₹{a.currentPrice.toLocaleString()} — your target was ₹{a.targetPrice.toLocaleString()}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiBell className="text-5xl mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No price alerts yet</p>
              <p className="text-sm mt-1">Create an alert to track hotel prices</p>
              <button onClick={() => setShowModal(true)} className="btn-primary mt-4 text-sm">Create Alert</button>
            </div>
          ) : alerts.map(a => (
            <div key={a.id} className={`card p-5 ${a.triggered ? 'border-green-200 bg-green-50/30' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MdHotel className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-gray">{a.hotel}</p>
                    <p className="text-xs text-gray-400">{a.city}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Target Price</p>
                        <p className="font-bold text-primary">₹{a.targetPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Current Price</p>
                        <p className={`font-bold ${a.currentPrice <= a.targetPrice ? 'text-green-600' : 'text-dark-gray'}`}>
                          ₹{a.currentPrice.toLocaleString()}
                        </p>
                      </div>
                      {a.triggered && <span className="badge text-green-600 bg-green-100 text-xs">Price Dropped!</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(a.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${a.active ? 'bg-primary' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${a.active ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <button onClick={() => remove(a.id)} className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-red-50 transition-colors">
                    <FiTrash2 className="text-red-400 text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-poppins font-bold text-xl">Create Price Alert</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center"><FiX /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Hotel Name *</label>
                  <input value={form.hotel} onChange={e => setForm(f => ({...f, hotel: e.target.value}))} placeholder="e.g. Taj Hotel Mumbai" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="e.g. Mumbai" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Target Price (₹) *</label>
                  <input type="number" value={form.targetPrice} onChange={e => setForm(f => ({...f, targetPrice: e.target.value}))} placeholder="3000" className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">You'll be notified when the price drops to or below this amount</p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={addAlert} className="btn-primary flex-1">Create Alert</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
