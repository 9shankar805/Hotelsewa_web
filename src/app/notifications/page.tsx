'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { profileApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { FiBell, FiCheck } from 'react-icons/fi'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login?redirect=/notifications'); return }
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await profileApi.getNotifications()
      const raw = res.data?.data
      setNotifications(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch { setNotifications([]) } finally { setLoading(false) }
  }

  const ICONS: Record<string, string> = { booking: '🏨', payment: '💳', offer: '🎁', review: '⭐', system: '🔔' }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins font-bold text-2xl text-dark-gray">Notifications</h1>
          {notifications.length > 0 && (
            <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
              <FiCheck /> Mark all read
            </button>
          )}
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4 flex gap-3">
                <div className="shimmer w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-3/4 rounded-lg" />
                  <div className="shimmer h-3 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="font-poppins font-bold text-xl text-dark-gray mb-2">All caught up!</h3>
            <p className="text-gray-500">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => {
              const type = String(n.type || 'system')
              const unread = !n.read_at
              return (
                <div key={i} className={`card p-4 flex gap-3 cursor-pointer hover:shadow-elevated transition-all ${unread ? 'border-l-4 border-primary' : ''}`}>
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                    {ICONS[type] || '🔔'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${unread ? 'font-semibold text-dark-gray' : 'font-medium text-gray-600'}`}>
                        {String(n.title || n.type || 'Notification')}
                      </p>
                      {unread && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{String(n.message || n.body || '')}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(String(n.created_at || ''))}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
