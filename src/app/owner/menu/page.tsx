'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiShoppingBag } from 'react-icons/fi'

interface MenuItem {
  id?: string | number
  name: string
  description?: string
  price: number
  category: string
  available?: boolean
  image?: string
}

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts', 'Room Service']
const EMPTY_FORM = { name: '', description: '', price: '', category: 'Breakfast', available: true }

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: MenuItem } | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [activeCategory, setActiveCategory] = useState('All')
  const [tab, setTab] = useState<'menu' | 'analytics' | 'dashboard'>('menu')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await ownerApi.getOrders()
      const raw = res.data?.data?.menu || res.data?.menu
      setItems(Array.isArray(raw) ? raw : SAMPLE_ITEMS)
    } catch { setItems(SAMPLE_ITEMS) }
    finally { setLoading(false) }
  }

  function openAdd() { setForm(EMPTY_FORM); setModal({ mode: 'add' }) }
  function openEdit(item: MenuItem) {
    setForm({ name: item.name, description: item.description || '', price: String(item.price), category: item.category, available: item.available !== false })
    setModal({ mode: 'edit', item })
  }

  function save() {
    if (!form.name || !form.price) { toast.error('Fill required fields'); return }
    const newItem: MenuItem = { ...form, price: Number(form.price), id: modal?.item?.id || Date.now() }
    if (modal?.mode === 'edit') {
      setItems(prev => prev.map(i => i.id === modal.item?.id ? newItem : i))
      toast.success('Item updated')
    } else {
      setItems(prev => [...prev, newItem])
      toast.success('Item added')
    }
    setModal(null)
  }

  function remove(id: string | number | undefined) {
    if (!id || !confirm('Delete this item?')) return
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Item deleted')
  }

  const categories = ['All', ...CATEGORIES.filter(c => items.some(i => i.category === c))]
  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory)

  const orderStats = [
    { label: 'Total Orders Today', value: 24 },
    { label: 'Revenue Today', value: '₹8,450' },
    { label: 'Pending Orders', value: 3 },
    { label: 'Avg Order Value', value: '₹352' },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">In-Stay Ordering</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <FiPlus /> Add Item
        </button>
      </div>

      <div className="flex bg-white rounded-2xl p-1 shadow-card border border-gray-100 w-fit mb-6">
        {(['menu', 'analytics', 'dashboard'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-primary text-white' : 'text-gray-500'}`}>
            {t === 'analytics' ? 'Order Analytics' : t === 'dashboard' ? 'Dashboard' : 'Menu Management'}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {orderStats.map(({ label, value }) => (
            <div key={label} className="card p-5">
              <p className="font-poppins font-bold text-2xl text-dark-gray">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Most Ordered', item: 'Club Sandwich', orders: 45 },
              { label: 'Top Revenue', item: 'Grilled Chicken', revenue: '₹12,600' },
              { label: 'Least Ordered', item: 'Veg Salad', orders: 3 },
              { label: 'Avg Prep Time', item: 'All Items', time: '18 min' },
            ].map(({ label, item, ...rest }) => (
              <div key={label} className="card p-5">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="font-semibold text-dark-gray">{item}</p>
                <p className="text-sm text-primary font-medium mt-1">{Object.values(rest)[0]}</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <p className="font-semibold text-dark-gray mb-4">Orders by Category</p>
            {CATEGORIES.slice(0, 5).map((cat, i) => {
              const pct = [45, 30, 60, 20, 35][i]
              return (
                <div key={cat} className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-gray-600 w-24">{cat}</span>
                  <div className="flex-1 bg-surface rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'menu' && (
        <>
          <div className="flex gap-2 flex-wrap mb-5">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${activeCategory === c ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer h-32 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiShoppingBag className="text-5xl mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No items in this category</p>
              <button onClick={openAdd} className="btn-primary mt-4 text-sm">Add Item</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-dark-gray">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-blue-50 transition-colors">
                        <FiEdit2 className="text-blue-600 text-xs" />
                      </button>
                      <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-red-50 transition-colors">
                        <FiTrash2 className="text-red-500 text-xs" />
                      </button>
                    </div>
                  </div>
                  {item.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="font-poppins font-bold text-primary">₹{item.price.toLocaleString()}</span>
                    <span className={`badge text-xs ${item.available !== false ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
                      {item.available !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-poppins font-bold text-xl">{modal.mode === 'add' ? 'Add Menu Item' : 'Edit Item'}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center"><FiX /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Item Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Club Sandwich" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="250" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-dark-gray">Available</span>
                <button onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.available ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.available ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-primary flex-1">{modal.mode === 'add' ? 'Add Item' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SAMPLE_ITEMS: MenuItem[] = [
  { id: 1, name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, lettuce', price: 280, category: 'Snacks', available: true },
  { id: 2, name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 60, category: 'Beverages', available: true },
  { id: 3, name: 'Grilled Chicken', description: 'Herb-marinated grilled chicken with sides', price: 450, category: 'Dinner', available: true },
  { id: 4, name: 'Pancakes', description: 'Fluffy pancakes with maple syrup', price: 180, category: 'Breakfast', available: true },
  { id: 5, name: 'Veg Biryani', description: 'Aromatic basmati rice with vegetables', price: 320, category: 'Lunch', available: false },
  { id: 6, name: 'Chocolate Brownie', description: 'Warm brownie with vanilla ice cream', price: 150, category: 'Desserts', available: true },
]
