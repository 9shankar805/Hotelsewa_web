'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { isLoggedIn } from '@/lib/auth'
import { FiBell, FiGlobe, FiDollarSign, FiShield, FiChevronRight, FiMoon, FiSun } from 'react-icons/fi'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)

  const settingGroups = [
    {
      title: 'Preferences',
      items: [
        { icon: FiGlobe, label: 'Language', value: 'English', href: '/settings/language' },
        { icon: FiDollarSign, label: 'Currency', value: 'INR (₹)', href: '/settings/currency' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: FiShield, label: 'Security Settings', value: '', href: '/profile' },
        { icon: FiBell, label: 'Notification Settings', value: '', href: null },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Settings</h1>

        {/* Appearance */}
        <div className="card p-5 mb-4">
          <h3 className="font-semibold text-dark-gray mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <FiMoon className="text-primary" /> : <FiSun className="text-primary" />}
              <span className="text-sm font-medium text-dark-gray">Dark Mode</span>
            </div>
            <button onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-all ${darkMode ? 'bg-primary' : 'bg-gray-200'} relative`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${darkMode ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-5 mb-4">
          <h3 className="font-semibold text-dark-gray mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              { label: 'Push Notifications', value: notifications, set: setNotifications },
              { label: 'Email Alerts', value: emailAlerts, set: setEmailAlerts },
              { label: 'SMS Alerts', value: smsAlerts, set: setSmsAlerts },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-dark-gray">{label}</span>
                <button onClick={() => set(!value)}
                  className={`w-12 h-6 rounded-full transition-all ${value ? 'bg-primary' : 'bg-gray-200'} relative`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Other settings */}
        {settingGroups.map(group => (
          <div key={group.title} className="card p-5 mb-4">
            <h3 className="font-semibold text-dark-gray mb-4">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-center justify-between py-2.5 px-1 hover:bg-surface rounded-xl transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className="text-primary text-sm" />
                      </div>
                      <span className="text-sm font-medium text-dark-gray">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-xs text-gray-400">{item.value}</span>}
                      <FiChevronRight className="text-gray-400" />
                    </div>
                  </div>
                )
                return item.href ? <Link key={item.label} href={item.href}>{content}</Link> : <div key={item.label}>{content}</div>
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
