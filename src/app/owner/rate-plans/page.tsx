'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCalendar } from 'react-icons/fi'

interface RatePlan {
  id: number; name: string; type: string; discount: number
  min_nights: number; max_nights: number; valid_from: string; valid_to: string
  conditions: string; active: boolean
}

const PLAN_TYPES = ['Standard', 'Weekend', 'Long Stay', 'Early Bird', 'Last Minute', 'Festival', 'Corporate', 'Seasonal']

const SAMPLE: RatePlan[] = [
  { id: 1, name: 'Weekend Special', type: 'Weekend', discount: 10, min_nights: 2, max_nights: 7, valid_from: '2025-01-01', valid_to: '2025-12-31', conditions: 'Fri-Sun only', active: true },
  { id: 2, name: 'Long Stay Discount', type: 'Long Stay', discount: 20, min_nights: 7, max_nights: 30, valid_from: '2025-01-01', valid_to: '2025-12-31', conditions: 'Min 7 nights', active: true },
  { id: 3, name: 'Summer Festival', type: 'Festival', discount: 15, min_nights: 1, max_nights: 5, valid_from: '2025-06-01', valid_to: '2025-08-31', conditions: 'Summer season', active: false },
]

const EMPTY = { name: '', type: 'Standard', discount: '', min_nights: '1', max_nights: '30', valid_from: '', valid_to: '', conditions: '' }

export default function RatePlansPage() {
  const [plans, setPlans] = useState<RatePlan[]>(SAMPLE)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: RatePlan } | null>(null)
  const [form, setForm] = useState(EMPTY)

  function openAdd() { setForm(EMPTY); setModal({ mode: 'add' }) }
  function openEdit(p: RatePlan) {
    setForm({ name: p.name, type: p.type, discount: String(p.discount), min_nights: String(p.min_nights), max_nights: String(p.max_nights), valid_from: p.valid_from, valid_to: p.valid_to, conditions: p.conditions })
    setModal({ mode: 'edit', item: p })
  }

  function save() {
    if (!form.name || !form.discount) { toast.error('Fill required fields'); return }
    const plan: RatePlan = { id: modal?.item?.id || Date.now(), name: form.name, type: form.type, discount: Number(form.discount), min_nights: Number(form.min_nights), max_nights: Number(form.max_nights), valid_from: form.valid_from, valid_to: form.valid_to, conditions: form.conditions, active: true }
    if (modal?.mode === 'edit') {
      setPlans(prev => prev.map(p => p.id === modal.item?.id ? plan : p))
      toast.success('Rate plan updated')
    } else {
      setPlans(prev => [...prev, plan])
      toast.success('Rate plan created')
    }
    setModal(null)
  }

  function remove(id: number) {
    if (!confirm('Delete this rate plan?')) return
    setPlans(prev => prev.filter(p => p.id !== id))
    toast.success('Rate plan deleted')
  }

  function toggle(id: number) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Rate Plans</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <FiPlus /> Add Plan
        </button>
      </div>

      <div className="space-y-4">
        {plans.map(p => (
          <div key={p.id} className={`card p-5 ${!p.active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-dark-gray">{p.name}</p>
                  <span className="badge text-xs text-blue-600 bg-blue-50">{p.type}</span>
                  <span className="badge text-xs text-green-600 bg-green-50">-{p.discount}% off</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiCalendar className="text-primary" /> {p.valid_from} → {p.valid_to}</span>
                  <span>Min {p.min_nights} – Max {p.max_nights} nights</span>
                  {p.conditions && <span>{p.conditions}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => toggle(p.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${p.active ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.active ? 'left-5' : 'left-0.5'}`} />
                </button>
                <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center hover:bg-blue-50 transition-colors">
                  <FiEdit2 className="text-blue-600 text-sm" />
                </button>
                <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center hover:bg-red-50 transition-colors">
                  <FiTrash2 className="text-red-500 text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-poppins font-bold text-xl">{modal.mode === 'add' ? 'Add Rate Plan' : 'Edit Rate Plan'}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center"><FiX /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Plan Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Weekend Special" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="input-field">
                    {PLAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Discount (%) *</label>
                  <input type="number" min="1" max="90" value={form.discount} onChange={e => setForm(f => ({...f, discount: e.target.value}))} placeholder="10" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Min Nights</label>
                  <input type="number" min="1" value={form.min_nights} onChange={e => setForm(f => ({...f, min_nights: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Max Nights</label>
                  <input type="number" min="1" value={form.max_nights} onChange={e => setForm(f => ({...f, max_nights: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Valid From</label>
                  <input type="date" value={form.valid_from} onChange={e => setForm(f => ({...f, valid_from: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Valid To</label>
                  <input type="date" value={form.valid_to} onChange={e => setForm(f => ({...f, valid_to: e.target.value}))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Conditions</label>
                <input value={form.conditions} onChange={e => setForm(f => ({...f, conditions: e.target.value}))} placeholder="e.g. Fri-Sun only, advance booking required" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-primary flex-1">{modal.mode === 'add' ? 'Create Plan' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
