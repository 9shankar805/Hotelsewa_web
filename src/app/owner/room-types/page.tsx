'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { MdBedroomParent } from 'react-icons/md'

interface RoomType {
  id: number
  name: string
  description: string
  base_price: number
  capacity: number
  size: string
  amenities: string[]
}

const DEFAULT_TYPES: RoomType[] = [
  { id: 1, name: 'Standard Room', description: 'Comfortable room with essential amenities', base_price: 2000, capacity: 2, size: '200 sq ft', amenities: ['WiFi', 'AC', 'TV'] },
  { id: 2, name: 'Deluxe Room', description: 'Spacious room with premium furnishings', base_price: 3500, capacity: 2, size: '300 sq ft', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'] },
  { id: 3, name: 'Suite', description: 'Luxurious suite with separate living area', base_price: 8000, capacity: 4, size: '600 sq ft', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi'] },
  { id: 4, name: 'Family Room', description: 'Large room ideal for families', base_price: 5000, capacity: 6, size: '500 sq ft', amenities: ['WiFi', 'AC', 'TV', 'Extra Beds'] },
]

const EMPTY_FORM = { name: '', description: '', base_price: '', capacity: '2', size: '', amenities: '' }

export default function RoomTypesPage() {
  const [types, setTypes] = useState<RoomType[]>(DEFAULT_TYPES)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: RoomType } | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function openAdd() { setForm(EMPTY_FORM); setModal({ mode: 'add' }) }
  function openEdit(item: RoomType) {
    setForm({ name: item.name, description: item.description, base_price: String(item.base_price), capacity: String(item.capacity), size: item.size, amenities: item.amenities.join(', ') })
    setModal({ mode: 'edit', item })
  }

  function save() {
    if (!form.name || !form.base_price) { toast.error('Fill required fields'); return }
    const amenities = form.amenities.split(',').map(a => a.trim()).filter(Boolean)
    if (modal?.mode === 'edit' && modal.item) {
      setTypes(prev => prev.map(t => t.id === modal.item!.id ? { ...t, ...form, base_price: Number(form.base_price), capacity: Number(form.capacity), amenities } : t))
      toast.success('Room type updated')
    } else {
      setTypes(prev => [...prev, { id: Date.now(), ...form, base_price: Number(form.base_price), capacity: Number(form.capacity), amenities }])
      toast.success('Room type added')
    }
    setModal(null)
  }

  function remove(id: number) {
    if (!confirm('Delete this room type?')) return
    setTypes(prev => prev.filter(t => t.id !== id))
    toast.success('Room type deleted')
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Room Types</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <FiPlus /> Add Type
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {types.map(t => (
          <div key={t.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MdBedroomParent className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-dark-gray">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.size} · {t.capacity} guests</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center hover:bg-blue-50 transition-colors">
                  <FiEdit2 className="text-blue-600 text-sm" />
                </button>
                <button onClick={() => remove(t.id)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center hover:bg-red-50 transition-colors">
                  <FiTrash2 className="text-red-500 text-sm" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">{t.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {t.amenities.map(a => (
                <span key={a} className="text-xs bg-surface text-gray-500 px-2 py-1 rounded-lg">{a}</span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Base Price</span>
              <span className="font-poppins font-bold text-primary">₹{t.base_price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/night</span></span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-poppins font-bold text-xl">{modal.mode === 'add' ? 'Add Room Type' : 'Edit Room Type'}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center"><FiX /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Deluxe Suite" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Base Price (₹) *</label>
                  <input type="number" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} placeholder="2500" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Capacity</label>
                  <select value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="input-field">
                    {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} guests</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Room Size</label>
                <input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. 300 sq ft" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Amenities (comma separated)</label>
                <input value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} placeholder="WiFi, AC, TV, Mini Bar" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-primary flex-1">{modal.mode === 'add' ? 'Add Type' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
