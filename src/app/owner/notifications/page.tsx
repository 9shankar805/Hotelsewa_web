'use client'
import { useState, useEffect } from 'react'
import { profileApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { FiBell } from 'react-icons/fi'

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    try {
      const res = await profileApi.getNotifications()
      const raw = res.data?.data
      setNotifications(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Notifications</h1>

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
        <div className="text-center py-16">
          <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div key={i} className={`card p-4 flex gap-3 ${!n.read_at ? 'border-l-4 border-primary' : ''}`}>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiBell className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-dark-gray">{String(n.title || n.type || 'Notification')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{String(n.message || n.body || '')}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(String(n.created_at || ''))}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
