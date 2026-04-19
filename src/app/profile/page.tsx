'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { profileApi } from '@/lib/api'
import { getUser, isLoggedIn, saveSession, logout } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiSave, FiHeart, FiCalendar, FiStar, FiLogOut, FiTrash2 } from 'react-icons/fi'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const user = getUser()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [loyalty, setLoyalty] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login?redirect=/profile'); return }
    loadLoyalty()
  }, [])

  async function loadLoyalty() {
    try {
      const res = await profileApi.getLoyaltyBalance()
      setLoyalty(res.data?.data || res.data)
    } catch { /* ignore */ }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await profileApi.updateProfile(form)
      if (res.data?.success || res.data?.data) {
        saveSession(res.data?.data || res.data)
        toast.success('Profile updated!')
      } else {
        toast.error(res.data?.message || 'Update failed')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const quickLinks = [
    { href: '/trips', icon: FiCalendar, label: 'My Trips', desc: 'View all bookings' },
    { href: '/saved', icon: FiHeart, label: 'Saved Hotels', desc: 'Your wishlist' },
    { href: '/notifications', icon: FiStar, label: 'Notifications', desc: 'Stay updated' },
    { href: '/profile/personal-info', icon: FiUser, label: 'Personal Info', desc: 'Edit your details' },
    { href: '/profile/address-book', icon: FiUser, label: 'Address Book', desc: 'Manage addresses' },
    { href: '/profile/security', icon: FiUser, label: 'Security', desc: 'Password & 2FA' },
    { href: '/profile/travel-preferences', icon: FiUser, label: 'Travel Preferences', desc: 'Your stay preferences' },
    { href: '/profile/linked-accounts', icon: FiUser, label: 'Linked Accounts', desc: 'Google, Apple & more' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-6 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {user?.profileImageUrl
                  ? <img src={user.profileImageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                  : <span className="text-primary font-bold text-3xl">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                }
              </div>
              <h2 className="font-poppins font-bold text-dark-gray">{user?.name}</h2>
              <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
              <span className="badge text-green-600 bg-green-50 mt-2">Verified</span>
            </div>

            {/* Loyalty */}
            {loyalty && (
              <div className="card p-5 bg-gradient-to-br from-primary to-primary-dark text-white">
                <p className="text-white/70 text-xs mb-1">Loyalty Points</p>
                <p className="font-poppins font-extrabold text-3xl">{Number(loyalty.balance || loyalty.points || 0).toLocaleString()}</p>
                <p className="text-white/70 text-xs mt-1">pts</p>
              </div>
            )}

            {/* Quick links */}
            <div className="card p-4 space-y-1">
              {quickLinks.map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface transition-all group">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-gray">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </Link>
              ))}
              <button onClick={() => { logout(); router.push('/') }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 transition-all text-red-500">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                  <FiLogOut className="text-red-500" />
                </div>
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>

          {/* Right: Edit form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="font-poppins font-semibold text-lg text-dark-gray mb-5">Personal Information</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field pl-11" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="input-field pl-11" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray mb-1.5 block">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="input-field pl-11" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
                  Save Changes
                </button>
              </form>
            </div>

            {/* Danger zone */}
            <div className="card p-6 mt-4 border border-red-100">
              <h3 className="font-poppins font-semibold text-red-600 mb-3 flex items-center gap-2">
                <FiTrash2 /> Danger Zone
              </h3>
              <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="flex items-center gap-2 text-sm text-red-500 font-semibold border border-red-200 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all">
                <FiTrash2 /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
