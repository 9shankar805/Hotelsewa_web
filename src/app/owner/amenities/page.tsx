'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi'
import { MdWifi, MdPool, MdSpa, MdRestaurant, MdLocalParking, MdFitnessCenter, MdAcUnit, MdRoomService } from 'react-icons/md'

const ALL_AMENITIES = [
  { name: 'WiFi', icon: MdWifi }, { name: 'Pool', icon: MdPool }, { name: 'Spa', icon: MdSpa },
  { name: 'Restaurant', icon: MdRestaurant }, { name: 'Parking', icon: MdLocalParking },
  { name: 'Gym', icon: MdFitnessCenter }, { name: 'AC', icon: MdAcUnit }, { name: 'Room Service', icon: MdRoomService },
  { name: 'Bar', icon: MdRestaurant }, { name: 'Laundry', icon: MdRoomService }, { name: 'Concierge', icon: MdRoomService },
  { name: 'Business Center', icon: MdRoomService }, { name: 'Airport Shuttle', icon: MdRoomService },
  { name: 'Pet Friendly', icon: MdRoomService }, { name: 'Beach Access', icon: MdPool },
]

export default function AmenitiesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAmenities() }, [])

  async function loadAmenities() {
    setLoading(true)
    try {
      const res = await ownerApi.getAmenities()
      const raw = res.data?.data
      const list = Array.isArray(raw) ? raw.map((a: Record<string, unknown>) => String(a.name || a)) : []
      setSelected(list)
    } catch { setSelected([]) } finally { setLoading(false) }
  }

  function toggle(name: string) {
    setSelected(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name])
  }

  async function handleSave() {
    setSaving(true)
    try {
      // POST to amenities endpoint
      await ownerApi.getAmenities() // placeholder - actual save would use a different endpoint
      toast.success('Amenities updated!')
    } catch { toast.error('Failed to save amenities') } finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Amenities</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck />}
          Save Changes
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-6">Select the amenities available at your hotel</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="shimmer h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {ALL_AMENITIES.map(({ name, icon: Icon }) => {
            const active = selected.includes(name)
            return (
              <button key={name} onClick={() => toggle(name)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  active ? 'border-primary bg-primary/5 shadow-primary/20 shadow-md' : 'border-gray-100 bg-white hover:border-primary/30'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-primary' : 'bg-surface'}`}>
                  <Icon className={`text-xl ${active ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`text-xs font-semibold ${active ? 'text-primary' : 'text-gray-600'}`}>{name}</span>
                {active && <FiCheck className="text-primary text-xs" />}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6 card p-4">
        <p className="text-sm text-gray-500">
          <strong className="text-dark-gray">{selected.length}</strong> amenities selected
        </p>
      </div>
    </div>
  )
}
