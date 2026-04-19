'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiTag, FiX } from 'react-icons/fi'

export default function OffersPage() {
  const [offers, setOffers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', discount: '', code: '', start_date: '', end_date: '', description: '' })

  useEffect(() => { loadOffers() }, [])

  async function loadOffers() {
    setLoading(true)
    try {
      const res = await ownerApi.getOffers()
      const raw = res.data?.data
      setOffers(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch {
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.title || !form.discount) { toast.error('Fill required fields'); return }
    try {
      await ownerApi.createOffer({ ...form, discount: Number(form.discount) })
      toast.success('Offer created!')
      setModal(false)
      setForm({ title: '', discount: '', code: '', start_date: '', end_date: '', description: '' })
      loadOffers()
    } catch {
      toast.error('Failed to create offer')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this offer?')) return
    try {
      await ownerApi.deleteOffer(id)
      toast.success('Offer deleted')
      loadOffers()
    } catch {
      toast.error('Failed to delete offer')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Offers & Promotions</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <FiPlus /> Create Offer
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="shimmer h-5 w-2/3 rounded-lg" />
              <div className="shimmer h-4 w-1/2 rounded-lg" />
              <div className="shimmer h-8 rounded-xl" />
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20">
          <FiTag className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No offers yet</h3>
          <p className="text-gray-500 mb-6">Create special offers to attract more guests</p>
          <button onClick={() => setModal(true)} className="btn-primary">Create Offer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer, i) => (
            <div key={i} className="card p-5 relative group">
              <button onClick={() => handleDelete(String(offer.id))}
                className="absolute top-3 right-3 w-7 h-7 rounded-xl bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                <FiTrash2 className="text-xs" />
              </button>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <FiTag className="text-primary text-lg" />
              </div>
              <h3 className="font-semibold text-dark-gray">{String(offer.title)}</h3>
              <p className="text-sm text-gray-500 mt-1">{String(offer.description || '')}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="badge text-primary bg-primary/10 text-sm font-bold">{Number(offer.discount)}% OFF</span>
                {!!offer.code && <span className="badge text-gray-600 bg-[#F0F2F5] font-mono">{String(offer.code)}</span>}
              </div>
              {!!(offer.start_date || offer.end_date) && (
                <p className="text-xs text-gray-400 mt-2">
                  {offer.start_date ? formatDate(String(offer.start_date)) : ''} — {offer.end_date ? formatDate(String(offer.end_date)) : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-poppins font-bold text-xl">Create Offer</h3>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center"><FiX /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Offer Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Weekend Special" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Discount % *</label>
                  <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                    placeholder="20" min="1" max="100" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Coupon Code</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20" className="input-field font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Offer details..." rows={3} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleCreate} className="btn-primary flex-1">Create Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
