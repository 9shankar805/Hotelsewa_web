'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FiCalendar, FiTrendingUp, FiMessageSquare, FiFileText, FiDollarSign, FiGrid, FiZap, FiShield, FiGlobe } from 'react-icons/fi'
import { MdQrCode2 } from 'react-icons/md'

const FEATURES = [
  {
    category: 'Revenue Management',
    items: [
      { icon: FiTrendingUp, label: 'AI Dynamic Pricing', desc: 'Auto-adjust prices based on demand & competitors', href: '/owner/pricing', color: '#E60023', badge: 'AI' },
      { icon: FiDollarSign, label: 'Withdrawals', desc: 'Manage earnings and bank withdrawals', href: '/owner/withdrawals', color: '#52C41A' },
      { icon: FiFileText, label: 'Tax Reports', desc: 'GST reports and tax filing assistance', href: '/owner/tax-reports', color: '#FA8C16' },
    ]
  },
  {
    category: 'Operations',
    items: [
      { icon: FiCalendar, label: 'Booking Calendar', desc: 'Visual calendar with availability & occupancy', href: '/owner/calendar', color: '#1890FF' },
      { icon: MdQrCode2, label: 'Check-in Management', desc: 'QR-based guest check-in system', href: '/owner/checkin', color: '#722ED1' },
      { icon: FiGrid, label: 'Room Types', desc: 'Define and manage room categories', href: '/owner/room-types', color: '#13C2C2' },
    ]
  },
  {
    category: 'Guest Experience',
    items: [
      { icon: FiMessageSquare, label: 'Messaging', desc: 'Guest chat and automated messages', href: '/owner/messaging', color: '#EB2F96', badge: 'New' },
      { icon: FiShield, label: 'Amenities', desc: 'Manage hotel amenities and facilities', href: '/owner/amenities', color: '#52C41A' },
      { icon: FiZap, label: 'In-Stay Ordering', desc: 'Room service menu and order management', href: '/owner/menu', color: '#FA8C16' },
    ]
  },
  {
    category: 'Compliance',
    items: [
      { icon: FiFileText, label: 'Documents', desc: 'Upload and manage hotel documents', href: '/owner/documents', color: '#1890FF' },
      { icon: FiGlobe, label: 'iCal Sync', desc: 'Sync with Booking.com, Airbnb & more', href: '/owner/calendar', color: '#722ED1' },
    ]
  },
]

export default function AdvancedPage() {
  const [search, setSearch] = useState('')

  const filtered = FEATURES.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins font-bold text-2xl text-dark-gray">Advanced Features</h1>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search features..." className="input-field w-56 text-sm py-2" />
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <FiZap className="text-2xl" />
          </div>
          <div>
            <p className="font-poppins font-bold text-xl">Power Up Your Hotel</p>
            <p className="text-white/70 text-sm">Advanced tools to maximize revenue and streamline operations</p>
          </div>
        </div>
      </div>

      {filtered.map(({ category, items }) => (
        <div key={category} className="mb-7">
          <h2 className="font-poppins font-semibold text-dark-gray mb-3">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(({ icon: Icon, label, desc, href, color, badge }) => (
              <Link key={label} href={href}
                className="card p-5 hover:shadow-lg transition-all group flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${color}15` }}>
                  <Icon className="text-xl" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-dark-gray text-sm">{label}</p>
                    {badge && <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-primary text-white">{badge}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FiGrid className="text-5xl mx-auto mb-3 text-gray-300" />
          <p>No features match your search</p>
        </div>
      )}
    </div>
  )
}
