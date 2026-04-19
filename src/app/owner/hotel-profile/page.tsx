'use client'
import { useState, useEffect } from 'react'
import { ownerApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FiSave, FiMapPin, FiPhone, FiMail, FiGlobe, FiUpload } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'

const HOTEL_TYPES = ['Budget', 'Standard', 'Deluxe', 'Luxury', 'Boutique', 'Resort', 'Hostel', 'Homestay']
const STAR_RATINGS = [1, 2, 3, 4, 5]

export default function HotelProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'basic' | 'location' | 'contact' | 'policies'>('basic')
  const [form, setForm] = useState({
    name: '', description: '', type: 'Standard', star_rating: '3',
    check_in_time: '14:00', check_out_time: '11:00',
    address: '', city: '', state: '', pincode: '', country: 'India',
    latitude: '', longitude: '',
    phone: '', email: '', website: '',
    cancellation_policy: 'Free cancellation up to 24 hours before check-in',
    pet_policy: 'Pets not allowed', smoking_policy: 'Non-smoking property',
    child_policy: 'Children of all ages welcome',
  })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await ownerApi.getMyHotels()
      const raw = res.data?.data || res.data
      const hotel = Array.isArray(raw) ? raw[0] : raw?.data?.[0] || raw
      if (hotel) {
        setForm(f => ({
          ...f,
          name: String(hotel.name || ''),
          description: String(hotel.description || hotel.about || ''),
          type: String(hotel.type || hotel.hotel_type || 'Standard'),
          star_rating: String(hotel.star_rating || hotel.stars || '3'),
          check_in_time: String(hotel.check_in_time || '14:00'),
          check_out_time: String(hotel.check_out_time || '11:00'),
          address: String(hotel.address || ''),
          city: String(hotel.city || ''),
          state: String(hotel.state || ''),
          pincode: String(hotel.pincode || hotel.zip || ''),
          phone: String(hotel.phone || ''),
          email: String(hotel.email || ''),
          website: String(hotel.website || ''),
          cancellation_policy: String(hotel.cancellation_policy || f.cancellation_policy),
          pet_policy: String(hotel.pet_policy || f.pet_policy),
          smoking_policy: String(hotel.smoking_policy || f.smoking_policy),
        }))
      }
    } catch { /* use defaults */ }
    finally { setLoading(false) }
  }

  async function save() {
    if (!form.name) { toast.error('Hotel name is required'); return }
    setSaving(true)
    try {
      await ownerApi.storeHotel({
        ...form,
        star_rating: Number(form.star_rating),
      })
      toast.success('Hotel profile saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const TABS = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'policies', label: 'Policies' },
  ]

  if (loading) return (
    <div className="p-6 space-y-4">
      {Array.from({length:4}).map((_,i)=><div key={i} className="shimmer h-16 rounded-2xl"/>)}
    </div>
  )

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Hotel Profile</h1>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Cover photo */}
      <div className="card overflow-hidden mb-5">
        <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center relative">
          <div className="text-center">
            <MdHotel className="text-5xl text-primary/30 mx-auto mb-2" />
            <button className="flex items-center gap-2 text-sm text-primary font-semibold bg-white px-4 py-2 rounded-xl shadow-card">
              <FiUpload className="text-xs" /> Upload Cover Photo
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 shadow-card border border-gray-100 w-fit mb-5">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-primary text-white' : 'text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        {tab === 'basic' && (
          <>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Hotel Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. The Grand Mumbai" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={4} className="input-field resize-none" placeholder="Describe your hotel..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Hotel Type</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="input-field">
                  {HOTEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Star Rating</label>
                <select value={form.star_rating} onChange={e => setForm(f => ({...f, star_rating: e.target.value}))} className="input-field">
                  {STAR_RATINGS.map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Check-in Time</label>
                <input type="time" value={form.check_in_time} onChange={e => setForm(f => ({...f, check_in_time: e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Check-out Time</label>
                <input type="time" value={form.check_out_time} onChange={e => setForm(f => ({...f, check_out_time: e.target.value}))} className="input-field" />
              </div>
            </div>
          </>
        )}

        {tab === 'location' && (
          <>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block flex items-center gap-1"><FiMapPin className="text-primary text-xs" /> Street Address</label>
              <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="123, MG Road" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">City</label>
                <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Mumbai" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">State</label>
                <input value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} placeholder="Maharashtra" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Pincode</label>
                <input value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))} placeholder="400001" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Country</label>
                <input value={form.country} onChange={e => setForm(f => ({...f, country: e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({...f, latitude: e.target.value}))} placeholder="19.0760" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({...f, longitude: e.target.value}))} placeholder="72.8777" className="input-field" />
              </div>
            </div>
          </>
        )}

        {tab === 'contact' && (
          <>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block flex items-center gap-1"><FiPhone className="text-primary text-xs" /> Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+91 22 1234 5678" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block flex items-center gap-1"><FiMail className="text-primary text-xs" /> Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="info@yourhotel.com" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block flex items-center gap-1"><FiGlobe className="text-primary text-xs" /> Website</label>
              <input type="url" value={form.website} onChange={e => setForm(f => ({...f, website: e.target.value}))} placeholder="https://yourhotel.com" className="input-field" />
            </div>
          </>
        )}

        {tab === 'policies' && (
          <>
            {[
              { key: 'cancellation_policy', label: 'Cancellation Policy' },
              { key: 'pet_policy', label: 'Pet Policy' },
              { key: 'smoking_policy', label: 'Smoking Policy' },
              { key: 'child_policy', label: 'Children Policy' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">{label}</label>
                <textarea value={form[key as keyof typeof form]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                  rows={2} className="input-field resize-none" />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
