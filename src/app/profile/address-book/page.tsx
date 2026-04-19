'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

interface Address { id: number; label: string; line1: string; city: string; state: string; pincode: string; default: boolean }

const SAMPLE: Address[] = [
  { id: 1, label: 'Home', line1: '123, MG Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', default: true },
  { id: 2, label: 'Office', line1: '456, Cyber City, DLF Phase 2', city: 'Gurugram', state: 'Haryana', pincode: '122002', default: false },
]

const EMPTY = { label: 'Home', line1: '', city: '', state: '', pincode: '' }

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<Address[]>(SAMPLE)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: Address } | null>(null)
  const [form, setForm] = useState(EMPTY)

  function openAdd() { setForm(EMPTY); setModal({ mode: 'add' }) }
  function openEdit(a: Address) { setForm({ label: a.label, line1: a.line1, city: a.city, state: a.state, pincode: a.pincode }); setModal({ mode: 'edit', item: a }) }

  function save() {
    if (!form.line1 || !form.city) { toast.error('Fill required fields'); return }
    if (modal?.mode === 'edit' && modal.item) {
      setAddresses(prev => prev.map(a => a.id === modal.item!.id ? { ...a, ...form } : a))
      toast.success('Address updated')
    } else {
      setAddresses(prev => [...prev, { id: Date.now(), ...form, default: prev.length === 0 }])
      toast.success('Address added')
    }
    setModal(null)
  }

  function remove(id: number) {
    if (!confirm('Remove this address?')) return
    setAddresses(prev => prev.filter(a => a.id !== id))
    toast.success('Address removed')
  }

  function setDefault(id: number) {
    setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })))
    toast.success('Default address updated')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
              <FiArrowLeft className="text-gray-600" />
            </Link>
            <h1 className="font-poppins font-bold text-2xl text-dark-gray">Address Book</h1>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <FiPlus /> Add Address
          </button>
        </div>

        <div className="space-y-4">
          {addresses.map(a => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMapPin className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-dark-gray">{a.label}</p>
                      {a.default && <span className="badge text-green-600 bg-green-50 text-xs">Default</span>}
                    </div>
                    <p className="text-sm text-gray-600">{a.line1}</p>
                    <p className="text-sm text-gray-500">{a.city}, {a.state} - {a.pincode}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(a)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center hover:bg-blue-50 transition-colors">
                    <FiEdit2 className="text-blue-600 text-sm" />
                  </button>
                  <button onClick={() => remove(a.id)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center hover:bg-red-50 transition-colors">
                    <FiTrash2 className="text-red-500 text-sm" />
                  </button>
                </div>
              </div>
              {!a.default && (
                <button onClick={() => setDefault(a.id)} className="mt-3 text-xs text-primary font-semibold">Set as default</button>
              )}
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FiMapPin className="text-5xl mx-auto mb-3 text-gray-300" />
              <p>No addresses saved yet</p>
            </div>
          )}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-poppins font-bold text-xl">{modal.mode === 'add' ? 'Add Address' : 'Edit Address'}</h3>
                <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center"><FiX /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Label</label>
                  <select value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-field">
                    {['Home', 'Office', 'Other'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Address Line *</label>
                  <input value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} placeholder="Street, Area" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">City *</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray mb-1.5 block">State</label>
                    <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Maharashtra" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Pincode</label>
                  <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="400001" className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">{modal.mode === 'add' ? 'Add' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
