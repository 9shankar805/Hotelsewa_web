'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FiBell, FiGlobe, FiDollarSign, FiEye, FiChevronRight, FiSettings } from 'react-icons/fi'

const CURRENCIES = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)', 'SGD (S$)']
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati']
const TIMEZONES = ['Asia/Kolkata (IST)', 'Asia/Dubai (GST)', 'America/New_York (EST)', 'Europe/London (GMT)']

export default function SettingsPage() {
  const [tab, setTab] = useState<'general' | 'notifications' | 'currency' | 'language' | 'accessibility'>('general')
  const [currency, setCurrency] = useState('INR (₹)')
  const [language, setLanguage] = useState('English')
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)')
  const [fontSize, setFontSize] = useState('medium')
  const [highContrast, setHighContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [notifs, setNotifs] = useState({
    new_booking: true, booking_cancelled: true, payment_received: true,
    review_posted: true, low_occupancy: false, daily_summary: true,
    push: true, email: true, sms: false,
  })

  function save() { toast.success('Settings saved') }

  const TABS = [
    { key: 'general', label: 'General', icon: FiSettings },
    { key: 'notifications', label: 'Notifications', icon: FiBell },
    { key: 'currency', label: 'Currency', icon: FiDollarSign },
    { key: 'language', label: 'Language', icon: FiGlobe },
    { key: 'accessibility', label: 'Accessibility', icon: FiEye },
  ]

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="font-poppins font-bold text-2xl text-dark-gray mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-surface'}`}>
              <Icon className="text-base" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {tab === 'general' && (
            <div className="card p-5 space-y-4">
              <p className="font-semibold text-dark-gray">General Settings</p>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Timezone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input-field">
                  {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-1.5 block">Date Format</label>
                <select className="input-field">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-gray">Dark Mode</p>
                  <p className="text-xs text-gray-400">Switch to dark theme</p>
                </div>
                <button className="relative w-10 h-5 rounded-full bg-gray-200">
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>
              <div className="pt-2">
                <Link href="/owner/advanced" className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-dark-gray">Advanced Features</span>
                  <FiChevronRight className="text-gray-400" />
                </Link>
              </div>
              <button onClick={save} className="btn-primary w-full">Save Changes</button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card p-5">
              <p className="font-semibold text-dark-gray mb-4">Notification Preferences</p>
              <div className="space-y-1 mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Channels</p>
                {(['push', 'email', 'sms'] as const).map(ch => (
                  <div key={ch} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 capitalize">{ch} Notifications</span>
                    <button onClick={() => setNotifs(n => ({ ...n, [ch]: !n[ch] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${notifs[ch] ? 'bg-primary' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${notifs[ch] ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Events</p>
                {Object.entries(notifs).filter(([k]) => !['push', 'email', 'sms'].includes(k)).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <button onClick={() => setNotifs(n => ({ ...n, [key]: !val }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-primary' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={save} className="btn-primary w-full mt-4">Save</button>
            </div>
          )}

          {tab === 'currency' && (
            <div className="card p-5">
              <p className="font-semibold text-dark-gray mb-4">Currency Settings</p>
              <div className="grid grid-cols-2 gap-3">
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${currency === c ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <button onClick={save} className="btn-primary w-full mt-5">Save Currency</button>
            </div>
          )}

          {tab === 'language' && (
            <div className="card p-5">
              <p className="font-semibold text-dark-gray mb-4">Language Settings</p>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setLanguage(l)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${language === l ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <button onClick={save} className="btn-primary w-full mt-5">Save Language</button>
            </div>
          )}

          {tab === 'accessibility' && (
            <div className="card p-5 space-y-4">
              <p className="font-semibold text-dark-gray">Accessibility Settings</p>
              <div>
                <label className="text-sm font-medium text-dark-gray mb-2 block">Font Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large', 'x-large'].map(s => (
                    <button key={s} onClick={() => setFontSize(s)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-semibold capitalize transition-all ${fontSize === s ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { key: 'highContrast', label: 'High Contrast', desc: 'Increase color contrast for better visibility', val: highContrast, set: setHighContrast },
                { key: 'reduceMotion', label: 'Reduce Motion', desc: 'Minimize animations and transitions', val: reduceMotion, set: setReduceMotion },
              ].map(({ label, desc, val, set }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-dark-gray">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <button onClick={() => set((v: boolean) => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-primary' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              <button onClick={save} className="btn-primary w-full">Save Accessibility Settings</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
