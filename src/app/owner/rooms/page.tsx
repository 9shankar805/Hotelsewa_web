'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import { parseHotelImage } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { MdBedroomParent } from 'react-icons/md'

interface Room {
  id?: string | number
  name?: string
  type?: string
  price?: number
  capacity?: number
  description?: string
  image?: string
  images?: unknown
  status?: string
  amenities?: string[]
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; room?: Room } | null>(null)
  const [form, setForm] = useState({ name: '', type: 'Standard', price: '', capacity: '2', description: '' })

  useEffect(() => { loadRooms() }, [])

  async function loadRooms() {
    setLoading(true)
    try {
      const res = await ownerApi.getRooms()
      const raw = res.data?.data
      setRooms(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch {
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setForm({ name: '', type: 'Standard', price: '', capacity: '2', description: '' })
    setModal({ mode: 'add' })
  }

  function openEdit(room: Room) {
    setForm({
      name: String(room.name || ''),
      type: String(room.type || 'Standard'),
      price: String(room.price || ''),
      capacity: String(room.capacity || 2),
      description: String(room.description || ''),
    })
    setModal({ mode: 'edit', room })
  }

  async function handleSave() {
    if (!form.name || !form.price) { toast.error('Fill required fields'); return }
    try {
      const data = { name: form.name, type: form.type, price: Number(form.price), capacity: Number(form.capacity), description: form.description }
      if (modal?.mode === 'edit' && modal.room?.id) {
        await ownerApi.updateRoom(String(modal.room.id), data)
        toast.success('Room updated')
      } else {
        await ownerApi.storeRoom(data)
        toast.success('Room added')
      }
      setModal(null)
      loadRooms()
    } catch {
      toast.error('Failed to save room')
    }
  }

  async function handleDelete(id: string | number) {
    if (!confirm('Delete this room?')) return
    try {
      await ownerApi.deleteRoom(String(id))
      toast.success('Room deleted')
      loadRooms()
    } catch {
      toast.error('Failed to delete room')
    }
  }

  const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family', 'Presidential']

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Rooms</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <FiPlus /> Add Room
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="shimmer h-40" />
              <div className="p-4 space-y-2">
                <div className="shimmer h-5 w-2/3 rounded-lg" />
                <div className="shimmer h-4 w-1/2 rounded-lg" />
                <div className="shimmer h-8 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20">
          <MdBedroomParent className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">No rooms yet</h3>
          <p className="text-gray-500 mb-6">Add your first room to start accepting bookings</p>
          <button onClick={openAdd} className="btn-primary">Add Room</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room, i) => {
            const image = parseHotelImage(room.image || room.images)
            return (
              <div key={i} className="card overflow-hidden group">
                <div className="relative h-40 overflow-hidden">
                  <img src={image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(room)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-card hover:bg-blue-50 transition-all">
                      <FiEdit2 className="text-blue-600 text-sm" />
                    </button>
                    <button onClick={() => handleDelete(room.id!)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-card hover:bg-red-50 transition-all">
                      <FiTrash2 className="text-red-500 text-sm" />
                    </button>
                  </div>
                  <span className={`absolute top-2 left-2 badge text-xs ${room.status === 'available' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                    {room.status || 'available'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-dark-gray">{room.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{room.type} · {room.capacity} guests</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-poppins font-bold text-primary text-lg">₹{Number(room.price || 0).toLocaleString()}<span className="text-xs text-gray-400 font-normal">/night</span></span>
                    <button onClick={() => openEdit(room)} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-poppins font-bold text-xl">{modal.mode === 'add' ? 'Add Room' : 'Edit Room'}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center">
                <FiX />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Room Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Deluxe King Room" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Capacity</label>
                  <select value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="input-field">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} guests</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Price per Night (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="2500" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Room description..." rows={3} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1">
                {modal.mode === 'add' ? 'Add Room' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
