'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { profileApi } from '@/lib/api'
import { getUser, saveSession } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiSave, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

export default function PersonalInfoPage() {
  const user = getUser()
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    dob: '', gender: '', address: '', city: '', state: '', pincode: '',
  })
  const [loading, setLoading] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await profileApi.updateProfile(form)
      if (res.data?.data || res.data?.success) {
        saveSession(res.data?.data || res.data)
        toast.success('Personal info updated')
      }
    } catch { toast.error('Failed to update') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center">
            <FiArrowLeft className="text-gray-600" />
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Personal Information</h1>
        </div>
        <form onSubmit={save} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Date of Birth</label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="input-field">
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">City</label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" className="input-field pl-11" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray mb-1.5 block">Address</label>
            <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">State</label>
              <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Maharashtra" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-gray mb-1.5 block">Pincode</label>
              <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="400001" className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
