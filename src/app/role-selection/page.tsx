'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import { getUser, saveSession } from '@/lib/auth'
import toast from 'react-hot-toast'
import { MdHotel } from 'react-icons/md'
import { FiUser } from 'react-icons/fi'

function RoleForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [selected, setSelected] = useState<'customer' | 'owner' | null>(null)
  const [loading, setLoading] = useState(false)

  async function proceed() {
    if (!selected) { toast.error('Select a role to continue'); return }
    setLoading(true)
    try {
      const user = getUser()
      if (user) {
        await authApi.getSystemSettings() // ping to keep session alive
        saveSession({ ...user, role: selected })
      }
      toast.success(`Welcome as ${selected === 'owner' ? 'Hotel Owner' : 'Guest'}!`)
      router.push(selected === 'owner' ? '/owner/dashboard' : redirect)
    } catch {
      router.push(selected === 'owner' ? '/owner/dashboard' : redirect)
    } finally { setLoading(false) }
  }

  const roles = [
    {
      id: 'customer' as const,
      icon: FiUser,
      title: 'I\'m a Guest',
      desc: 'Search and book hotels, manage trips, earn loyalty points',
      features: ['Browse 10,000+ hotels', 'Instant booking', 'Loyalty rewards', 'Trip management'],
      color: '#1890FF',
      gradient: 'from-blue-500 to-blue-400',
    },
    {
      id: 'owner' as const,
      icon: MdHotel,
      title: 'I\'m a Hotel Owner',
      desc: 'List your property, manage bookings, grow your revenue',
      features: ['List your hotel', 'Manage bookings', 'Analytics dashboard', 'AI pricing tools'],
      color: '#E60023',
      gradient: 'from-primary to-primary-dark',
    },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MdHotel className="text-white text-3xl" />
          </div>
          <h1 className="font-poppins font-bold text-3xl text-dark-gray">Welcome to HotelSewa</h1>
          <p className="text-gray-500 mt-2">How would you like to use HotelSewa?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {roles.map(({ id, icon: Icon, title, desc, features, color, gradient }) => (
            <button key={id} onClick={() => setSelected(id)}
              className={`text-left p-6 rounded-3xl border-2 transition-all ${selected === id ? 'border-current shadow-lg scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-card'}`}
              style={{ borderColor: selected === id ? color : undefined, backgroundColor: selected === id ? `${color}08` : undefined }}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon className="text-white text-2xl" />
              </div>
              <h3 className="font-poppins font-bold text-xl text-dark-gray mb-1">{title}</h3>
              <p className="text-sm text-gray-500 mb-4">{desc}</p>
              <ul className="space-y-1.5">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {f}
                  </li>
                ))}
              </ul>
              {selected === id && (
                <div className="mt-4 flex items-center gap-2 font-semibold text-sm" style={{ color }}>
                  <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: color }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  </span>
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>

        <button onClick={proceed} disabled={!selected || loading}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          {loading ? 'Setting up...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

export default function RoleSelectionPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>}><RoleForm /></Suspense>
}
