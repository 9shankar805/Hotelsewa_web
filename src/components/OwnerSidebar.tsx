'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiGrid, FiCalendar, FiDollarSign, FiStar, FiImage, FiSettings, FiLogOut, FiBarChart2, FiTag, FiShoppingBag, FiFileText, FiBell, FiMessageSquare, FiMenu, FiX, FiCheckSquare, FiCreditCard, FiZap, FiLayers, FiTrendingUp } from 'react-icons/fi'
import { MdHotel, MdBedroomParent, MdQrCode2 } from 'react-icons/md'
import { logout, getUser } from '@/lib/auth'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/owner/dashboard', icon: FiGrid, label: 'Dashboard' },
  { href: '/owner/hotel-profile', icon: MdHotel, label: 'Hotel Profile' },
  { href: '/owner/bookings', icon: FiCalendar, label: 'Bookings' },
  { href: '/owner/calendar', icon: FiCalendar, label: 'Calendar' },
  { href: '/owner/checkin', icon: FiCheckSquare, label: 'Check-in' },
  { href: '/owner/rooms', icon: MdBedroomParent, label: 'Rooms' },
  { href: '/owner/room-types', icon: FiLayers, label: 'Room Types' },
  { href: '/owner/rate-plans', icon: FiTag, label: 'Rate Plans' },
  { href: '/owner/earnings', icon: FiDollarSign, label: 'Earnings' },
  { href: '/owner/withdrawals', icon: FiCreditCard, label: 'Withdrawals' },
  { href: '/owner/analytics', icon: FiBarChart2, label: 'Analytics' },
  { href: '/owner/pricing', icon: FiTrendingUp, label: 'Pricing' },
  { href: '/owner/reviews', icon: FiStar, label: 'Reviews' },
  { href: '/owner/offers', icon: FiTag, label: 'Offers' },
  { href: '/owner/orders', icon: FiShoppingBag, label: 'Orders' },
  { href: '/owner/menu', icon: FiZap, label: 'Menu & Ordering' },
  { href: '/owner/gallery', icon: FiImage, label: 'Gallery' },
  { href: '/owner/amenities', icon: FiGrid, label: 'Amenities' },
  { href: '/owner/messaging', icon: FiMessageSquare, label: 'Messaging' },
  { href: '/owner/chat', icon: FiMessageSquare, label: 'Live Chat' },
  { href: '/owner/reports', icon: FiFileText, label: 'Reports' },
  { href: '/owner/tax-reports', icon: FiFileText, label: 'Tax Reports' },
  { href: '/owner/documents', icon: FiFileText, label: 'Documents' },
  { href: '/owner/notifications', icon: FiBell, label: 'Notifications' },
  { href: '/owner/advanced', icon: MdQrCode2, label: 'Advanced' },
  { href: '/owner/settings', icon: FiSettings, label: 'Settings' },
]

export default function OwnerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [collapsed, setCollapsed] = useState(false)

  // Read cookies only on client to avoid hydration mismatch
  useEffect(() => {
    setUser(getUser())
  }, [])
  async function handleLogout() {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    toast.success('Logged out')
    router.push('/')
  }

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-primary">
        {collapsed ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 shadow-card z-40 transition-all duration-300 flex flex-col
        ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <MdHotel className="text-white text-lg" />
            </div>
            {!collapsed && <span className="font-poppins font-extrabold text-primary text-lg">HOTELSEWA</span>}
          </div>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-primary font-bold">{user?.name?.[0]?.toUpperCase() || 'O'}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-dark-gray truncate">{user?.name || 'Hotel Owner'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`sidebar-item ${active ? 'active' : 'text-gray-600'}`}
                title={collapsed ? label : undefined}>
                <Icon className="text-lg flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout}
            className="sidebar-item w-full text-red-500 hover:bg-red-50"
            title={collapsed ? 'Logout' : undefined}>
            <FiLogOut className="text-lg flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
